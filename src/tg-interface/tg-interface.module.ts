import { Module } from '@nestjs/common';
import { TgInterfaceService } from './tg-interface.service';

@Module({
  providers: [TgInterfaceService],
  exports: [TgInterfaceService],
})
export class TgInterfaceModule {}
