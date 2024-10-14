import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from 'src/models/appointment.schema';
import { AppointmentService } from './appointment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
