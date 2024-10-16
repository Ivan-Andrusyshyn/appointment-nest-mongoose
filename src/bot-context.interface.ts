import { Context } from 'telegraf';

export interface SessionData {
  name?: string;
  phone?: string;
  email?: string;
  appointmentDate?: Date | string;
  createdAt?: Date;
  step?: string;
  cancelName?: string;
  cancelEmail?: string;
  cancelStep?: string;
  messageIds?: number[];
}

export interface BotContext extends Context {
  session?: SessionData;
}
