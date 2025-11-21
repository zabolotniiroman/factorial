import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Task } from './task.entity'
import { UsersModule } from '../users/users.module'
import { TaskExecutionService } from './task-execution.service'

@Module({
  imports: [TypeOrmModule.forFeature([Task]), UsersModule],
  controllers: [TasksController],
  providers: [TasksService, TaskExecutionService],
  exports: [TaskExecutionService],
})
export class TasksModule {}

