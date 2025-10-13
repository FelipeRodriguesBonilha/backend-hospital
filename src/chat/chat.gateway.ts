import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Message, Room, User } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { LoginPayloadDto } from 'src/auth/__dtos__/login-payload.dto';
import { ConnectRoomDto } from 'src/chat/__dtos__/connect-room.dto';
import { CreateMessageDto } from 'src/message/__dtos__/create-message.dto';
import { ReturnMessageDto } from 'src/message/__dtos__/return-message.dto';
import { MessageService } from 'src/message/message.service';
import { Role } from 'src/role/enum/role.enum';
import { JoinRoomDto } from 'src/room-user/__dtos__/join-room.dto';
import { LeaveRoomDto } from 'src/room-user/__dtos__/leave-room.dto';
import { RemoveUserDto } from 'src/room-user/__dtos__/remove-user.dto';
import { CreateRoomDto } from 'src/room/__dtos__/create-room.dto';
import { ReturnRoomDto } from 'src/room/__dtos__/return-room.dto';
import { UpdateRoomDto } from 'src/room/__dtos__/update-room.dto';
import { RoomService } from 'src/room/room.service';
import { CreateUserDto } from 'src/user/__dtos__/create-user.dto';
import { ReturnUserDto } from 'src/user/__dtos__/return-user.dto';
import { UpdateProfileDto } from 'src/user/__dtos__/update-profile.dto';
import { UpdateUserDto } from 'src/user/__dtos__/update-user.dto';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: true })
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly roomService: RoomService,
    private readonly jwtService: JwtService,
  ) { }

  private getTokenFromSocket(socket: Socket): string | undefined {
    const rawAuth = (socket.handshake.auth?.authorization as string | undefined) ||
      (socket.handshake.headers?.authorization as string | undefined);

    if (!rawAuth) return undefined;
    if (rawAuth.startsWith('Bearer ')) return rawAuth.slice(7);
    return rawAuth;
  }

  private async getUserFromClient(client: Socket): Promise<User> {
    const userId = (client.data as any)?.userId as string | undefined;
    if (!userId) throw new WsException('Usuário não autenticado');

    const user = await this.userService.findByIdWithoutAccessControl(userId);
    if (!user) throw new WsException('Usuário não encontrado');
    return user;
  }

  private mapUsersToDto(users: User[]): ReturnUserDto[] {
    return users.map((u) => new ReturnUserDto(u));
  }

  private mapRoomsToDto(rooms: Room[]): ReturnRoomDto[] {
    return rooms.map((r) => new ReturnRoomDto(r));
  }

  private async emitRoomsToUser(userId: string): Promise<void> {
    const rooms = this.mapRoomsToDto(await this.roomService.findAllRoomsByUser(userId));
    this.server.to(userId).emit('rooms', rooms);
  }

  private async emitUsersInRoom(roomId: string, actingUserId: string): Promise<void> {
    const inRoom = await this.userService.findAllUsersInRoom(roomId, actingUserId);
    this.server.to(roomId).emit('users-in-room', this.mapUsersToDto(inRoom));
  }

  private async emitUsersNotInRoom(hospitalId: string): Promise<void> {
    const admins = await this.userService.findByHospitalAdminsRooms(hospitalId);

    await Promise.all(
      admins.map(async (admin) => {
        for (const room of admin.adminRooms) {
          const usersNotInRoom = await this.userService.findUsersNotInRoom(room.id, hospitalId, admin.id);
          this.server.to(room.id).emit('users-not-in-room', this.mapUsersToDto(usersNotInRoom));
        }
      }),
    );
  }

  private async emitSeenByAllForMessages(roomId: string, actorUserId: string, messages?: Message[]): Promise<void> {
    const msgs = messages ?? (await this.messageService.findAllMessagesByRoomWithoutAccessControl(roomId));
    await Promise.all(
      msgs.map(async (m) => {
        const seenByAll = await this.messageService.isMessageSeenByAllUsersWithoutAccessControl(m.id, roomId);
        if (seenByAll !== null && seenByAll !== undefined) {
          this.server.to(roomId).emit('message-seen-by-all', { messageId: m.id, seenByAll });
        }
      }),
    );
  }

  afterInit(server: Server) {
    server.use(async (socket, next) => {
      try {
        const token = this.getTokenFromSocket(socket);
        if (!token) return next(new Error('Token não fornecido'));

        const payload = await this.jwtService.verifyAsync<LoginPayloadDto>(token, { secret: process.env.JWT_SECRET });
        if (!payload?.id) return next(new Error('Token inválido'));

        const user = await this.userService.findByIdWithoutAccessControl(payload.id);
        if (!user) return next(new Error('Usuário não encontrado'));

        socket.data.userId = user.id;
        socket.join(user.id);
        next();
      } catch (err) {
        next(err);
      }
    });
  }

  async handleConnection(client: Socket) {
    try {
      const userId = client.data?.userId as string | undefined;
      if (!userId) {
        client.emit('error', { message: 'Não autenticado' });
        return client.disconnect();
      }

      const user = await this.userService.findByIdWithoutAccessControl(userId);
      if (!user) {
        client.emit('error', { message: 'Usuário não encontrado!' });
        return client.disconnect();
      }

      this.logger.log(`Usuário conectado: ${user.name} (${user.id})`);
    } catch (error) {
      this.logger.error(`Erro ao conectar usuário: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro desconhecido' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Usuário desconectado: ${(client.data as any)?.userId || 'desconhecido'}`);
  }

  @SubscribeMessage('connect-room')
  async connectRoom(@MessageBody() dto: ConnectRoomDto, @ConnectedSocket() client: Socket) {
    try {
      this.logger.verbose(`connect-room: ${JSON.stringify(dto)}`);
      const user = await this.getUserFromClient(client);

      const room = await this.roomService.findById(dto.roomId, user.id);
      if (!room) return client.emit('error', { message: 'Sala não encontrada!' });

      client.join(dto.roomId);
    } catch (error) {
      this.logger.error(`Erro ao conectar à sala: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao conectar à sala' });
    }
  }

  @SubscribeMessage('disconnect-room')
  async disconnectRoom(@MessageBody() dto: ConnectRoomDto, @ConnectedSocket() client: Socket) {
    try {
      this.logger.verbose(`disconnect-room: ${dto.roomId}`);
      const user = await this.getUserFromClient(client);

      client.leave(dto.roomId);

      this.logger.debug(`Usuário ${user.name} saiu da sala ${dto.roomId}`);
    } catch (error) {
      this.logger.error(`Erro ao desconectar da sala: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao sair da sala' });
    }
  }

  @SubscribeMessage('get-rooms')
  async getRooms(@ConnectedSocket() client: Socket) {
    try {
      const user = await this.getUserFromClient(client);
      const rooms = this.mapRoomsToDto(await this.roomService.findAllRoomsByUser(user.id));
      client.emit('rooms', rooms);
    } catch (error) {
      this.logger.error(`Erro ao obter salas: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao obter salas' });
    }
  }

  @SubscribeMessage('get-room-messages')
  async getMessages(@MessageBody() dto: ConnectRoomDto, @ConnectedSocket() client: Socket) {
    try {
      const user = await this.getUserFromClient(client);

      const room = await this.roomService.findById(dto.roomId, user.id);
      if (!room) return client.emit('error', { message: 'Sala não encontrada!' });

      const rawMessages = await this.messageService.findAllMessagesByRoom(dto.roomId, user.id);
      const messages = await Promise.all(
        rawMessages.map(async (m) => {
          const msg = new ReturnMessageDto(m);
          msg.seenByAll = await this.messageService.isMessageSeenByAllUsers(m.id, dto.roomId, user.id);
          return msg;
        }),
      );

      client.emit('room-messages', messages);
    } catch (error) {
      this.logger.error(`Erro ao obter mensagens: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao obter mensagens' });
    }
  }

  @SubscribeMessage('get-users-in-room')
  async getUsersInRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    try {
      const user = await this.getUserFromClient(client);
      this.emitUsersInRoom(data.roomId, user.id);
    } catch (error) {
      this.logger.error(`Erro ao obter usuários na sala: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao obter usuários na sala' });
    }
  }

  @SubscribeMessage('get-users-not-in-room')
  async getUsersNotInRoom(@ConnectedSocket() client: Socket) {
    try {
      const user = await this.getUserFromClient(client);
      await this.emitUsersNotInRoom(user.hospitalId);
    } catch (error) {
      this.logger.error(`Erro ao obter usuários na sala: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao obter usuários na sala' });
    }
  }

  @SubscribeMessage('join-room')
  async joinRoom(@MessageBody() dto: JoinRoomDto, @ConnectedSocket() client: Socket) {
    try {
      const admin = await this.getUserFromClient(client);
      this.logger.verbose(`Admin ${admin.name} adicionando usuários à sala ${dto.roomId}: ${JSON.stringify(dto.userIds)}`);

      await this.roomService.joinRoom(dto, admin.id);

      await Promise.all(
        dto.userIds.map(async (uId) => this.emitRoomsToUser(uId)),
      );

      const msgs = await this.messageService.findAllMessagesByRoom(dto.roomId, admin.id);
      await this.emitSeenByAllForMessages(dto.roomId, admin.id, msgs);

      await this.emitUsersInRoom(dto.roomId, admin.id);
      await this.emitUsersNotInRoom(admin.hospitalId);

      this.logger.log(`Usuários adicionados à sala ${dto.roomId} com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao adicionar usuários à sala: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao adicionar usuários à sala' });
    }
  }

  @SubscribeMessage('create-room')
  async handleCreateRoom(@MessageBody() dto: CreateRoomDto, @ConnectedSocket() client: Socket) {
    try {
      const user = await this.getUserFromClient(client);
      this.logger.verbose(`Criando nova sala: ${JSON.stringify(dto)}`);

      const room = new ReturnRoomDto(await this.roomService.create(dto, user.id));
      client.emit('room-created', room);

      await this.emitRoomsToUser(user.id);
      this.logger.log(`Sala criada: ${room.name} (${room.id}) por ${user.name}`);
    } catch (error) {
      this.logger.error(`Erro ao criar sala: ${error?.message}`);
      client.emit('error', { message: 'Erro ao criar sala' });
    }
  }

  @SubscribeMessage('leave-room')
  async leaveRoom(@MessageBody() dto: LeaveRoomDto, @ConnectedSocket() client: Socket) {
    try {
      const user = await this.getUserFromClient(client);
      this.logger.verbose(`leave-room: ${JSON.stringify(dto)}`);

      await this.roomService.leaveRoom(dto, user.id);
      client.leave(dto.roomId);

      const inRoom = await this.userService.findAllUsersInRoom(dto.roomId, user.id).catch(() => undefined);
      const rooms = this.mapRoomsToDto(await this.roomService.findAllRoomsByUser(user.id));

      if (!inRoom) {
        this.server.to(user.id).emit('rooms', rooms);
        return;
      }

      await Promise.all(inRoom.map(async (u: User) => this.emitRoomsToUser(u.id)));

      const msgs = await this.messageService.findAllMessagesByRoomWithoutAccessControl(dto.roomId);
      await this.emitSeenByAllForMessages(dto.roomId, user.id, msgs);

      await this.emitUsersInRoom(dto.roomId, user.id);
      await this.emitUsersNotInRoom(user.hospitalId);

      this.server.to(user.id).emit('rooms', rooms);
      this.logger.log(`Usuário ${user.name} saiu da sala ${dto.roomId}`);
    } catch (error) {
      this.logger.error(`Erro ao sair da sala: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao sair da sala' });
    }
  }

  @SubscribeMessage('remove-user')
  async handleRemoveUser(@MessageBody() dto: RemoveUserDto, @ConnectedSocket() client: Socket) {
    try {
      const admin = await this.getUserFromClient(client);
      this.logger.verbose(`Admin ${admin.name} removendo usuário ${dto.userId} da sala ${dto.roomId}`);

      const { removedUserId } = await this.roomService.removeUserFromRoom(dto, admin.id);

      this.server.in(removedUserId).socketsLeave(dto.roomId);

      await this.emitRoomsToUser(removedUserId);
      this.server.to(removedUserId).emit('removed-from-room', { roomId: dto.roomId });

      const msgs = await this.messageService.findAllMessagesByRoom(dto.roomId, admin.id);
      await this.emitSeenByAllForMessages(dto.roomId, admin.id, msgs);

      await this.emitUsersInRoom(dto.roomId, admin.id);
      await this.emitUsersNotInRoom(admin.hospitalId);

      this.logger.log(`Usuário ${removedUserId} removido da sala ${dto.roomId} por ${admin.name}`);
    } catch (error) {
      this.logger.error(`Erro ao remover usuário da sala: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao remover usuário da sala' });
    }
  }

  @SubscribeMessage('send-message')
  async sendMessage(@MessageBody() dto: CreateMessageDto, @ConnectedSocket() client: Socket) {
    try {
      this.logger.verbose(`send-message para sala ${dto.roomId} (len=${dto.content?.length ?? 0})`);
      const user = await this.getUserFromClient(client);

      const created = await this.messageService.create(dto, user.id);
      const message = new ReturnMessageDto(created);
      message.seenByAll = await this.messageService.isMessageSeenByAllUsers(created.id, dto.roomId, user.id);

      this.server.to(dto.roomId).emit('new-message', message);

      this.logger.log(`Mensagem enviada para sala ${dto.roomId} por ${user.name}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao enviar mensagem' });
    }
  }

  @SubscribeMessage('read-messages')
  async handleReadMessages(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    try {
      const user = await this.getUserFromClient(client);
      await this.messageService.markAllMessagesNotReadAsRead(data.roomId, user.id);
      await this.emitSeenByAllForMessages(data.roomId, user.id);
      this.logger.log(`Mensagens da sala ${data.roomId} marcadas como lidas por ${user.id}`);
    } catch (error) {
      this.logger.error(`Erro ao marcar mensagens como lidas: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao marcar mensagens como lidas' });
    }
  }

  @SubscribeMessage('create-user')
  async handleCreateUser(@MessageBody() dto: CreateUserDto, @ConnectedSocket() client: Socket) {
    try {
      const actor = await this.getUserFromClient(client);
      const created = await this.userService.create(dto, actor.id);
      this.logger.log(`Usuário criado: ${created.name} (${created.id})`);

      const hospitalId = actor.hospitalId && !((actor as any).role?.name === Role.AdministradorGeral) ? actor.hospitalId : dto.hospitalId;
      if (hospitalId) await this.emitUsersNotInRoom(hospitalId);

      client.emit('user-created', new ReturnUserDto(created));
    } catch (error) {
      this.logger.error(`Erro ao criar usuário: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao criar usuário' });
    }
  }

  @SubscribeMessage('update-user')
  async handleUpdateUser(
    @MessageBody() data: { id: string; updateUserDto: UpdateUserDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const actor = await this.getUserFromClient(client);
      const updated = await this.userService.update(data.id, data.updateUserDto, actor.id);
      this.logger.log(`Usuário atualizado: ${updated.name} (${updated.id})`);

      const rooms = await this.roomService.findAllRoomsByUser(actor.id);
      await Promise.all(
        rooms.map((r) => this.emitUsersInRoom(r.id, actor.id))
      );

      const hospitalId = actor.hospitalId && !((actor as any).role?.name === Role.AdministradorGeral) ? actor.hospitalId : data.updateUserDto.hospitalId;
      if (hospitalId) await this.emitUsersNotInRoom(hospitalId);

      client.emit('user-updated', new ReturnUserDto(updated));
    } catch (error) {
      this.logger.error(`Erro ao atualizar usuário: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao atualizar usuário' });
    }
  }

  @SubscribeMessage('delete-user')
  async handleDeleteUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const actor = await this.getUserFromClient(client);

      const deleted = await this.userService.remove(userId, actor.id);
      this.logger.log(`Usuário removido: ${deleted.name} (${deleted.id})`);

      this.server.in(deleted.id).disconnectSockets(true);

      const rooms = await this.roomService.findAllRoomsByUser(actor.id);
      await Promise.all(
        rooms.map((r) => this.emitUsersInRoom(r.id, actor.id))
      );

      const hospitalId = actor.hospitalId && !((actor as any).role?.name === Role.AdministradorGeral) ? actor.hospitalId : deleted.hospitalId;
      if (hospitalId) await this.emitUsersNotInRoom(hospitalId);

      client.emit('user-deleted', new ReturnUserDto(deleted));
    } catch (error) {
      this.logger.error(`Erro ao remover usuário: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao remover usuário' });
    }
  }


  @SubscribeMessage('update-profile')
  async handleUpdateProfile(@MessageBody() dto: UpdateProfileDto, @ConnectedSocket() client: Socket) {
    try {
      const actor = await this.getUserFromClient(client);
      const updated = await this.userService.updateProfile(dto, actor.id);
      this.logger.log(`Perfil atualizado: ${updated.name} (${updated.id})`);

      const rooms = await this.roomService.findAllRoomsByUser(actor.id);
      await Promise.all(
        rooms.map((r) => this.emitUsersInRoom(r.id, actor.id))
      );

      if (actor.hospitalId && !((actor as any).role?.name === Role.AdministradorGeral)) {
        await this.emitUsersNotInRoom(actor.hospitalId);
      }

      client.emit('user-updated', new ReturnUserDto(updated));
    } catch (error) {
      this.logger.error(`Erro ao atualizar usuário: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao atualizar usuário' });
    }
  }

  @SubscribeMessage('update-room')
  async handleUpdateRoom(
    @MessageBody() data: { id: string; updateRoomDto: UpdateRoomDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const actor = await this.getUserFromClient(client);
      this.logger.verbose(`Atualizando sala ${data.id}: ${JSON.stringify(data.updateRoomDto)}`);

      const updatedRoom = new ReturnRoomDto(await this.roomService.update(data.id, data.updateRoomDto, actor.id));
      client.emit('room-updated', updatedRoom);

      const inRoom = await this.userService.findAllUsersInRoom(data.id, actor.id);
      await Promise.all(inRoom.map(async (u: User) => this.emitRoomsToUser(u.id)));

      this.logger.log(`Sala atualizada: ${updatedRoom.name} (${updatedRoom.id})`);
    } catch (error) {
      this.logger.error(`Erro ao atualizar sala: ${error?.message}`);
      client.emit('error', { message: error?.message || 'Erro ao atualizar sala' });
    }
  }
}