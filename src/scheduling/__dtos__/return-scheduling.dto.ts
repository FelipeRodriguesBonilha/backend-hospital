import { Hospital, Patient, Scheduling, User } from "@prisma/client";
import { ReturnHospitalDto } from "src/hospital/__dtos__/return-hospital.dto";
import { ReturnPatientDto } from "src/patient/__dtos__/return-patient.dto";
import { ReturnUserDto } from "src/user/__dtos__/return-user.dto";

export class ReturnSchedulingDto {
    id: string;
    hospitalId: string;
    createdById: string;
    providerId: string;
    patientId: string;
    observation?: string;
    startDate: Date;
    endDate: Date;

    hospital?: ReturnHospitalDto;
    createdBy?: ReturnUserDto;
    provider?: ReturnUserDto;
    patient?: ReturnPatientDto;

    constructor(
        scheduling: Scheduling &
        {
            hospital?: Hospital;
            createdBy?: User;
            provider?: User;
            patient?: Patient;
        }
    ) {
        this.id = scheduling.id;
        this.hospitalId = scheduling.hospitalId;
        this.createdById = scheduling.createdById;
        this.providerId = scheduling.providerId;
        this.patientId = scheduling.patientId;
        this.observation = scheduling.observation;
        this.startDate = scheduling.startDate;
        this.endDate = scheduling.endDate;

        this.hospital = scheduling.hospital ? new ReturnHospitalDto(scheduling.hospital) : undefined;
        this.createdBy = scheduling.createdBy ? new ReturnUserDto(scheduling.createdBy) : undefined;
        this.provider = scheduling.provider ? new ReturnUserDto(scheduling.provider) : undefined;
        this.patient = scheduling.patient ? new ReturnPatientDto(scheduling.patient) : undefined;
    }
}