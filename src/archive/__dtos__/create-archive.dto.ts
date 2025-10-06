import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArchiveDto {
    @ApiPropertyOptional({ description: 'ID da mensagem associada', example: '123e4567-e89b-12d3-a456-426614174000' })
    messageId?: string;
}
