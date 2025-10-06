import { ReturnUserDto } from "src/user/__dtos__/return-user.dto";

export interface ReturnLoginDto {
    accessToken: string;
    user: ReturnUserDto;
}