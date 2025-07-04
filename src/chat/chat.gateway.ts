import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Message, RoomUser } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { LoginPayloadDto } from 'src/auth/__dtos__/login-payload.dto';
import { ConnectRoomDto } from 'src/chat/__dtos__/connect-room.dto';
import { CreateMessageDto } from 'src/message/__dtos__/create-message.dto';
import { ReturnMessageDto } from 'src/message/__dtos__/return-message.dto';
import { MessageService } from 'src/message/message.service';
import { JoinRoomDto } from 'src/room-user/__dtos__/join-room.dto';
import { LeaveRoomDto } from 'src/room-user/__dtos__/leave-room.dto';
import { ReturnRoomUserDto } from 'src/room-user/__dtos__/return-room-user.dto';
import { RoomService } from 'src/room/room.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name)

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private roomService: RoomService,
    private jwtService: JwtService
  ) { }

  async handleConnection(
    client: Socket
  ) {
    try {
      const authorization = client.handshake.auth.authorization;

      this.logger.verbose(`Token recebido: ${authorization}`);

      const loginPayload: LoginPayloadDto | undefined = await this.jwtService.verifyAsync(
        authorization,
        { secret: process.env.JWT_SECRET }).catch((err) => {
          this.logger.warn('Falha ao verificar o token');
          return undefined;
        });

      if (!loginPayload) {
        this.logger.warn('Token inválido');
        throw new ForbiddenException('Token inválido!');
      }

      this.logger.debug(`Payload decodificado: ${JSON.stringify(loginPayload)}`);

      const user = await this.userService.findById(loginPayload.id);

      console.log(user);

      if (!user) {
        this.logger.warn(`Usuário não encontrado com ID: ${loginPayload.id}`);
        throw new NotFoundException('Usuário não encontrado!');
      }

      client.data.userId = user.id;

      client.join(user.id);

      this.logger.log(`Usuário conectado: ${user.name} (${user.id})`);

      const roomsUser: ReturnRoomUserDto[] = (await this.roomService.findAllRoomsByUser(user.id)).map(
        (roomUser: RoomUser) => new ReturnRoomUserDto(roomUser)
      );

      client.emit('rooms', roomsUser);

    } catch (error) {
      this.logger.error(`Erro ao conectar usuário: ${error?.message}`);
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Usuário desconectado: ${client.data?.userId || 'desconhecido'}`);
  }

  @SubscribeMessage('connect-room')
  async connectRoom(
    @MessageBody() connectRoomDto: ConnectRoomDto, 
    @ConnectedSocket() client: Socket
  ) {
    try {
      this.logger.verbose(`Solicitação para conectar à sala: ${JSON.stringify(connectRoomDto)}`);
      const userId = client.data.userId;

      const user = await this.userService.findById(userId);

      if (!user) {
        this.logger.warn(`Usuário não encontrado ao tentar se conectar: ${userId}`);
        throw new NotFoundException('Usuário não encontrado!');
      }

      const room = await this.roomService.findById(connectRoomDto.roomId, userId);

      if (!room) {
        this.logger.warn(`Sala não encontrada ao tentar se conectar: ${room.name}`);
        throw new NotFoundException('Sala não encontrada!');
      }

      client.join(connectRoomDto.roomId);
      this.logger.log(`Usuário ${user.name} entrou na sala ${connectRoomDto.roomId}`);

      const usersInRoom = (await this.roomService.findAllUsersInRoom(connectRoomDto.roomId)).map(
        (roomUser: RoomUser) => new ReturnRoomUserDto(roomUser),
      );

      const messages = await Promise.all(
        (await this.messageService.findAllMessagesByRoom(connectRoomDto.roomId, userId)).map(
          async (message: Message) => {
            const messageDto = new ReturnMessageDto(message);

            messageDto.seenByAll = await this.messageService.isMessageSeenByAllUsers(message.id, connectRoomDto.roomId);

            return messageDto;
          }
        )
      );

      this.logger.debug(`Sala ${connectRoomDto.roomId} possui ${usersInRoom.length} usuários e ${messages.length} mensagens`);

      this.server.to(connectRoomDto.roomId).emit('users-in-room', usersInRoom);
      client.emit('room-messages', messages);
    } catch (error) {
      this.logger.error(`Erro ao conectar à sala: ${error?.message}`);
    }
  }

  @SubscribeMessage('disconnect-room')
  async disconnectRoom(
    @MessageBody() connectRoomDto: ConnectRoomDto, 
    @ConnectedSocket() client: Socket
  ) {
    try {
      this.logger.verbose(`Solicitação para sair da sala: ${connectRoomDto.roomId}`);
      const userId = client.data.userId;

      const user = await this.userService.findById(userId);

      if (!user) {
        this.logger.warn(`Usuário não encontrado ao sair da sala: ${userId}`);
        throw new NotFoundException('Usuário não encontrado!');
      }

      client.leave(connectRoomDto.roomId);

      const usersInRoom = (await this.roomService.findAllUsersInRoom(connectRoomDto.roomId)).map(
        (roomUser: RoomUser) => new ReturnRoomUserDto(roomUser),
      );

      this.logger.debug(`Usuário ${user.name} saiu da sala ${connectRoomDto.roomId}`);

      this.server.to(connectRoomDto.roomId).emit('users-in-room', usersInRoom);
    } catch (error) {
      this.logger.error(`Erro ao sair da sala: ${error?.message}`);
    }
  }

  @SubscribeMessage('join-room')
  async joinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto, 
    @ConnectedSocket() client: Socket
  ) {
    try {
      this.logger.verbose(`Usuário solicitou entrada na sala: ${JSON.stringify(joinRoomDto)}`);
      const userId = client.data.userId;
      const user = await this.userService.findById(userId);

      if (!user) {
        this.logger.warn(`Usuário não encontrado ao entrar na sala: ${userId}`);
        throw new NotFoundException('Usuário não encontrado!');
      }

      await this.roomService.joinRoom(joinRoomDto, userId);
      client.join(joinRoomDto.roomId);

      const usersInRoom = (await this.roomService.findAllUsersInRoom(joinRoomDto.roomId)).map(
        (roomUser: RoomUser) => new ReturnRoomUserDto(roomUser),
      );

      this.logger.log(`Usuário ${user.name} entrou na sala ${joinRoomDto.roomId} com sucesso`);

      this.server.to(joinRoomDto.roomId).emit('users-in-room', usersInRoom);
    } catch (error) {
      this.logger.error(`Erro ao entrar na sala: ${error?.message}`);
    }
  }

  @SubscribeMessage('leave-room')
  async leaveRoom(
    @MessageBody() leaveRoomDto: LeaveRoomDto, 
    @ConnectedSocket() client: Socket
  ) {
    try {
      this.logger.verbose(`Usuário solicitou saída da sala: ${JSON.stringify(leaveRoomDto)}`);
      const userId = client.data.userId;
      const user = await this.userService.findById(userId);

      if (!user) {
        this.logger.warn(`Usuário não encontrado ao sair da sala: ${userId}`);
        throw new NotFoundException('Usuário não encontrado!');
      }

      await this.roomService.leaveRoom(leaveRoomDto, userId);
      client.leave(leaveRoomDto.roomId);

      const usersInRoom = (await this.roomService.findAllUsersInRoom(leaveRoomDto.roomId)).map(
        (roomUser: RoomUser) => new ReturnRoomUserDto(roomUser),
      );

      this.logger.log(`Usuário ${user.name} saiu da sala ${leaveRoomDto.roomId}`);

      this.server.to(leaveRoomDto.roomId).emit('users-in-room', usersInRoom);
    } catch (error) {
      this.logger.error(`Erro ao sair da sala: ${error?.message}`);
    }
  }

  @SubscribeMessage('send-message')
  async sendMessage(
    @MessageBody() createMessageDto: CreateMessageDto, 
    @ConnectedSocket() client: Socket
  ) {
    try {
      this.logger.verbose(`Mensagem recebida para a sala: ${JSON.stringify(createMessageDto)}`);
      const userId = client.data.userId;
      const user = await this.userService.findById(userId);

      if (!user) {
        this.logger.warn(`Usuário não encontrado ao enviar mensagem: ${userId}`);
        throw new NotFoundException('Usuário não encontrado!');
      }

      const createdMessage = await this.messageService.create(createMessageDto, userId);

      const seenByAll = await this.messageService.isMessageSeenByAllUsers(
        createdMessage.id,
        createMessageDto.roomId
      );

      const message = new ReturnMessageDto(createdMessage);
      message.seenByAll = seenByAll;

      this.logger.log(`Mensagem enviada para sala ${createMessageDto.roomId} por ${user.name}`);

      this.server.to(createMessageDto.roomId).emit('new-message', message);

      const usersInRoom: ReturnRoomUserDto[] = (await this.roomService.findAllUsersInRoom(createMessageDto.roomId)).map(
        (roomUser: RoomUser) => new ReturnRoomUserDto(roomUser),
      );

      await this.updateRoomsForUsers(usersInRoom);
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem: ${error?.message}`);
    }
  }

  private async updateRoomsForUsers(users: ReturnRoomUserDto[]) {
    this.logger.debug(`Atualizando salas para ${users.length} usuário(s)`);

    await Promise.all(
      users.map(async (user) => {
        const userRooms = (await this.roomService.findAllRoomsByUser(user.id)).map(
          (roomUser: RoomUser) => new ReturnRoomUserDto(roomUser),
        );

        this.logger.verbose(`Emitindo salas atualizadas para usuário ${user.id}`);

        this.server.to(user.id).emit('rooms', userRooms);
      }),
    );
  }

  @SubscribeMessage('read-messages')
  async handleReadMessages(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data.userId;
      const user = await this.userService.findById(userId);

      if (!user) {
        throw new NotFoundException('Usuário não encontrado!');
      }

      await this.messageService.markAllMessagesNotReadAsRead(data.roomId, userId);
      this.logger.log(`Mensagens da sala ${data.roomId} marcadas como lidas pelo usuário ${userId}`);

      const messagesInRoom = await this.messageService.findAllMessagesByRoom(data.roomId, userId);

      await Promise.all(messagesInRoom.map(async (message) => {
        const seenByAll = await this.messageService.isMessageSeenByAllUsers(message.id, data.roomId);

        if (seenByAll) {
          this.server.to(data.roomId).emit('message-seen-by-all', {
            messageId: message.id,
            seenByAll
          });
        }
      }));

    } catch (error) {
      this.logger.error(`Erro ao marcar mensagens como lidas: ${error?.message}`);
    }
  }
}