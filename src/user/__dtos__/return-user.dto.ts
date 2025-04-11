import { Hospital, Role, User } from "@prisma/client";
import { ReturnHospitalDto } from "src/hospital/__dtos__/return-hospital.dto";
import { ReturnRoleDto } from "./return-role.dto";

export class ReturnUserDto {
    id: string;
    hospitalId: string;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    roleId: String;

    hospital: ReturnHospitalDto;
    role: ReturnRoleDto;

    constructor(user: User & { hospital?: Hospital, role?: Role }) {
        this.id = user.id;
        this.hospitalId = user.hospitalId;
        this.name = user.name;
        this.cpf = user.cpf;
        this.phone = user.phone;
        this.email = user.email;
        this.roleId = user.roleId
        this.hospital = user.hospital ? new ReturnHospitalDto(user.hospital) : undefined;
        this.role = user.role ? new ReturnRoleDto(user.role) : undefined;
    }
}
