"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TaskExecutionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskExecutionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./task.entity");
const task_status_enum_1 = require("./enums/task-status.enum");
const worker_threads_1 = require("worker_threads");
const path = __importStar(require("path"));
let TaskExecutionService = TaskExecutionService_1 = class TaskExecutionService {
    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
        this.logger = new common_1.Logger(TaskExecutionService_1.name);
        this.workerSlots = [
            { id: 'worker-alpha', busy: false },
            { id: 'worker-beta', busy: false },
        ];
        this.queue = [];
        this.roundRobinIndex = 0;
        this.cancelledTasks = new Set();
    }
    async enqueueTask(task) {
        this.queue.push(task);
        this.logger.log(`Task ${task.id} queued. Queue size: ${this.queue.length}`);
        await this.tryDispatch();
    }
    async cancelTask(taskId) {
        const queueIndex = this.queue.findIndex(t => t.id === taskId);
        if (queueIndex >= 0) {
            this.queue.splice(queueIndex, 1);
            await this.tasksRepository.update(taskId, {
                status: task_status_enum_1.TaskStatus.CANCELLED,
                progress: 0,
                assignedServer: null,
            });
            this.logger.warn(`Task ${taskId} cancelled while in queue`);
            return;
        }
        const slot = this.workerSlots.find(w => w.currentTaskId === taskId);
        if (slot?.worker) {
            this.cancelledTasks.add(taskId);
            await slot.worker.terminate();
            await this.tasksRepository.update(taskId, {
                status: task_status_enum_1.TaskStatus.CANCELLED,
                progress: 0,
            });
            this.logger.warn(`Task ${taskId} cancelled on ${slot.id}`);
        }
    }
    async tryDispatch() {
        while (this.queue.length > 0) {
            const slot = this.nextAvailableSlot();
            if (!slot) {
                return;
            }
            const task = this.queue.shift();
            if (!task) {
                return;
            }
            await this.startTaskOnWorker(slot, task);
        }
    }
    nextAvailableSlot() {
        for (let i = 0; i < this.workerSlots.length; i++) {
            const index = (this.roundRobinIndex + i) % this.workerSlots.length;
            const slot = this.workerSlots[index];
            if (!slot.busy) {
                this.roundRobinIndex = index + 1;
                return slot;
            }
        }
        return null;
    }
    async startTaskOnWorker(slot, task) {
        slot.busy = true;
        slot.currentTaskId = task.id;
        await this.tasksRepository.update(task.id, {
            status: task_status_enum_1.TaskStatus.PROCESSING,
            assignedServer: slot.id,
            progress: 1,
        });
        const workerPath = this.resolveWorkerPath();
        const execArgv = this.resolveExecArgv();
        const worker = new worker_threads_1.Worker(workerPath, {
            workerData: {
                taskId: task.id,
                inputN: task.inputN,
                type: task.type,
            },
            execArgv,
        });
        slot.worker = worker;
        const startedAt = Date.now();
        worker.on('message', async (message) => {
            switch (message.type) {
                case 'progress':
                    await this.handleProgress(message);
                    break;
                case 'completed':
                    await this.handleCompletion(message, startedAt, slot);
                    break;
                case 'failed':
                    await this.handleFailure(message, slot);
                    break;
                default:
                    break;
            }
        });
        worker.on('error', async (error) => {
            this.logger.error(`Worker error for task ${task.id}`, error.stack);
            await this.handleFailure({ type: 'failed', taskId: task.id, error: error.message }, slot);
        });
        worker.on('exit', async (code) => {
            if (code !== 0 && !this.cancelledTasks.has(task.id)) {
                await this.handleFailure({
                    type: 'failed',
                    taskId: task.id,
                    error: `Worker exited with code ${code}`,
                }, slot);
            }
            this.cleanupSlot(slot);
            await this.tryDispatch();
        });
    }
    resolveWorkerPath() {
        const isTs = __filename.endsWith('.ts');
        if (isTs) {
            return path.resolve(__dirname, 'workers', 'task.worker.ts');
        }
        return path.resolve(__dirname, 'workers', 'task.worker.js');
    }
    resolveExecArgv() {
        const isTs = __filename.endsWith('.ts');
        if (isTs) {
            return ['-r', 'ts-node/register', '-r', 'tsconfig-paths/register'];
        }
        return [];
    }
    async handleProgress(message) {
        await this.tasksRepository.update(message.taskId, {
            progress: Math.min(99, Math.floor(message.progress)),
        });
    }
    async handleCompletion(message, startedAt, slot) {
        if (this.cancelledTasks.has(message.taskId)) {
            this.cancelledTasks.delete(message.taskId);
            await this.tasksRepository.update(message.taskId, {
                status: task_status_enum_1.TaskStatus.CANCELLED,
                progress: 0,
            });
            this.cleanupSlot(slot);
            return;
        }
        const duration = (Date.now() - startedAt) / 1000;
        await this.tasksRepository.update(message.taskId, {
            status: task_status_enum_1.TaskStatus.COMPLETED,
            progress: 100,
            result: message.result,
            executionTime: duration,
        });
        this.logger.log(`Task ${message.taskId} completed on ${slot.id} in ${duration.toFixed(2)}s`);
    }
    async handleFailure(message, slot) {
        if (this.cancelledTasks.has(message.taskId)) {
            this.cancelledTasks.delete(message.taskId);
            await this.tasksRepository.update(message.taskId, {
                status: task_status_enum_1.TaskStatus.CANCELLED,
                progress: 0,
            });
            return;
        }
        await this.tasksRepository.update(message.taskId, {
            status: task_status_enum_1.TaskStatus.FAILED,
            progress: 0,
            error: message.error,
        });
        this.logger.error(`Task ${message.taskId} failed on ${slot.id}: ${message.error}`);
    }
    cleanupSlot(slot) {
        slot.worker = undefined;
        slot.busy = false;
        slot.currentTaskId = undefined;
    }
    async onModuleDestroy() {
        await Promise.all(this.workerSlots.map(slot => slot.worker?.terminate() ?? Promise.resolve()));
    }
};
exports.TaskExecutionService = TaskExecutionService;
exports.TaskExecutionService = TaskExecutionService = TaskExecutionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TaskExecutionService);
