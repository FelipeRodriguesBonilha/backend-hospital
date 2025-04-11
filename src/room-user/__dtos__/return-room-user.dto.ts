import { Room, RoomUser, User } from "@prisma/client";
import { ReturnRoomDto } from "src/room/__dtos__/return-room.dto";
import { ReturnUserDto } from "src/user/__dtos__/return-user.dto";

export class ReturnRoomUserDto {
    id: string;
    roomId: string;
    userId: string;
    room: ReturnRoomDto;
    user: ReturnUserDto;

    constructor(
        roomUser: RoomUser & { room?: Room, user?: User }
    ) {
        this.id = roomUser.id;
        this.roomId = roomUser.roomId;
        this.userId = roomUser.userId;
        this.room = roomUser.room ? new ReturnRoomDto(roomUser?.room) : undefined;
        this.user = roomUser.user ? new ReturnUserDto(roomUser?.user) : undefined;
    }
}