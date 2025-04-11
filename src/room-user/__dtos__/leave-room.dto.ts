import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class LeaveRoomDto {
    @ApiProperty()
    @IsUUID()
    roomId: string;
}