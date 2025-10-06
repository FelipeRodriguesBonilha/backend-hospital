import { Hospital, Room, User } from "@prisma/client";
import { ReturnHospitalDto } from "src/hospital/__dtos__/return-hospital.dto";
import { ReturnUserDto } from "src/user/__dtos__/return-user.dto";

export class ReturnRoomDto {
    id: string;
    hospitalId: string;
    name: string;
    description: string;
    adminId: string;
    hospital: ReturnHospitalDto;
    admin: ReturnUserDto;

    constructor(
        room: Room & { hospital?: Hospital, admin?: User }
    ) {
        this.id = room.id;
        this.hospitalId = room.hospitalId;
        this.name = room.name;
        this.description = room.description;
        this.adminId = room.adminId;
        this.hospital = room.hospital ? new ReturnHospitalDto(room.hospital) : undefined;
        this.admin = room.admin ? new ReturnUserDto(room.admin) : undefined;
    }
}