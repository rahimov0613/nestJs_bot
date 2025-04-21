// src/telegram/telegram.service.ts
import { Injectable } from '@nestjs/common';
import { InjectBot, Start, Update, Ctx, Command, On, Hears } from 'nestjs-telegraf';
import { Telegraf, Context, Markup } from 'telegraf';
import { TaskService } from '../task/task.service';

interface SessionData {
  step?: string;
  data?: any;
}

const userSessions = new Map<number, SessionData>();

@Injectable()
@Update()
export class TelegramService {
  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    private taskService: TaskService,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    if (ctx.from) {
      userSessions.set(ctx.from.id, {}); // reset session
    }
    await ctx.reply('Assalomu alaykum! Biror amal tanlang:', Markup.keyboard([
      ['Create', 'FindAll']
    ]).resize());
  }

  @Hears('Create')
  async onCreate(@Ctx() ctx: Context) {
    if (ctx.from) {
      userSessions.set(ctx.from.id, { step: 'title', data: {} });
    }
    await ctx.reply("Iltimos, title kiriting:");
  }

  @Hears('FindAll')
  async onFindAll(@Ctx() ctx: Context) {
    const tasks = this.taskService.findAll();
    if (tasks.length === 0) {
      return ctx.reply('Hozircha hech qanday ma\'lumot yo\'q.');
    }

    const buttons = tasks.map(task => [Markup.button.callback(task.title, `VIEW_${task.id}`)]);
    await ctx.reply('Ma\'lumotlar ro‘yxati:', Markup.inlineKeyboard(buttons));
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    const session = ctx.from ? userSessions.get(ctx.from.id) : undefined;
    if (!session || !session.step) return;

    const text = ctx.message?.['text'];
    if (!text) return;
    switch (session.step) {
      case 'title':
        session.data.title = text;
        session.step = 'description';
        await ctx.reply("Description kiriting:");
        break;
      case 'description':
        session.data.description = text;
        session.step = 'author';
        await ctx.reply("Author kiriting:");
        break;
      case 'author':
        session.data.author = text;
        session.step = 'startDate';
        await ctx.reply("Start date kiriting (YYYY-MM-DD):");
        break;
      case 'startDate':
        session.data.startDate = text;
        session.step = 'endDate';
        await ctx.reply("End date kiriting (YYYY-MM-DD):");
        break;
      case 'endDate':
        session.data.endDate = text;
        this.taskService.create(session.data);
        if (ctx.from) {
          userSessions.delete(ctx.from.id);
        }
        await ctx.reply("Ma'lumot saqlandi!", Markup.keyboard([
          ['Create', 'FindAll']
        ]).resize());
        break;
    }
  }

  @On('callback_query')
  async onCallback(@Ctx() ctx: Context) {
    const data = ctx.callbackQuery?.['data'];
    if (data.startsWith('VIEW_')) {
      const id = parseInt(data.split('_')[1]);
      const task = this.taskService.findOne(id);
      if (!task) return ctx.reply("Topilmadi");

      await ctx.replyWithHTML(
        `<b>Title:</b> ${task.title}\n<b>Description:</b> ${task.description}\n<b>Author:</b> ${task.author}\n<b>Start:</b> ${task.startDate}\n<b>End:</b> ${task.endDate}`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Update', `UPDATE_${task.id}`)],
          [Markup.button.callback('Delete', `DELETE_${task.id}`)],
        ])
      );
    }

    if (data.startsWith('DELETE_')) {
      const id = parseInt(data.split('_')[1]);
      const success = this.taskService.delete(id);
      await ctx.editMessageText(success ? 'O‘chirildi!' : 'Xatolik yuz berdi.');
    }

    if (data.startsWith('UPDATE_')) {
      const id = parseInt(data.split('_')[1]);
      if (ctx.from) {
        userSessions.set(ctx.from.id, { step: 'title', data: { id } });
      }
      await ctx.reply('Yangi title kiriting:');
    }
  }
}
