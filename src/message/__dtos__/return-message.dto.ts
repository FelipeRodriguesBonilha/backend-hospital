import { Message, Room, User } from "@prisma/client";
import { ReturnRoomDto } from "src/room/__dtos__/return-room.dto";
import { ReturnUserDto } from "src/user/__dtos__/return-user.dto";

export class ReturnMessageDto {
    id: string;
    content: string;
    senderId: string;
    roomId: string;
    createdAt?: Date;

    sender: ReturnUserDto;
    room: ReturnRoomDto;

    seenByAll?: boolean;

    constructor(
        message: Message & { room?: Room, sender?: User }
    ) {
        this.id = message.id;
        this.content = message.content;
        this.senderId = message.senderId;
        this.roomId = message.roomId;
        this.createdAt = message.createdAt;
        this.room = message.room ? new ReturnRoomDto(message.room) : undefined;
        this.sender = message.sender ? new ReturnUserDto(message.sender) : undefined;
    }
}