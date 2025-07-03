import { TaskUser } from 'src/tasks/entities/task-user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Repository,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() name: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'second_last_name' })
  secondLastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: ['admin', 'user'] })
  role: 'admin' | 'user';

  @Column({ type: 'enum', enum: ['enabled', 'disabled'] })
  status: 'enabled' | 'disabled';

  @OneToMany(() => TaskUser, (taskUser: any) => taskUser.user)
  taskUsers: any[];

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated: Date;

  @Column({ type: 'float', select: false, default: 0 })
  tasksCompletedCost: number;

  @Column({ type: 'int', select: false, default: 0 })
  tasksCompletedCount: number;
}
