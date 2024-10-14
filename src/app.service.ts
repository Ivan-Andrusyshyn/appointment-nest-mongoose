import { Ctx, Update, Start, Action, On } from 'nestjs-telegraf';
import { BotContext } from './bot-context.interface';
import { AppointmentService } from './appointment/appointment.service';
import { Message } from 'telegraf/typings/core/types/typegram';

@Update()
export class AppService {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Start()
  async startCommand(@Ctx() ctx: BotContext) {
    await ctx.reply(
      'Вітаємо! Ви можете записатися на зустріч. Введіть дату у форматі YYYY-MM-DD:',
    );
    ctx.session.step = 'waiting_for_date';
  }

  @On('text')
  async onText(@Ctx() ctx: BotContext) {
    const message = ctx.message as Message;

    if (!this.isTextMessage(message)) {
      await ctx.reply('Будь ласка, надішліть текстове повідомлення.');
      return;
    }

    const userMessage = message.text;

    if (ctx.session.step === 'waiting_for_date') {
      ctx.session.date = userMessage;
      ctx.session.step = 'waiting_for_time';
      await ctx.reply('Введіть час зустрічі у форматі HH:MM:');
    } else if (ctx.session.step === 'waiting_for_time') {
      const username = ctx.message.from.username;
      const date = new Date(ctx.session.date);
      const time = userMessage;

      await this.appointmentService.createMeeting(username, date, time);
      ctx.session = {}; // Сброс сессии

      await ctx.reply(
        `Вашу зустріч заброньовано на ${ctx.session.date} о ${time}`,
      );
    }
  }

  @Action('view_meetings')
  async viewMeetings(@Ctx() ctx: BotContext) {
    const meetings = await this.appointmentService.getMeetings(
      ctx.from.username,
    );

    if (meetings.length === 0) {
      await ctx.reply('У вас немає запланованих зустрічей.');
    } else {
      let message = 'Ваші зустрічі:\n';
      meetings.forEach((meeting) => {
        message += `${meeting.appointmentDate.toLocaleDateString()} о ${meeting.appointmentDate.toLocaleTimeString()}\n`;
      });
      await ctx.reply(message);
    }
  }

  private isTextMessage(message: Message): message is Message.TextMessage {
    return message && 'text' in message;
  }
}
