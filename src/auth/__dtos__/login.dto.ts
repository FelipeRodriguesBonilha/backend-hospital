import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({ description: 'E-mail do usuário', example: 'usuario@email.com' })
    @IsString()
    email: string;

    @ApiProperty({ description: 'Senha do usuário', example: 'minhaSenhaSegura123' })
    @IsString()
    password: string;
}