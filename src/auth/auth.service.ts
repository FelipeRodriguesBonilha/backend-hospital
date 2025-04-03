import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ReturnUserDto } from 'src/user/__dtos__/return-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './__dtos__/login.dto';
import { ReturnLoginDto } from './__dtos__/return-login.dto';
import { validatePassword } from 'src/utils/password';
import { LoginPayloadDto } from './__dtos__/login-payload.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService
    ) { }

    async login(loginDto: LoginDto): Promise<ReturnLoginDto> {
        const user = await this.userService.findByEmail(loginDto.email).catch(() => undefined);

        const isMatch = await validatePassword(loginDto.password, user?.password || '');

        if (!user || !isMatch) {
            throw new NotFoundException('E-mail ou senha inválidos!')
        }

        return {
            accessToken: await this.jwtService.signAsync({ ...new LoginPayloadDto(user) }),
            user: new ReturnUserDto(user)
        }
    }
}
