import { Injectable } from '@nestjs/common';
import { BotContext } from 'src/bot-context.interface';
import { TgInterfaceService } from 'src/tg-interface/tg-interface.service';
import { Message } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class UserInputsService {
  constructor(private tgInterfaceService: TgInterfaceService) {}

  async handleNameInput(ctx: BotContext, userMessage: string) {
    ctx.session.name = userMessage;
    ctx.session.step = 'waiting_for_phone';
    await ctx.reply('Введіть ваш номер телефону:');
  }

  async handlePhoneInput(ctx: BotContext, userMessage: string) {
    if (!this.validatePhone(userMessage)) {
      await ctx.reply('Будь ласка, введіть коректний номер телефону.');
      return;
    }

    ctx.session.phone = userMessage;
    ctx.session.step = 'waiting_for_email';
    await ctx.reply('Введіть вашу електронну пошту:');
  }

  async handleEmailInput(ctx: BotContext, userMessage: string) {
    if (!this.validateEmail(userMessage)) {
      await ctx.reply('Будь ласка, введіть коректну електронну пошту.');
      return;
    }

    ctx.session.email = userMessage;
    ctx.session.step = 'waiting_for_date';
    await this.tgInterfaceService.sendDateKeyboard(ctx);
  }

  async handleDateInput(ctx: BotContext, userMessage: string) {
    ctx.session.appointmentDate = userMessage;
    ctx.session.step = 'waiting_for_time';
    await this.tgInterfaceService.sendTimeKeyboard(ctx);
  }

  async handleDefaultStep(ctx: BotContext) {
    const message = ctx.message as Message;

    if (this.isTextMessage(message) && message.text === 'Почати все спочатку') {
      ctx.session = {};
      await ctx.reply(
        "Вітаємо! Ви можете записатися на зустріч. Введіть ваше ім'я:",
      );
      ctx.session.step = 'waiting_for_name';
    } else {
      await ctx.reply(
        'Будь ласка, натисніть "Почати все спочатку", щоб почати процес запису на зустріч.',
        {
          reply_markup: {
            keyboard: [['Почати все спочатку']],
            one_time_keyboard: true,
            resize_keyboard: true,
          },
        },
      );
    }
  }
  isTextMessage(message: Message): message is Message.TextMessage {
    return message && 'text' in message;
  }

  private validatePhone(phone: string): boolean {
    const phoneRegex = /^(?:\+380|0)\d{9}$/;
    return phoneRegex.test(phone);
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
