import { Archive, Message, Room, User } from "@prisma/client";
import { ReturnArchiveDto } from "src/archive/__dtos__/return-archive.dto";
import { ReturnRoomDto } from "src/room/__dtos__/return-room.dto";
import { ReturnUserDto } from "src/user/__dtos__/return-user.dto";

export class ReturnMessageDto {
    id: string;
    content: string;
    senderId: string;
    roomId: string;
    createdAt?: Date;

    sender?: ReturnUserDto;
    room?: ReturnRoomDto;
    archives?: ReturnArchiveDto[];

    seenByAll?: boolean;

    constructor(
        message: Message & { room?: Room, sender?: User, archives?: Archive[] }
    ) {
        this.id = message.id;
        this.content = message.content;
        this.senderId = message.senderId;
        this.roomId = message.roomId;
        this.createdAt = message.createdAt;

        this.room = message.room ? new ReturnRoomDto(message.room) : undefined;
        this.sender = message.sender ? new ReturnUserDto(message.sender) : undefined;
        this.archives = message.archives ? message.archives.map((archive) => new ReturnArchiveDto(archive)) : undefined;
    }
}