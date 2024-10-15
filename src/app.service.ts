import { Ctx, Update, Start, Action, On } from 'nestjs-telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';

import { BotContext } from './bot-context.interface';
import { AppointmentService } from './appointment/appointment.service';
import { AppointmentDto } from './appointment/dto/appointment.dto';
import { TgInterfaceService } from './tg-interface/tg-interface.service';
import { UserInputsService } from './user-inputs/user-inputs.service';

@Update()
export class AppService {
  constructor(
    private readonly tgInterfaceService: TgInterfaceService,
    private readonly userInputsService: UserInputsService,
    private readonly appointmentService: AppointmentService,
  ) {}

  @Start()
  async startCommand(@Ctx() ctx: BotContext) {
    ctx.session = {};
    await ctx.reply(
      "Вітаємо! Ви можете записатися на зустріч. Введіть ваше ім'я:",
    );
    ctx.session.step = 'waiting_for_name';
  }

  @On('text')
  async onText(@Ctx() ctx: BotContext) {
    const message = ctx.message as Message;

    if (!this.userInputsService.isTextMessage(message)) {
      await ctx.reply('Будь ласка, надішліть текстове повідомлення.');
      return;
    }

    const userMessage = message.text;

    this.handleButtons(userMessage, ctx);

    this.handleSwitcher(ctx, userMessage);
  }

  private async handleButtons(userMessage, ctx) {
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
        `Вашу зустріч заброньовано на ${appointmentDate.toLocaleString('uk-UA', this.normalizeReplyDate)}`,
      );
      ctx.session = {};
      return;
    }
    if (userMessage === 'Змінити') {
      ctx.session = {};
      await ctx.reply(
        "Вітаємо! Ви можете записатися на зустріч. Введіть ваше ім'я:",
      );
      return;
    }
  }

  @Action(/date_(.+)/)
  async onDateSelected(@Ctx() ctx: BotContext) {
    const callbackQuery = ctx.callbackQuery;
    if (callbackQuery && 'data' in callbackQuery) {
      const date = callbackQuery.data.split('_')[1];
      ctx.session.appointmentDate = date;
      ctx.session.step = 'waiting_for_time';
      await this.tgInterfaceService.sendTimeKeyboard(
        ctx,
        ctx.session.appointmentDate,
      );
    } else {
      await ctx.reply('Помилка! Не вдалося отримати дату. Спробуйте ще раз.');
    }
  }

  @Action(/time_(.+)/)
  async onTimeSelected(@Ctx() ctx: BotContext) {
    const callbackQuery = ctx.callbackQuery;
    if (callbackQuery && 'data' in callbackQuery) {
      const time = callbackQuery.data.split('_')[1];
      const appointmentDto: AppointmentDto = {
        name: ctx.session.name,
        phone: ctx.session.phone,
        email: ctx.session.email,
        appointmentDate: new Date(`${ctx.session.appointmentDate}T${time}:00`),
        createdAt: new Date(),
      };

      await this.showFilledForm(ctx, appointmentDto);
    } else {
      await ctx.reply('Помилка! Не вдалося отримати час. Спробуйте ще раз.');
    }
  }
  private async handleSwitcher(ctx, userMessage) {
    if (userMessage === 'Відмінити запис') {
      ctx.session = {};
      await ctx.reply("Ви можете скасувати зустріч. Введіть ваше ім'я:");
      ctx.session.step = 'cancel_appointment';
      return;
    }
    if (userMessage === 'Записатись') {
      ctx.session = {};
      await ctx.reply(
        "Вітаємо! Ви можете записатися на зустріч. Введіть ваше ім'я:",
      );
      ctx.session.step = 'waiting_for_name';
      return;
    }

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
      default:
        await this.userInputsService.initBot(ctx);
    }
  }
  private async showFilledForm(
    ctx: BotContext,
    appointmentDto: AppointmentDto,
  ) {
    const message = `
      **Ваші дані для запису:**
      - Ім'я: ${appointmentDto.name}
      - Телефон: ${appointmentDto.phone}
      - Email: ${appointmentDto.email}
      - Дата зустрічі: ${appointmentDto.appointmentDate.toLocaleString(
        'uk-UA',
        this.normalizeReplyDate,
      )}`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

    await ctx.reply(
      'Якщо все правильно, натисніть "Підтвердити". Якщо потрібно внести зміни, натисніть "Змінити".',
      {
        reply_markup: {
          keyboard: [['Підтвердити'], ['Змінити']],
          one_time_keyboard: true,
          resize_keyboard: true,
        },
      },
    );
  }

  private get normalizeReplyDate(): Intl.DateTimeFormatOptions {
    return {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
  }
}
