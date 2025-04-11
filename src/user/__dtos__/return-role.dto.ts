import { Role } from "@prisma/client"

export class ReturnRoleDto {
    id: string;
    name: string;

    constructor(
        role: Role
    ) {
        this.id = role.id;
        this.name = role.name;
    }
}