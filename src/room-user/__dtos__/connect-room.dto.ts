import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class ConnectRoomDto {
    @ApiProperty()
    @IsUUID()
    roomId: string;
}