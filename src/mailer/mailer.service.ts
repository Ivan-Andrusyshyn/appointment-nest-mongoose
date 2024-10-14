import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

import { AppointmentData } from './appointment.interface';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: NestMailerService,
  ) {}

  readonly serviceEmailToAdmin = this.configService.get('EMAIL_ADMIN');

  async sendAppointmentEmail(appointment: AppointmentData): Promise<void> {
    const { email, name, date, time } = appointment;

    try {
      const userInfo = await this.mailerService.sendMail({
        from: `${this.configService.get('SERVICEAPP_EMAIL')}`,
        to: email,
        subject: 'Ваша зустріч заброньована ✔',
        text: `Привіт, ${name}! Ваша зустріч заброньована на ${date} о ${time}.`,
        template: 'appointmentEmail',
        context: {
          email: email,
          name: name,
          date: date,
          time: time,
        },
      });

      this.logger.log('Message sent to user: %s', userInfo.messageId);

      const adminInfo = await this.mailerService.sendMail({
        from: `${this.configService.get('SERVICEAPP_EMAIL')}`,
        to: this.serviceEmailToAdmin,
        subject: 'Нова зустріч заброньована ✔',
        text: `Привіт! ${name} забронював зустріч на ${date} о ${time}.`,
        template: 'appointmentEmail',
        context: {
          email: email,
          name: name,
          date: date,
          time: time,
        },
      });

      this.logger.log('Message sent to admin: %s', adminInfo.messageId);
    } catch (error) {
      console.log(error);

      this.handleError(error);
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof Error) {
      this.logger.error('Error sending email:', error.message);
      throw new Error('Не вдалося надіслати електронну пошту');
    } else {
      this.logger.error('Unknown error sending email:', error);
      throw new Error('Не вдалося надіслати електронну пошту');
    }
  }
}
