import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoomDto {
    @ApiProperty({ description: 'ID do hospital relacionado à sala', example: 'uuid-do-hospital' })
    @IsString()
    @IsNotEmpty()
    hospitalId: string;

    @ApiProperty({ description: 'ID do administrador da sala', example: 'uuid-do-admin' })
    @IsString()
    @IsNotEmpty()
    adminId: string;

    @ApiProperty({ description: 'Nome da sala', example: 'Sala de atendimento Dr. José' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Descrição da sala', example: 'Sala destinada a consultas de rotina com o Dr. José' })
    @IsString()
    @IsNotEmpty()
    description: string;
}