import { Hospital } from "@prisma/client";

export class ReturnHospitalDto {
    id: string;
    companyName: string;
    cnpj: string;
    phone: string;

    constructor(hospital: Hospital) {
        this.id = hospital.id;
        this.companyName = hospital.companyName;
        this.cnpj = hospital.cnpj;
        this.phone = hospital.phone;
    }
}