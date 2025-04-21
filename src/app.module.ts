import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [BotModule, TaskModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
