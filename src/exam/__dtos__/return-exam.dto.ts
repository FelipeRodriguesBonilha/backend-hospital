import { Archive, Exam, Hospital, Patient, User } from "@prisma/client";
import { ReturnArchiveDto } from "src/archive/__dtos__/return-archive.dto";
import { ReturnHospitalDto } from "src/hospital/__dtos__/return-hospital.dto";
import { ReturnPatientDto } from "src/patient/__dtos__/return-patient.dto";
import { ReturnUserDto } from "src/user/__dtos__/return-user.dto";

export class ReturnExamDto {
    id: string;
    hospitalId: string;
    createdById: string;
    providerId: string;
    patientId: string;
    archiveId?: string;
    description: string;

    hospital?: ReturnHospitalDto;
    createdBy?: ReturnUserDto;
    provider?: ReturnUserDto;
    patient?: ReturnPatientDto;
    archive?: ReturnArchiveDto;

    constructor(
        exam: Exam &
        {
            hospital?: Hospital;
            createdBy?: User;
            provider?: User;
            patient?: Patient;
            archive?: Archive;
        }
    ) {
        this.id = exam.id;
        this.hospitalId = exam.hospitalId;
        this.createdById = exam.createdById;
        this.providerId = exam.providerId;
        this.patientId = exam.patientId;
        this.archiveId = exam.archiveId;
        this.description = exam.description;

        this.hospital = exam.hospital ? new ReturnHospitalDto(exam.hospital) : undefined;
        this.createdBy = exam.createdBy ? new ReturnUserDto(exam.createdBy) : undefined;
        this.provider = exam.provider ? new ReturnUserDto(exam.provider) : undefined;
        this.patient = exam.patient ? new ReturnPatientDto(exam.patient) : undefined;
        this.archive = exam.archive ? new ReturnArchiveDto(exam.archive) : undefined;
    }
}