import { Module } from '@nestjs/common';
import { TgInterfaceService } from './tg-interface.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from 'src/models/appointment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  providers: [TgInterfaceService],
  exports: [TgInterfaceService],
})
export class TgInterfaceModule {}
