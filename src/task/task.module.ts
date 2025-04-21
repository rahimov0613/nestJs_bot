// src/task/task.module.ts
import { Module } from '@nestjs/common';
import { TaskService } from './task.service';

@Module({
  providers: [TaskService],
  exports: [TaskService]
})
export class TaskModule {}

export interface Task {
  id: number;
  title: string;
  description: string;
  author: string;
  startDate: string;
  endDate: string;
}