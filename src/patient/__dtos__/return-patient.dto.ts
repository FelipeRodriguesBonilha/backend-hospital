import { Hospital, Patient } from "@prisma/client";
import { ReturnHospitalDto } from "src/hospital/__dtos__/return-hospital.dto";

export class ReturnPatientDto {
    id: string;
    hospitalId: string;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    address?: string;

    hospital?: ReturnHospitalDto;

    constructor(
        patient: Patient & {
            hospital?: Hospital;
        }
    ) {
        this.id = patient.id;
        this.hospitalId = patient.hospitalId;
        this.name = patient.name;
        this.cpf = patient.cpf;
        this.phone = patient.phone;
        this.email = patient.email;
        this.address = patient.address;

        this.hospital = patient.hospital ? new ReturnHospitalDto(patient.hospital) : undefined;
    }
}
