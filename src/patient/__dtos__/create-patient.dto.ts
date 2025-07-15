import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreatePatientDto {
    @ApiProperty({ description: 'Nome completo do paciente', example: 'João da Silva' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'ID do hospital responsável', example: 'uuid-do-hospital' })
    @IsString()
    hospitalId: string;

    @ApiProperty({ description: 'CPF do paciente (somente números)', example: '12345678901' })
    @IsString()
    @Length(11, 11)
    cpf: string;

    @ApiProperty({ description: 'Telefone de contato', example: '11912345678' })
    @IsString()
    phone: string;

    @ApiProperty({ description: 'E-mail do paciente', example: 'joao.silva@email.com' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ description: 'Endereço do paciente', example: 'Rua das Flores, 123' })
    @IsOptional()
    @IsString()
    address?: string;
}