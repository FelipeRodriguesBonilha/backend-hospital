import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Length } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({ description: 'ID do hospital do usuário', example: 'uuid-do-hospital' })
    @IsOptional()
    @IsString({ message: 'Hospital deve ser uma string.' })
    hospitalId?: string;

    @ApiProperty({ description: 'Nome completo do usuário', example: 'João da Silva' })
    @IsString({ message: 'Nome deve ser uma string.' })
    @IsNotEmpty({ message: 'Nome é obrigatório.' })
    @Length(3, 100, { message: 'Nome deve ter entre 3 e 100 caracteres.' })
    name: string;

    @ApiProperty({ description: 'CPF do usuário (somente números)', example: '12345678901' })
    @IsString({ message: 'CPF deve ser uma string.' })
    @IsNotEmpty({ message: 'CPF é obrigatório.' })
    @Length(11, 11, { message: 'CPF deve ter exatamente 11 dígitos.' })
    cpf: string;

    @ApiProperty({ description: 'Telefone de contato (somente números)', example: '11912345678' })
    @IsString({ message: 'Telefone deve ser uma string.' })
    @IsNotEmpty({ message: 'Telefone é obrigatório.' })
    @Length(10, 11, { message: 'Telefone deve ter entre 10 e 11 dígitos.' })
    phone: string;

    @ApiProperty({ description: 'E-mail do usuário', example: 'joao.silva@email.com' })
    @IsEmail({}, { message: 'E-mail inválido.' })
    @IsNotEmpty({ message: 'E-mail é obrigatório.' })
    email: string;

    @ApiPropertyOptional({ description: 'Senha do usuário (mínimo 6 caracteres)', example: 'senhaSegura123' })
    @IsOptional()
    @IsString({ message: 'Senha deve ser uma string.' })
    @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres.' })
    password?: string;

    @ApiProperty({ description: 'ID do papel (role) do usuário', example: 'uuid-do-role' })
    @IsString({ message: 'Papel deve ser uma string.' })
    @IsNotEmpty({ message: 'Papel é obrigatório.' })
    roleId: string;
}