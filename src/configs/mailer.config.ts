import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';

export const mailerConfig = [
  NestMailerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      transport: {
        service: 'gmail',
        auth: {
          user: config.get<string>('SERVICEAPP_EMAIL'),
          pass: config.get<string>('APP_EMAIL_PASSWORD'),
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@example.com>',
      },
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new EjsAdapter(),
      },
    }),
  }),
];
