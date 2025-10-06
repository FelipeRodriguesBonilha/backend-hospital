import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class UpdateHospitalDto {
    @ApiProperty({ description: 'Razão social do hospital', example: 'Hospital das Clínicas Ltda' })
    @IsString()
    @Length(3, 100, { message: 'Nome da empresa deve ter entre 3 e 100 caracteres.' })
    companyName: string;

    @ApiProperty({ description: 'CNPJ do hospital (14 dígitos)', example: '12345678000199' })
    @IsString()
    @Length(14, 14, { message: 'CNPJ deve conter exatamente 14 dígitos.' })
    cnpj: string;

    @ApiPropertyOptional({ description: 'Telefone de contato', example: '11999999999' })
    @IsOptional()
    @IsString()
    @Length(10, 11, { message: 'Telefone deve ter entre 10 e 11 dígitos.' })
    phone?: string;
}