import { OnModuleDestroy } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
export declare class TaskExecutionService implements OnModuleDestroy {
    private readonly tasksRepository;
    private readonly logger;
    private readonly workerSlots;
    private readonly queue;
    private roundRobinIndex;
    private readonly cancelledTasks;
    constructor(tasksRepository: Repository<Task>);
    enqueueTask(task: Task): Promise<void>;
    cancelTask(taskId: string): Promise<void>;
    private tryDispatch;
    private nextAvailableSlot;
    private startTaskOnWorker;
    private resolveWorkerPath;
    private resolveExecArgv;
    private handleProgress;
    private handleCompletion;
    private handleFailure;
    private cleanupSlot;
    onModuleDestroy(): Promise<void>;
}
//# sourceMappingURL=task-execution.service.d.ts.map