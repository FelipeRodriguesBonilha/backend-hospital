import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
    @ApiProperty({ description: 'Token para redefinição de senha', example: 'token123' })
    token: string;

    @ApiProperty({ description: 'Nova senha do usuário', example: 'novaSenha@123' })
    newPassword: string;
}