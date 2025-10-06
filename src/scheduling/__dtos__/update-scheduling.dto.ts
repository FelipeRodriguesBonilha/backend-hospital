import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateSchedulingDto {
    @ApiPropertyOptional({
        description: 'ID do hospital onde o agendamento será realizado',
        example: 'uuid-do-hospital',
    })
    @IsOptional()
    @IsString({ message: 'Hospital deve ser uma string.' })
    @IsNotEmpty({ message: 'Hospital é obrigatório.' })
    hospitalId?: string;

    @ApiProperty({
        description: 'ID do profissional que realizará o atendimento',
        example: 'uuid-do-profissional',
    })
    @IsString({ message: 'Prestador deve ser uma string.' })
    @IsNotEmpty({ message: 'Prestador é obrigatório.' })
    providerId: string;

    @ApiProperty({
        description: 'ID do paciente agendado',
        example: 'uuid-do-paciente',
    })
    @IsString({ message: 'Paciente deve ser uma string.' })
    @IsNotEmpty({ message: 'Paciente é obrigatório.' })
    patientId: string;

    @ApiPropertyOptional({
        description: 'Observações adicionais sobre o agendamento',
        example: 'Retorno pós-operatório',
    })
    @IsOptional()
    @IsString({ message: 'Observação deve ser uma string.' })
    @Length(3, 100, { message: 'Observação deve ter entre 3 e 100 caracteres.' })
    observation?: string;

    @ApiProperty({
        description: 'Data e hora de início do atendimento (ISO 8601)',
        example: '2025-07-08T14:00:00.000Z',
    })
    @IsDateString({}, { message: 'Data e hora de início inválida.' })
    @IsNotEmpty({ message: 'Data e hora de início é obrigatória.' })
    startDate: string;

    @ApiProperty({
        description: 'Data e hora de término do atendimento (ISO 8601)',
        example: '2025-07-08T14:30:00.000Z',
    })
    @IsDateString({}, { message: 'Data e hora de término inválida.' })
    @IsNotEmpty({ message: 'Data e hora de término é obrigatória.' })
    endDate: string;
}