import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class DisconnectRoomDto {
    @ApiProperty()
    @IsUUID()
    roomId: string;
}