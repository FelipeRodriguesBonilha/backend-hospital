import { Role, User } from "@prisma/client";

export class ReturnUserDto {
    id: string;
    hospitalId: string;
    roleId: String;
    name: string;
    cpf: string;
    phone: string;
    email: string;
    password: string;

    constructor(user: User) {
        this.id = user.id;
        this.hospitalId = user.hospitalId;
        this.name = user.name;
        this.cpf = user.cpf;
        this.phone = user.phone;
        this.email = user.email;
        this.password = user.password;
        this.roleId = user.roleId
    }
}
