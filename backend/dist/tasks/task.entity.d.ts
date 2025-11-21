import { User } from '../users/user.entity';
import { TaskStatus } from './enums/task-status.enum';
import { TaskType } from './enums/task-type.enum';
export declare class Task {
    id: string;
    type: TaskType;
    inputN: number;
    status: TaskStatus;
    progress: number;
    assignedServer?: string | null;
    result?: string | null;
    executionTime?: number | null;
    error?: string | null;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=task.entity.d.ts.map