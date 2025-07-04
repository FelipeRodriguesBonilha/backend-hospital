import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

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