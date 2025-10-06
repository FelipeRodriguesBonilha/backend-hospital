import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ReturnUserDto } from 'src/user/__dtos__/return-user.dto';
import { UserService } from 'src/user/user.service';
import { createPasswordHashed, validatePassword } from 'src/utils/password';
import { LoginPayloadDto } from './__dtos__/login-payload.dto';
import { LoginDto } from './__dtos__/login.dto';
import { ResetPasswordDto } from './__dtos__/reset-password.dto';
import { ReturnLoginDto } from './__dtos__/return-login.dto';
import { ForgotPasswordDto } from './__dtos__/forgot-password.dto';
import { ResetPayloadDto } from './__dtos__/reset-payload.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly mailService: MailService,
        private jwtService: JwtService
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.userService.findByEmail(loginDto.email).catch(() => undefined);

        const isMatch = await validatePassword(loginDto.password, user?.password || '');

        if (!user || !isMatch) {
            throw new NotFoundException('E-mail ou senha inválidos!')
        }

        return {
            accessToken: await this.jwtService.signAsync({ ...new LoginPayloadDto(user, 'access')}),
            user: new ReturnUserDto(user)
        } as ReturnLoginDto;
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.userService.findByEmail(forgotPasswordDto.email);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado!');
        }

        const token = await this.jwtService.signAsync({ ...new ResetPayloadDto(user, 'reset'), tokenType: 'reset' }, {
            secret: process.env.JWT_SECRET,
            expiresIn: '15m',
        });

        await this.mailService.sendPasswordResetEmail(user.email, token);

        return { message: 'E-mail de recuperação enviado com sucesso.' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const resetPayload: ResetPayloadDto | undefined = await this.jwtService.verifyAsync(resetPasswordDto.token, {
            secret: process.env.JWT_SECRET,
        }).catch(() => undefined);

        if (!resetPayload) {
            throw new BadRequestException('Token inválido ou expirado');
        }

        if (resetPayload.tokenType && resetPayload.tokenType !== 'reset') {
            throw new BadRequestException(`O token para redefinição de senha deve ser do tipo 'reset'!`);
        }

        const user = await this.userService.findByIdWithoutAccessControl(resetPayload.id);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado!');
        }

        if (user.passwordResetTokenVersion !== resetPayload.tokenVersion) {
            throw new BadRequestException('Token inválido ou já utilizado!');
        }

        const isSamePassword = await validatePassword(resetPasswordDto.newPassword, user.password);
        
        if (isSamePassword) {
            throw new BadRequestException('A nova senha não pode ser igual à senha antiga!');
        }

        const hashed = await createPasswordHashed(resetPasswordDto.newPassword);
        await this.userService.updatePassword(user.id, hashed);

        return { message: 'Senha redefinida com sucesso.' };
    }
}
