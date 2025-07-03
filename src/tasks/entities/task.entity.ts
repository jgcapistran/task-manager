import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskUser } from './task-user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() name: string;

  @Column({ length: 1024 })
  description: string;

  @Column({
    name: 'estimated_time',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  estimatedTime: number;

  @Column({ name: 'limit_date', type: 'timestamptz' })
  limitDate: Date;

  @Column({ name: 'completed_date', type: 'timestamptz', nullable: true })
  completedDate: Date;

  @Column({ type: 'enum', enum: ['active', 'completed'] })
  status: 'active' | 'completed';

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column({ type: 'enum', enum: ['MXN'] })
  currency: 'MXN';

  @OneToMany(() => TaskUser, (taskUser: any) => taskUser.task)
  taskUsers: any[];

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated: Date;
}
