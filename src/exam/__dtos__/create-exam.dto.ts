import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateExamDto {
    @ApiProperty({ description: 'ID do hospital responsável', example: 'uuid-do-hospital' })
    @IsString()
    hospitalId: string;

    @ApiProperty({ description: 'ID do usuário que criou o exame', example: 'uuid-do-usuario' })
    @IsString()
    createdById: string;

    @ApiProperty({ description: 'ID do profissional responsável', example: 'uuid-do-profissional' })
    @IsString()
    providerId: string;

    @ApiProperty({ description: 'ID do paciente', example: 'uuid-do-paciente' })
    @IsString()
    patientId: string;

    @ApiPropertyOptional({ description: 'ID do arquivo anexado', example: 'uuid-do-arquivo' })
    @IsOptional()
    @IsString()
    archiveId?: string;

    @ApiProperty({ description: 'Descrição do exame', example: 'Exame de sangue de rotina' })
    @IsString()
    description: string;
}