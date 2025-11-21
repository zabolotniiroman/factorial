import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UsersService } from '../users/users.service';
import { TaskExecutionService } from './task-execution.service';
export declare class TasksService {
    private readonly tasksRepository;
    private readonly usersService;
    private readonly executionService;
    constructor(tasksRepository: Repository<Task>, usersService: UsersService, executionService: TaskExecutionService);
    createTask(username: string, dto: CreateTaskDto): Promise<Task>;
    listTasks(username: string): Promise<Task[]>;
    cancelTask(taskId: string, username: string): Promise<Task | null>;
    private ensureTaskLimit;
    private ensureUserConcurrencyLimit;
    private ensureClusterHasCapacity;
}
//# sourceMappingURL=tasks.service.d.ts.map