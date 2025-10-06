import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdatePatientDto {
    @ApiProperty({ description: 'Nome completo do paciente', example: 'João da Silva' })
    @IsString()
    @Length(3, 100, { message: 'Nome deve ter entre 3 e 100 caracteres.' })
    name: string;

    @ApiProperty({ description: 'ID do hospital responsável', example: 'uuid-do-hospital' })
    @IsOptional()
    @IsString()
    hospitalId?: string;

    @ApiProperty({ description: 'CPF do paciente (somente números)', example: '12345678901' })
    @IsString()
    @Length(11, 11, { message: 'CPF deve conter exatamente 11 dígitos.' })
    cpf: string;

    @ApiProperty({ description: 'Telefone de contato', example: '11912345678' })
    @IsString()
    @Length(10, 11, { message: 'Telefone deve conter entre 10 e 11 dígitos.' })
    phone: string;

    @ApiProperty({ description: 'E-mail do paciente', example: 'joao.silva@email.com' })
    @IsEmail({}, { message: 'E-mail inválido.' })
    email: string;

    @ApiPropertyOptional({ description: 'Endereço do paciente', example: 'Rua das Flores, 123' })
    @IsOptional()
    @IsString()
    @Length(3, 100, { message: 'Endereço deve ter entre 3 e 100 caracteres.' })
    address?: string;
}