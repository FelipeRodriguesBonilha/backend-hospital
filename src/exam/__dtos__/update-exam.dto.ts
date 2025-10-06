import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateExamDto {
    @ApiPropertyOptional({ description: 'ID do hospital responsável', example: 'uuid-do-hospital' })
    @IsOptional()
    @IsString({ message: 'Hospital deve ser uma string.' })
    hospitalId?: string;

    @ApiProperty({ description: 'ID do profissional responsável', example: 'uuid-do-profissional' })
    @IsString({ message: 'Prestador deve ser uma string.' })
    @IsNotEmpty({ message: 'Prestador é obrigatório.' })
    providerId: string;

    @ApiProperty({ description: 'ID do paciente', example: 'uuid-do-paciente' })
    @IsString({ message: 'Paciente deve ser uma string.' })
    @IsNotEmpty({ message: 'Paciente é obrigatório.' })
    patientId: string;

    @IsOptional()
    @IsString({ message: 'Arquivo deve ser uma string.' })
    archiveId?: string;

    @ApiProperty({ description: 'Descrição do exame', example: 'Exame de sangue de rotina' })
    @IsString({ message: 'Descrição deve ser uma string.' })
    @IsNotEmpty({ message: 'Descrição é obrigatória.' })
    @Length(3, 100, { message: 'Descrição deve ter entre 3 e 100 caracteres.' })
    description: string;
}