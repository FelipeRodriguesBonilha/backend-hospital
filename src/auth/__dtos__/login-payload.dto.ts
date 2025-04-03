import { Role, User } from "@prisma/client";

export class LoginPayloadDto {
    id: string;
    roleId: string;

    constructor(user: User){
        this.id = user.id;
        this.roleId = user.roleId;
    }
}