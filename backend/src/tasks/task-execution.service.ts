import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Task } from './task.entity'
import { TaskStatus } from './enums/task-status.enum'
import { Worker } from 'worker_threads'
import * as path from 'path'

type WorkerSlot = {
  id: string
  busy: boolean
  worker?: Worker
  currentTaskId?: string
}

type WorkerMessage =
  | { type: 'progress'; taskId: string; progress: number }
  | {
      type: 'completed'
      taskId: string
      result: string
      executionTime: number
    }
  | { type: 'failed'; taskId: string; error: string }

@Injectable()
export class TaskExecutionService implements OnModuleDestroy {
  private readonly logger = new Logger(TaskExecutionService.name)
  private readonly workerSlots: WorkerSlot[] = [
    { id: 'worker-alpha', busy: false },
    { id: 'worker-beta', busy: false },
  ]
  // Removed in-memory queue
  private roundRobinIndex = 0
  private readonly cancelledTasks = new Set<string>()
  private pollingInterval: NodeJS.Timeout

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>
  ) {
    this.startPolling()
  }

  private startPolling() {
    this.pollingInterval = setInterval(() => {
      this.tryDispatch()
    }, 1000) // Poll every second
  }

  // Removed enqueueTask - tasks are now pulled from DB

  async cancelTask(taskId: string) {
    // Check if task is running on a worker
    const slot = this.workerSlots.find(w => w.currentTaskId === taskId)
    if (slot?.worker) {
      this.cancelledTasks.add(taskId)
      await slot.worker.terminate()
      await this.tasksRepository.update(taskId, {
        status: TaskStatus.CANCELLED,
        progress: 0,
      })
      this.logger.warn(`Task ${taskId} cancelled on ${slot.id}`)
      return
    }

    // If not running, just update DB (it might be PENDING in DB)
    await this.tasksRepository.update(taskId, {
        status: TaskStatus.CANCELLED,
        progress: 0,
        assignedServer: null,
    })
    this.logger.log(`Task ${taskId} cancelled in DB`)
  }

  private async tryDispatch() {
    const slot = this.nextAvailableSlot()
    if (!slot) {
      return
    }

    // Try to get a task from DB with locking
    const task = await this.fetchNextPendingTask()
    if (!task) {
      return
    }

    await this.startTaskOnWorker(slot, task)
  }

  private async fetchNextPendingTask(): Promise<Task | null> {
    return this.tasksRepository.manager.transaction(async manager => {
      // SELECT * FROM tasks WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED
      const task = await manager
        .createQueryBuilder(Task, 'task')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .where('task.status = :status', { status: TaskStatus.PENDING })
        .orderBy('task.createdAt', 'ASC')
        .getOne()

      if (task) {
         await manager.update(Task, task.id, { status: TaskStatus.PROCESSING })
         task.status = TaskStatus.PROCESSING
      }
      return task
    })
  }

  private nextAvailableSlot(): WorkerSlot | null {
    for (let i = 0; i < this.workerSlots.length; i++) {
      const index = (this.roundRobinIndex + i) % this.workerSlots.length
      const slot = this.workerSlots[index]
      if (!slot.busy) {
        this.roundRobinIndex = index + 1
        return slot
      }
    }
    return null
  }

  private async startTaskOnWorker(slot: WorkerSlot, task: Task) {
    slot.busy = true
    slot.currentTaskId = task.id

    const serverId = process.env.SERVER_ID || 'unknown'
    const assignedServer = `${serverId}-${slot.id}`

    await this.tasksRepository.update(task.id, {
      assignedServer: assignedServer,
      progress: 1,
    })

    const workerPath = this.resolveWorkerPath()
    const execArgv = this.resolveExecArgv()
    const worker = new Worker(workerPath, {
      workerData: {
        taskId: task.id,
        inputN: task.inputN,
        type: task.type,
      },
      execArgv,
    })

    slot.worker = worker
    const startedAt = Date.now()

    worker.on('message', async (message: WorkerMessage) => {
      switch (message.type) {
        case 'progress':
          await this.handleProgress(message)
          break
        case 'completed':
          await this.handleCompletion(message, startedAt, slot)
          break
        case 'failed':
          await this.handleFailure(message, slot)
          break
        default:
          break
      }
    })

    worker.on('error', async error => {
      this.logger.error(`Worker error for task ${task.id}`, error.stack)
      await this.handleFailure(
        { type: 'failed', taskId: task.id, error: error.message },
        slot
      )
    })

    worker.on('exit', async code => {
      if (code !== 0 && !this.cancelledTasks.has(task.id)) {
        await this.handleFailure(
          {
            type: 'failed',
            taskId: task.id,
            error: `Worker exited with code ${code}`,
          },
          slot
        )
      }
      this.cleanupSlot(slot)
      // Immediately try to dispatch next task after one finishes
      await this.tryDispatch()
    })
  }

  private resolveWorkerPath() {
    const isTs = __filename.endsWith('.ts')
    if (isTs) {
      return path.resolve(__dirname, 'workers', 'task.worker.ts')
    }
    return path.resolve(__dirname, 'workers', 'task.worker.js')
  }

  private resolveExecArgv() {
    const isTs = __filename.endsWith('.ts')
    if (isTs) {
      return ['-r', 'ts-node/register', '-r', 'tsconfig-paths/register']
    }
    return []
  }

  private async handleProgress(message: WorkerMessage & { type: 'progress' }) {
    await this.tasksRepository.update(message.taskId, {
      progress: Math.min(99, Math.floor(message.progress)),
    })
  }

  private async handleCompletion(
    message: WorkerMessage & { type: 'completed' },
    startedAt: number,
    slot: WorkerSlot
  ) {
    if (this.cancelledTasks.has(message.taskId)) {
      this.cancelledTasks.delete(message.taskId)
      await this.tasksRepository.update(message.taskId, {
        status: TaskStatus.CANCELLED,
        progress: 0,
      })
      this.cleanupSlot(slot)
      return
    }
    const duration = (Date.now() - startedAt) / 1000
    await this.tasksRepository.update(message.taskId, {
      status: TaskStatus.COMPLETED,
      progress: 100,
      result: message.result,
      executionTime: duration,
    })
    this.logger.log(
      `Task ${message.taskId} completed on ${slot.id} in ${duration.toFixed(2)}s`
    )
  }

  private async handleFailure(
    message: WorkerMessage & { type: 'failed' },
    slot: WorkerSlot
  ) {
    if (this.cancelledTasks.has(message.taskId)) {
      this.cancelledTasks.delete(message.taskId)
      await this.tasksRepository.update(message.taskId, {
        status: TaskStatus.CANCELLED,
        progress: 0,
      })
      return
    }
    await this.tasksRepository.update(message.taskId, {
      status: TaskStatus.FAILED,
      progress: 0,
      error: message.error,
    })
    this.logger.error(
      `Task ${message.taskId} failed on ${slot.id}: ${message.error}`
    )
  }

  private cleanupSlot(slot: WorkerSlot) {
    slot.worker = undefined
    slot.busy = false
    slot.currentTaskId = undefined
  }

  async onModuleDestroy() {
    clearInterval(this.pollingInterval)
    await Promise.all(
      this.workerSlots.map(slot => slot.worker?.terminate() ?? Promise.resolve())
    )
  }
}
