import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSchedulingDto {
    @ApiProperty({
        description: 'ID do hospital onde o agendamento será realizado',
        example: 'uuid-do-hospital',
    })
    @IsString()
    @IsNotEmpty()
    hospitalId: string;

    @ApiProperty({
        description: 'ID do usuário que criou o agendamento',
        example: 'uuid-do-usuario',
    })
    @IsString()
    @IsNotEmpty()
    createdById: string;

    @ApiProperty({
        description: 'ID do profissional que realizará o atendimento',
        example: 'uuid-do-profissional',
    })
    @IsString()
    @IsNotEmpty()
    providerId: string;

    @ApiProperty({
        description: 'ID do paciente agendado',
        example: 'uuid-do-paciente',
    })
    @IsString()
    @IsNotEmpty()
    patientId: string;

    @ApiPropertyOptional({
        description: 'Observações adicionais sobre o agendamento',
        example: 'Retorno pós-operatório',
    })
    @IsOptional()
    @IsString()
    observation?: string;

    @ApiProperty({
        description: 'Data e hora de início do atendimento (ISO 8601)',
        example: '2025-07-08T14:00:00.000Z',
    })
    @IsDateString()
    startDate: string;

    @ApiProperty({
        description: 'Data e hora de término do atendimento (ISO 8601)',
        example: '2025-07-08T14:30:00.000Z',
    })
    @IsDateString()
    endDate: string;
}