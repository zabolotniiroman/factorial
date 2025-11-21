import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { Task } from '../tasks/task.entity'

@Entity('users')
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 64 })
  username!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @OneToMany(() => Task, task => task.user)
  tasks!: Task[]
}

