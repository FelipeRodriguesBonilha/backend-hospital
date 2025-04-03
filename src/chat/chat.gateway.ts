import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from 'src/message/__dtos__/create-message.dto';
import { MessageService } from 'src/message/message.service';
import { ConnectRoomDto } from 'src/room-user/__dtos__/connect-room.dto';
import { JoinRoomDto } from 'src/room-user/__dtos__/join-room.dto';
import { LeaveRoomDto } from 'src/room-user/__dtos__/leave-room.dto';
import { RoomService } from 'src/room/room.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private roomService: RoomService
  ) { }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    const user = await this.userService.findById(userId);

    if (user) {
      const rooms = await this.roomService.findAllRoomsByUser(user.id);

      client.emit('rooms', rooms);
    }
  }

  @SubscribeMessage('connect-room')
  async connectRoom(@MessageBody() connectRoomDto: ConnectRoomDto, @ConnectedSocket() client: Socket) {
    const user = await this.userService.findById(connectRoomDto.userId);

    if (user) {
      client.join(connectRoomDto.roomId);

      const usersInRoom = await this.roomService.findAllUsersInRoom(connectRoomDto.roomId);
      const messages = await this.messageService.findAllMessagesByRoom(connectRoomDto.roomId);

      //lista atualizada de participantes para todos que estão na sala
      this.server.to(connectRoomDto.roomId).emit('users-in-room', usersInRoom);
      client.emit('room-messages', messages);
    }
  }


  @SubscribeMessage('join-room')
  async joinRoom(@MessageBody() joinRoomDto: JoinRoomDto, @ConnectedSocket() client: Socket) {
    await this.roomService.joinRoom(joinRoomDto);

    client.join(joinRoomDto.roomId);

    const usersInRoom = await this.roomService.findAllUsersInRoom(joinRoomDto.roomId);

    //lista atualizada de participantes para todos que estão na sala
    this.server.to(joinRoomDto.roomId).emit('users-in-room', usersInRoom);
  }

  @SubscribeMessage('leave-room')
  async leaveRoom(@MessageBody() leaveRoomDto: LeaveRoomDto, @ConnectedSocket() client: Socket) {
    await this.roomService.leaveRoom(leaveRoomDto);

    client.leave(leaveRoomDto.roomId);

    const usersInRoom = await this.roomService.findAllUsersInRoom(leaveRoomDto.roomId);

    this.server.to(leaveRoomDto.roomId).emit('users-in-room', usersInRoom);
  }


  @SubscribeMessage('send-message')
  async sendMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto)

    //emite a nova mensagem para todos que estão na sala
    this.server.to(createMessageDto.roomId).emit('new-message', message);
  }
}
