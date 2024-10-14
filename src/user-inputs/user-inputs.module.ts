import { Module } from '@nestjs/common';
import { UserInputsService } from './user-inputs.service';
import { TgInterfaceService } from 'src/tg-interface/tg-interface.service';
import { Appointment, AppointmentSchema } from 'src/models/appointment.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  providers: [UserInputsService, TgInterfaceService],
  exports: [UserInputsService],
})
export class UserInputsModule {}
