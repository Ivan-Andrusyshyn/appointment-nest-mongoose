import { Injectable } from '@nestjs/common';
import { AppointmentService } from 'src/appointment/appointment.service';
import { BotContext } from 'src/bot-context.interface';
import { TgInterfaceService } from 'src/tg-interface/tg-interface.service';
import { Message } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class UserInputsService {
  constructor(
    private appointmentService: AppointmentService,
    private tgInterfaceService: TgInterfaceService,
  ) {}

  async initBot(ctx: BotContext) {
    const message = ctx.message as Message;
    if (!this.isTextMessage(message)) return;
    if (message.text === 'Записатись') {
      ctx.session = {};
      await ctx.reply(
        "Вітаємо! Ви можете записатися на зустріч. Введіть ваше ім'я:",
      );
      ctx.session.step = 'waiting_for_name';
    } else if (message.text === 'Відмінити запис') {
      ctx.session = {};
      await ctx.reply("Для початку введіть ваше ім'я:");
      ctx.session.step = 'cancel_appointment';
    } else {
      await ctx.reply('', {
        reply_markup: {
          keyboard: [['Записатись', 'Відмінити запис']],
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      });
    }
  }

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
    await this.tgInterfaceService.sendTimeKeyboard(
      ctx,
      ctx.session.appointmentDate,
    );
  }
  async cancelAppointment(ctx: BotContext, userMessage: string) {
    switch (ctx.session.step) {
      case 'cancel_appointment':
        ctx.session.cancelName = userMessage;
        await ctx.reply('Будь ласка, введіть ваш email:');
        if (userMessage === 'Записатись') {
          ctx.session = {};
          await ctx.reply(
            "Вітаємо! Ви можете записатися на зустріч. Введіть ваше ім'я:",
          );
          ctx.session.step = 'waiting_for_name';
          break;
        }
        ctx.session.step = 'waiting_for_cancel_email';
        break;

      case 'waiting_for_cancel_email':
        if (!this.validateEmail(userMessage)) {
          await ctx.reply('Будь ласка, введіть коректну електронну пошту.');
          return;
        }
        ctx.session.cancelEmail = userMessage;

        const deletedAppointment =
          await this.appointmentService.deleteAppointment(
            ctx.session.cancelName,
            ctx.session.cancelEmail,
          );

        if (deletedAppointment) {
          await ctx.reply(
            `Запис на зустріч для користувача ${ctx.session.cancelName} успішно скасовано.`,
          );
        } else {
          await ctx.reply(
            `Не знайдено запису для користувача "${ctx.session.cancelName}".`,
          );
        }

        ctx.session = {};
        break;

      default:
        ctx.session.step = 'cancel_appointment';
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
