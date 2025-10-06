import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateRoomDto {
    @ApiProperty({ description: 'ID do hospital relacionado à sala', example: 'uuid-do-hospital' })
    @IsString()
    @IsNotEmpty()
    hospitalId: string;

    @ApiProperty({ description: 'Nome da sala', example: 'Sala de atendimento Dr. José' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'O nome da sala deve ter pelo menos 3 caracteres' })
    name: string;

    @ApiProperty({ description: 'Descrição da sala', example: 'Sala destinada a consultas de rotina com o Dr. José' })
    @IsString()
    @IsNotEmpty()
    @MinLength(5, { message: 'A descrição deve ter pelo menos 5 caracteres' })
    description: string;
}