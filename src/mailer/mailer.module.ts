import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { mailerConfig } from 'src/configs/mailer.config';

@Module({
  imports: [ConfigModule, ...mailerConfig],
  controllers: [MailerController],
  providers: [MailerService],
})
export class MailerModule {}
