import { Injectable } from '@nestjs/common';

import { BotContext } from './bot-context.interface';
import { UserInputsService } from './user-inputs/user-inputs.service';
import { AppointmentService } from './appointment/appointment.service';
import { TgInterfaceService } from './tg-interface/tg-interface.service';

@Injectable()
export class StepService {
  constructor(
    private readonly tgInterfaceService: TgInterfaceService,
    private readonly appointmentService: AppointmentService,
    private readonly userInputsService: UserInputsService,
  ) {}

  async handleSteps(ctx: BotContext, userMessage: string) {
    switch (ctx.session.step) {
      case 'waiting_for_name':
        await this.userInputsService.handleNameInput(ctx, userMessage);
        break;

      case 'waiting_for_phone':
        await this.userInputsService.handlePhoneInput(ctx, userMessage);
        break;

      case 'waiting_for_email':
        await this.userInputsService.handleEmailInput(ctx, userMessage);
        break;

      case 'waiting_for_date':
        await this.userInputsService.handleDateInput(ctx, userMessage);
        break;
      case 'cancel_appointment':
        await this.userInputsService.cancelAppointment(ctx, userMessage);
        break;
      case 'waiting_for_cancel_email':
        await this.userInputsService.cancelAppointment(ctx, userMessage);
        break;
    }
  }

  async handleFinishConfirmBtn(userMessage: string, ctx: BotContext) {
    if (userMessage === 'Підтвердити') {
      const { name, phone, email, appointmentDate } = ctx.session;
      if (!name || !phone || !email || !appointmentDate) {
        ctx.session = {};
        return;
      }

      await this.appointmentService.createAppointment({
        name,
        phone,
        email,
        appointmentDate,
        createdAt: new Date(),
      });
      await ctx.reply(
        `✅ Вашу зустріч заброньовано на ${appointmentDate.toLocaleString('uk-UA', this.normalizeReplyDate)}`,
      );
      this.tgInterfaceService.handleMainKeyboards(ctx, 'Скасувати');
      ctx.session = {};
      return;
    }
    if (userMessage === 'Змінити') {
      ctx.session = {};
      await ctx.reply(
        "🔄 Вітаємо! Ви можете записатися на зустріч. Введіть ваше ім'я:",
      );
      this.tgInterfaceService.handleMainKeyboards(ctx, 'Скасувати');

      return;
    }
  }
  async dispatchOnAction(userMessage: string, ctx: BotContext) {
    switch (userMessage) {
      case 'Відмінити запис':
        ctx.session = {};
        await ctx.reply("Ви можете скасувати зустріч. Введіть ваше ім'я:");
        ctx.session.step = 'cancel_appointment';
        return;
      case 'Записатись':
        ctx.session = {};
        await ctx.reply('✍️ Вітаємо! Ви можете записатися на зустріч.');

        this.tgInterfaceService.handleMainKeyboards(ctx, 'Записатись');

        ctx.session.step = 'waiting_for_name';
        return;
      case 'Скасувати':
        ctx.session = {};
        this.tgInterfaceService.handleMainKeyboards(ctx, 'Скасувати');
    }

    await this.handleSteps(ctx, userMessage);
  }
  get normalizeReplyDate(): Intl.DateTimeFormatOptions {
    return {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
  }
}
