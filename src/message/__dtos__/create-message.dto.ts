import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateMessageDto {
    @ApiProperty({
        description: 'Conteúdo da mensagem',
        example: 'Olá! Agendar retorno ao paciente.',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        description: 'ID da sala de chat onde a mensagem será enviada',
        example: 'uuid-da-sala',
    })
    @IsString()
    @IsNotEmpty()
    roomId: string;
}