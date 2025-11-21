import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    listTasks(username?: string): Promise<{
        id: string;
        type: import("./enums/task-type.enum").TaskType;
        input_n: number;
        status: import("./enums/task-status.enum").TaskStatus;
        progress: number;
        assignedServer: string | null | undefined;
        result: string | null | undefined;
        execution_time: number | null | undefined;
        error: string | null | undefined;
        created_at: Date;
    }[]>;
    createTask(username: string, dto: CreateTaskDto): Promise<{
        id: string;
        type: import("./enums/task-type.enum").TaskType;
        input_n: number;
        status: import("./enums/task-status.enum").TaskStatus;
        progress: number;
        assignedServer: string | null | undefined;
        result: string | null | undefined;
        execution_time: number | null | undefined;
        error: string | null | undefined;
        created_at: Date;
    }>;
    cancelTask(id: string, username?: string): Promise<{
        id: string | undefined;
        status: import("./enums/task-status.enum").TaskStatus | undefined;
    }>;
}
//# sourceMappingURL=tasks.controller.d.ts.map