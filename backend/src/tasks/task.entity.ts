import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '../users/user.entity'
import { TaskStatus } from './enums/task-status.enum'
import { TaskType } from './enums/task-type.enum'

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'text' })
  type!: TaskType

  @Column({ name: 'input_n', type: 'integer' })
  inputN!: number

  @Column({ type: 'text', default: TaskStatus.PENDING })
  status!: TaskStatus

  @Column({ type: 'real', default: 0 })
  progress!: number

  @Column({ name: 'assigned_server', type: 'text', nullable: true })
  assignedServer?: string | null

  @Column({ type: 'text', nullable: true })
  result?: string | null

  @Column({ name: 'execution_time', type: 'real', nullable: true })
  executionTime?: number | null

  @Column({ type: 'text', nullable: true })
  error?: string | null

  @ManyToOne(() => User, user => user.tasks, { eager: true })
  user!: User

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}

