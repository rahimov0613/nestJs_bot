// src/task/task.service.ts
import { Injectable } from '@nestjs/common';
import { Task } from './task.module';

@Injectable()
export class TaskService {
  private tasks: Task[] = [];
  private idCounter = 1;

  create(task: Omit<Task, 'id'>): Task {
    const newTask = { ...task, id: this.idCounter++ };
    this.tasks.push(newTask);
    return newTask;
  }

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: number): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  update(id: number, updatedData: Partial<Task>): Task | undefined {
    const task = this.findOne(id);
    if (task) {
      Object.assign(task, updatedData);
    }
    return task;
  }

  delete(id: number): boolean {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index > -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }
}
