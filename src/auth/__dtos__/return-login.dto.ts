import { ReturnUserDto } from "src/user/__dtos__/return-user.dto";

export interface ReturnLoginDto {
    user: ReturnUserDto;
    accessToken: string;
}