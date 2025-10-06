import { Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly userService: UserService
    ) { }

    async sendPasswordResetEmail(email: string, token: string) {
        const resetLink = process.env.FRONTEND_URL.replace('{token}', token);

        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        await this.mailerService.sendMail({
            to: email,
            subject: 'Redefinição de Senha',
            template: 'reset-password',
            context: {
                user,
                email,
                resetLink,
            },
        });
    }
}
