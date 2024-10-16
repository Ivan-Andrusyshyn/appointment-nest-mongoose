import { Ctx, Update, Start, Action, On } from 'nestjs-telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';

import { BotContext } from './bot-context.interface';
import { AppointmentDto } from './appointment/dto/appointment.dto';
import { TgInterfaceService } from './tg-interface/tg-interface.service';
import { UserInputsService } from './user-inputs/user-inputs.service';
import { StepService } from './step.service';

@Update()
export class AppService {
  constructor(
    private readonly tgInterfaceService: TgInterfaceService,
    private readonly userInputsService: UserInputsService,
    private readonly stepService: StepService,
  ) {}

  @Start()
  async startCommand(@Ctx() ctx: BotContext) {
    ctx.session = {};
    await ctx.reply(
      "👋 Вітаємо! Ви можете записатися на зустріч. Введіть ваше ім'я:",
    );
    ctx.session.step = 'waiting_for_name';
  }

  @On('text')
  async onText(@Ctx() ctx: BotContext) {
    const message = ctx.message as Message;
    if (!this.userInputsService.isTextMessage(message)) {
      await ctx.reply('❗Будь ласка, надішліть текстове повідомлення.');
      return;
    }
    this.stepService.handleFinishConfirmBtn(message.text, ctx);

    this.stepService.dispatchOnAction(message.text, ctx);
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
      await ctx.reply(
        '⚠️ Помилка! Не вдалося отримати дату. Спробуйте ще раз.',
      );
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
      await ctx.reply('⚠️ Помилка! Не вдалося отримати час. Спробуйте ще раз.');
    }
  }

  private async showFilledForm(
    ctx: BotContext,
    appointmentDto: AppointmentDto,
  ) {
    const message = `
      📝 **Ваші дані для запису:**
      - Ім'я: ${appointmentDto.name}
      - Телефон: ${appointmentDto.phone}
      - Email: ${appointmentDto.email}
      - 📅 Дата зустрічі: ${appointmentDto.appointmentDate.toLocaleString(
        'uk-UA',
        this.stepService.normalizeReplyDate,
      )}`;

    await ctx.reply(message, { parse_mode: 'Markdown' });

    this.tgInterfaceService.handleMainKeyboards(ctx, 'Підтвердити');
  }
}
