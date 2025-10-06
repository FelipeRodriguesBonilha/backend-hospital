import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: process.env.MAIL_HOST,
                port: +process.env.MAIL_PORT,
                secure: true,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
            },
            defaults: {
                from: `"Sistema" <${process.env.MAIL_FROM}>`,
            },
            template: {
                dir: join(process.cwd(), 'src/mail/__templates__'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
        UserModule
    ],
    controllers: [MailController],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
