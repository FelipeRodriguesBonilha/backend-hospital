import { IsOptional, IsString, Length } from "class-validator";

export class CreateHospitalDto {
    @IsString()
    companyName: string;

    @IsString()
    @Length(14, 14)
    cnpj: string;

    @IsString()
    @IsOptional()
    phone?: string;
}