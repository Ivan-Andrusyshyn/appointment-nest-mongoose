import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';

export const telegrafConfig = [
  TelegrafModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      token: config.get<string>('TELEGRAM_BOT_TOKEN'),
      middlewares: [session()],
    }),
  }),
];
