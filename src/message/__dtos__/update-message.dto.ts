import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateMessageDto {
    @ApiProperty({
        description: 'Conteúdo da mensagem',
        example: 'Olá! Agendar retorno ao paciente.',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    files?: {
        name: string;
        type: string;
        content: string;
    }[];
}