import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
} from '@nestjs/common'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async listTasks(@Query('username') username?: string) {
    if (!username) {
      throw new BadRequestException('username is required')
    }
    const tasks = await this.tasksService.listTasks(username)
    return tasks.map(task => ({
      id: task.id,
      type: task.type,
      input_n: task.inputN,
      status: task.status,
      progress: task.progress,
      assignedServer: task.assignedServer,
      result: task.result,
      execution_time: task.executionTime,
      error: task.error,
      created_at: task.createdAt,
    }))
  }

  @Post()
  async createTask(
    @Query('username') username: string,
    @Body() dto: CreateTaskDto
  ) {
    if (!username) {
      throw new BadRequestException('username is required')
    }
    const task = await this.tasksService.createTask(username, dto)
    return {
      id: task.id,
      type: task.type,
      input_n: task.inputN,
      status: task.status,
      progress: task.progress,
      assignedServer: task.assignedServer,
      result: task.result,
      execution_time: task.executionTime,
      error: task.error,
      created_at: task.createdAt,
    }
  }

  @Post(':id/cancel')
  async cancelTask(
    @Param('id') id: string,
    @Query('username') username?: string
  ) {
    if (!username) {
      throw new BadRequestException('username is required')
    }
    const task = await this.tasksService.cancelTask(id, username)
    return {
      id: task?.id,
      status: task?.status,
    }
  }
}

