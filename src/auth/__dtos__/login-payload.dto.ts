import { User } from "@prisma/client";

export class LoginPayloadDto {
    id: string;
    roleId: string;
    tokenType: string;

    constructor(user: User, tokenType: string){
        this.id = user.id;
        this.roleId = user.roleId;
        this.tokenType = tokenType;
    }
}