import { Context } from 'telegraf';

interface SessionData {
  step?: string;
  date?: string;
  time?: string;
}

export interface BotContext extends Context {
  session?: SessionData;
}
