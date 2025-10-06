import { User } from '@prisma/client'

export class ResetPayloadDto {
    id: string
    email: string
    tokenVersion: number;
    tokenType: string;

    constructor(user: User, tokenType: string) {
        this.id = user.id;
        this.email = user.email;
        this.tokenVersion = user.passwordResetTokenVersion;
        this.tokenType = tokenType;
    }
}