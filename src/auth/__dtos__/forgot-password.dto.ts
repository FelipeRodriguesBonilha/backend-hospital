import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {
    @ApiProperty({ description: 'E-mail do usuário', example: 'joao.silva@email.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}