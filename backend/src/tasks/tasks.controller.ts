import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
	Req,
} from '@nestjs/common'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async listTasks(@Req() req: any) {
    const tasks = await this.tasksService.listTasks(req.user.username)
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
		@Req() req: any,
    @Body() dto: CreateTaskDto
  ) {
   
    const task = await this.tasksService.createTask(req.user.username, dto)
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
		@Req() req: any,
    @Param('id') id: string  
  ) {
    const task = await this.tasksService.cancelTask(id, req.user.username)
    return {
      id: task?.id,
      status: task?.status,
    }
  }
}

