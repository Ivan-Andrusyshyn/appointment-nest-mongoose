import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';

interface CreateAppointmentDto {
  email: string;
  name: string;
  date: string;
  time: string;
}

@Controller('appointments')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('book')
  async bookAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    const { email, name, date, time } = createAppointmentDto;
    await this.mailerService.sendAppointmentEmail({ email, name, date, time });
    return { message: 'Appointment booked and email sent!' };
  }
}
