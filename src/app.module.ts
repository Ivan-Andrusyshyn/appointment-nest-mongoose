import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { mongooseConfig } from './db/mongoose.config';
import { moduleConfig } from './configs/configModule.config';
import { telegrafConfig } from './configs/telegrafModule.config';
import { AppointmentModule } from './appointment/appointment.module';
import { TgInterfaceModule } from './tg-interface/tg-interface.module';
import { UserInputsModule } from './user-inputs/user-inputs.module';
import { StepService } from './step.service';

@Module({
  imports: [
    ...moduleConfig,
    ...mongooseConfig,
    ...telegrafConfig,
    AppointmentModule,
    TgInterfaceModule,
    UserInputsModule,
  ],
  controllers: [AppController],
  providers: [AppService, StepService],
})
export class AppModule {}
