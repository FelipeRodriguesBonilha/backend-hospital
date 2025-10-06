import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ArrayNotEmpty } from 'class-validator';

export class JoinRoomDto {
    @ApiProperty()
    @IsUUID()
    roomId: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    userIds: string[];
}