import { Injectable } from '@nestjs/common';
import { BotContext } from 'src/bot-context.interface';

@Injectable()
export class TgInterfaceService {
  async sendTimeKeyboard(ctx: BotContext) {
    const buttons = [];
    const startHour = 9;
    const endHour = 17;
    let row = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      row.push({
        text: `${hour}:00`,
        callback_data: `time_${hour}:00`,
      });

      if (row.length === 3) {
        buttons.push(row);
        row = [];
      }
    }

    if (row.length > 0) {
      buttons.push(row);
    }

    await ctx.reply('Оберіть час:', {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }

  async sendDateKeyboard(ctx: BotContext) {
    const currentDate = new Date();
    const buttons = [];
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    let row = [];

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      row.push({
        text: date.toLocaleDateString(),
        callback_data: `date_${date.toISOString().split('T')[0]}`, // Сохранение даты в формате YYYY-MM-DD
      });

      if (row.length === 3) {
        buttons.push(row);
        row = [];
      }
    }

    if (row.length > 0) {
      buttons.push(row);
    }

    await ctx.reply('Оберіть дату:', {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }
}
