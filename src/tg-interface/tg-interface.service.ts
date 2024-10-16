import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BotContext } from 'src/bot-context.interface';
import {
  Appointment,
  AppointmentDocument,
} from 'src/models/appointment.schema';

type mainSelectorsType =
  | 'Підтвердити'
  | 'Підтвердити запис'
  | 'Записатись'
  | 'Скасувати';

@Injectable()
export class TgInterfaceService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
  ) {}

  async sendTimeKeyboard(ctx: BotContext, selectedDate: Date | string) {
    let dateToUse: Date;
    if (typeof selectedDate === 'string') {
      dateToUse = new Date(selectedDate);
    } else {
      dateToUse = selectedDate;
    }

    const appointments = await this.appointmentModel.find({
      appointmentDate: {
        $gte: new Date(dateToUse.setHours(0, 0, 0, 0)),
        $lt: new Date(dateToUse.setHours(23, 59, 59, 999)),
      },
    });

    const bookedTimes = appointments.map((appointment) => {
      const date = new Date(appointment.appointmentDate);
      return `${date.getHours()}:00`;
    });

    const buttons = [];
    const startHour = 9;
    const endHour = 17;
    let row = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      const time = `${hour}:00`;

      if (!bookedTimes.includes(time)) {
        row.push({
          text: time,
          callback_data: `time_${time}`,
        });
      } else {
        row.push({
          text: `❌ ${time}`,
          callback_data: `disabled_${time}`,
        });
      }

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
        inline_keyboard: buttons.map((row) =>
          row.map((button) => ({
            text: button.text,
            callback_data: button.callback_data,
          })),
        ),
      },
    });
  }
  async handleMainKeyboards(ctx, select: mainSelectorsType) {
    switch (select) {
      case 'Скасувати':
        await ctx.reply('🔄 Оберіть дію:', {
          reply_markup: {
            keyboard: [['Записатись', 'Відмінити запис']],
            one_time_keyboard: true,
            resize_keyboard: true,
          },
        });
        break;
      case 'Записатись':
        await ctx.reply("📝 Введіть ваше ім'я:", {
          reply_markup: {
            keyboard: [['Скасувати']],
            one_time_keyboard: true,
            resize_keyboard: true,
          },
        });
        break;
      case 'Підтвердити':
        await ctx.reply(
          '✅  Якщо все правильно, натисніть "Підтвердити". Якщо потрібно внести зміни, натисніть "Змінити".',
          {
            reply_markup: {
              keyboard: [['Підтвердити'], ['Змінити']],
              one_time_keyboard: true,
              resize_keyboard: true,
            },
          },
        );
    }
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
        callback_data: `date_${date.toISOString().split('T')[0]}`,
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
