import { Module } from '@nestjs/common';
import { UserInputsService } from './user-inputs.service';
import { TgInterfaceService } from 'src/tg-interface/tg-interface.service';

@Module({
  providers: [UserInputsService, TgInterfaceService],
  exports: [UserInputsService],
})
export class UserInputsModule {}
