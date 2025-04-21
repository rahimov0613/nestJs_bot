// src/telegram/telegram.module.ts
import { Module } from '@nestjs/common';
import { TelegramService} from './bot.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: ''//token qoyish kere
    }),
    TaskModule
  ],
  providers: [TelegramService],
})
export class BotModule {}
