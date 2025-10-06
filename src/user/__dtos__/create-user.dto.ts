import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ description: 'ID do hospital do usuário', example: 'uuid-do-hospital' })
    @IsString()
    @IsNotEmpty()
    hospitalId: string;

    @ApiProperty({ description: 'Nome completo do usuário', example: 'João da Silva' })
    @IsString()
    @IsNotEmpty()
    @Length(3, 100, { message: 'Nome deve ter entre 3 e 100 caracteres.' })
    name: string;

    @ApiProperty({ description: 'CPF do usuário (somente números)', example: '12345678901' })
    @IsString()
    @IsNotEmpty()
    @Length(11, 11, { message: 'CPF deve ter exatamente 11 dígitos.' })
    cpf: string;

    @ApiProperty({ description: 'Telefone de contato (somente números)', example: '11912345678' })
    @IsString()
    @IsNotEmpty()
    @Length(10, 11, { message: 'Telefone deve ter entre 10 e 11 dígitos.' })
    phone: string;

    @ApiProperty({ description: 'E-mail do usuário', example: 'joao.silva@email.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Senha do usuário (mínimo 6 caracteres)', example: 'senhaSegura123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ description: 'ID do papel (role) do usuário', example: 'uuid-do-role' })
    @IsString()
    @IsNotEmpty()
    roleId: string;
}