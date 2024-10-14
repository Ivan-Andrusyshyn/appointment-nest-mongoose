import { Context } from 'telegraf';

export interface SessionData {
  name?: string;
  phone?: string;
  email?: string;
  appointmentDate?: Date | string;
  createdAt?: Date;
  step?: string;
}

export interface BotContext extends Context {
  session?: SessionData;
}
