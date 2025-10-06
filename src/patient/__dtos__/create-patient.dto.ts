import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreatePatientDto {
    @ApiProperty({ description: 'Nome completo do paciente', example: 'João da Silva' })
    @IsString()
    @IsNotEmpty({ message: 'Nome é obrigatório.' })
    @Length(3, 100, { message: 'Nome deve ter entre 3 e 100 caracteres.' })
    name: string;

    @ApiProperty({ description: 'ID do hospital responsável', example: 'uuid-do-hospital' })
    @IsString()
    @IsNotEmpty({ message: 'Hospital é obrigatório.' })
    hospitalId: string;

    @ApiProperty({ description: 'CPF do paciente (somente números)', example: '12345678901' })
    @IsString()
    @IsNotEmpty({ message: 'CPF é obrigatório.' })
    @Length(11, 11, { message: 'CPF deve conter exatamente 11 dígitos.' })
    cpf: string;

    @ApiProperty({ description: 'Telefone de contato', example: '11912345678' })
    @IsString()
    @IsNotEmpty({ message: 'Telefone é obrigatório.' })
    @Length(10, 11, { message: 'Telefone deve conter entre 10 e 11 dígitos.' })
    phone: string;

    @ApiProperty({ description: 'E-mail do paciente', example: 'joao.silva@email.com' })
    @IsEmail({}, { message: 'E-mail inválido.' })
    @IsNotEmpty({ message: 'E-mail é obrigatório.' })
    email: string;

    @ApiPropertyOptional({ description: 'Endereço do paciente', example: 'Rua das Flores, 123' })
    @IsOptional()
    @IsString()
    @Length(3, 100, { message: 'Endereço deve ter entre 3 e 100 caracteres.' })
    address?: string;
}