import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Task } from './task.entity'
import { TaskType } from './enums/task-type.enum'
import { CreateTaskDto } from './dto/create-task.dto'
import { UsersService } from '../users/users.service'
import { MAX_CONCURRENT_USER_TASKS, MAX_TOTAL_QUEUE_SIZE, TASK_LIMITS } from '../common/task-limits'
import { TaskStatus } from './enums/task-status.enum'
import { TaskExecutionService } from './task-execution.service'

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly usersService: UsersService,
    private readonly executionService: TaskExecutionService
  ) {}

  async createTask(username: string, dto: CreateTaskDto): Promise<Task> {
    const user = await this.usersService.findOrCreate(username)
    this.ensureTaskLimit(dto.type, dto.input_n)
    await this.ensureUserConcurrencyLimit(user.id)
    await this.ensureClusterHasCapacity()

    const task = this.tasksRepository.create({
      type: dto.type,
      inputN: dto.input_n,
      user,
      status: TaskStatus.PENDING,
      progress: 0,
    })

    const saved = await this.tasksRepository.save(task)
    await this.executionService.enqueueTask(saved)
    return saved
  }

  async listTasks(username: string): Promise<Task[]> {
    const user = await this.usersService.findOrCreate(username)
    return this.tasksRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    })
  }

  async cancelTask(taskId: string, username: string) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['user'],
    })
    if (!task) {
      throw new NotFoundException('Task not found')
    }
    if (task.user.username !== username.trim().toLowerCase()) {
      throw new ForbiddenException('You can cancel only your tasks')
    }
    if (
      task.status === TaskStatus.COMPLETED ||
      task.status === TaskStatus.FAILED ||
      task.status === TaskStatus.CANCELLED
    ) {
      return task
    }
    await this.executionService.cancelTask(task.id)
    return this.tasksRepository.findOne({ where: { id: task.id } })
  }

  private ensureTaskLimit(type: TaskType, n: number) {
    const limit = TASK_LIMITS[type]
    if (!limit) {
      throw new BadRequestException('Unsupported task type')
    }
    if (n > limit.maxN) {
      throw new BadRequestException(
        `Перевищено допустиму складність для ${type}. Максимум: ${limit.maxN}`
      )
    }
  }

  private async ensureUserConcurrencyLimit(userId: string) {
    const active = await this.tasksRepository.count({
      where: {
        user: { id: userId },
        status: In([TaskStatus.PENDING, TaskStatus.PROCESSING]),
      },
    })
    if (active >= MAX_CONCURRENT_USER_TASKS) {
      throw new BadRequestException(
        `Досягнуто максимум активних задач (${MAX_CONCURRENT_USER_TASKS}). Дочекайтесь завершення.`
      )
    }
  }

  private async ensureClusterHasCapacity() {
    const active = await this.tasksRepository.count({
      where: { status: In([TaskStatus.PENDING, TaskStatus.PROCESSING]) },
    })
    if (active >= MAX_TOTAL_QUEUE_SIZE) {
      throw new BadRequestException(
        'Кластер перевантажений. Спробуйте пізніше.'
      )
    }
  }
}

