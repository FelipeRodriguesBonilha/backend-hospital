import { IsUUID } from 'class-validator';

export class RemoveUserDto {
    @IsUUID()
    roomId: string;

    @IsUUID()
    userId: string;
}