import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArchiveDto {
    @ApiProperty({ description: 'Nome do arquivo', example: 'arquivo_exame.pdf' })
    name: string;

    @ApiProperty({ description: 'Tipo do arquivo', example: 'pdf' })
    type: string;

    @ApiProperty({ description: 'URL do arquivo' })
    url: string;

    @ApiPropertyOptional({ description: 'ID da mensagem associada', example: '123e4567-e89b-12d3-a456-426614174000' })
    messageId?: string;

    @ApiPropertyOptional({ description: 'ID do exame associado', example: '987e6543-e21b-12d3-a456-426614174999' })
    examId?: string;
}
