import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

const evnValidation = Joi.object({
  TELEGRAM_BOT_TOKEN: Joi.string().required(),
  URL_MONGO: Joi.string().required(),
  APP_EMAIL_PASSWORD: Joi.string().required(),
  NP_API_KEY: Joi.string().required(),
  SERVICEAPP_EMAIL: Joi.string().email().required(),
  EMAIL_ADMIN: Joi.string().email().required(),
});

export const moduleConfig = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env'],
    validationSchema: evnValidation,
  }),
];
