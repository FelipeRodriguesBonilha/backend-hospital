import { Hospital, Room } from "@prisma/client";
import { ReturnHospitalDto } from "src/hospital/__dtos__/return-hospital.dto";

export class ReturnRoomDto {
    id: string;
    hospitalId: string;
    name: string;
    description: string;
    hospital: ReturnHospitalDto;

    constructor(
        room: Room & { hospital?: Hospital }
    ) {
        this.id = room.id;
        this.hospitalId = room.hospitalId;
        this.name = room.name;
        this.description = room.description;
        this.hospital = room.hospital ? new ReturnHospitalDto(room.hospital) : undefined;
    }
}