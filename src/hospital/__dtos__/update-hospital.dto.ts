import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class UpdateHospitalDto {
    @ApiProperty()
    @IsString()
    companyName: string;

    @ApiProperty()
    @IsString()
    @Length(14, 14)
    cnpj: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    phone?: string;
}