import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateSchedulingDto {
    @ApiProperty({ description: 'ID do hospital onde o agendamento será realizado', example: 'uuid-do-hospital' })
    @IsString()
    @IsNotEmpty({ message: 'Hospital é obrigatório.' })
    hospitalId: string;

    @ApiProperty({ description: 'ID do profissional que realizará o atendimento', example: 'uuid-do-profissional' })
    @IsString()
    @IsNotEmpty({ message: 'Prestador é obrigatório.' })
    providerId: string;

    @ApiProperty({ description: 'ID do paciente agendado', example: 'uuid-do-paciente' })
    @IsString()
    @IsNotEmpty({ message: 'Paciente é obrigatório.' })
    patientId: string;

    @ApiPropertyOptional({ description: 'Observações adicionais sobre o agendamento', example: 'Retorno pós-operatório' })
    @IsOptional()
    @IsString()
    @Length(3, 100, { message: 'Observação deve ter entre 3 e 100 caracteres.' })
    observation?: string;

    @ApiProperty({ description: 'Data e hora de início do atendimento (ISO 8601)', example: '2025-07-08T14:00:00.000Z' })
    @IsDateString({}, { message: 'Data e hora de início inválida.' })
    @IsNotEmpty({ message: 'Data e hora de início é obrigatória.' })
    startDate: string;

    @ApiProperty({ description: 'Data e hora de término do atendimento (ISO 8601)', example: '2025-07-08T14:30:00.000Z' })
    @IsDateString({}, { message: 'Data e hora de término inválida.' })
    @IsNotEmpty({ message: 'Data e hora de término é obrigatória.' })
    endDate: string;
}