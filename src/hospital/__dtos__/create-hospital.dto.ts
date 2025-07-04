import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class CreateHospitalDto {
    @ApiProperty({ description: 'Razão social do hospital', example: 'Hospital das Clínicas Ltda' })
    @IsString()
    companyName: string;

    @ApiProperty({ description: 'CNPJ do hospital (14 dígitos)', example: '12345678000199' })
    @IsString()
    @Length(14, 14)
    cnpj: string;

    @ApiPropertyOptional({ description: 'Telefone de contato', example: '11999999999' })
    @IsOptional()
    @IsString()
    phone?: string;
}