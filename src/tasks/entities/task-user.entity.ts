// src/tasks/entities/task-user.entity.ts
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('task_users')
export class TaskUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user: any) => user.taskUsers)
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne(() => Task, (task: any) => task.taskUsers)
  @JoinColumn({ name: 'task_id' })
  task: any;

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated: Date;
}
