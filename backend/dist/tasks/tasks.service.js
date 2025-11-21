"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./task.entity");
const users_service_1 = require("../users/users.service");
const task_limits_1 = require("../common/task-limits");
const task_status_enum_1 = require("./enums/task-status.enum");
const task_execution_service_1 = require("./task-execution.service");
let TasksService = class TasksService {
    constructor(tasksRepository, usersService, executionService) {
        this.tasksRepository = tasksRepository;
        this.usersService = usersService;
        this.executionService = executionService;
    }
    async createTask(username, dto) {
        const user = await this.usersService.findOrCreate(username);
        this.ensureTaskLimit(dto.type, dto.input_n);
        await this.ensureUserConcurrencyLimit(user.id);
        await this.ensureClusterHasCapacity();
        const task = this.tasksRepository.create({
            type: dto.type,
            inputN: dto.input_n,
            user,
            status: task_status_enum_1.TaskStatus.PENDING,
            progress: 0,
        });
        const saved = await this.tasksRepository.save(task);
        await this.executionService.enqueueTask(saved);
        return saved;
    }
    async listTasks(username) {
        const user = await this.usersService.findOrCreate(username);
        return this.tasksRepository.find({
            where: { user: { id: user.id } },
            order: { createdAt: 'DESC' },
        });
    }
    async cancelTask(taskId, username) {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId },
            relations: ['user'],
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.user.username !== username.trim().toLowerCase()) {
            throw new common_1.ForbiddenException('You can cancel only your tasks');
        }
        if (task.status === task_status_enum_1.TaskStatus.COMPLETED ||
            task.status === task_status_enum_1.TaskStatus.FAILED ||
            task.status === task_status_enum_1.TaskStatus.CANCELLED) {
            return task;
        }
        await this.executionService.cancelTask(task.id);
        return this.tasksRepository.findOne({ where: { id: task.id } });
    }
    ensureTaskLimit(type, n) {
        const limit = task_limits_1.TASK_LIMITS[type];
        if (!limit) {
            throw new common_1.BadRequestException('Unsupported task type');
        }
        if (n > limit.maxN) {
            throw new common_1.BadRequestException(`Перевищено допустиму складність для ${type}. Максимум: ${limit.maxN}`);
        }
    }
    async ensureUserConcurrencyLimit(userId) {
        const active = await this.tasksRepository.count({
            where: {
                user: { id: userId },
                status: (0, typeorm_2.In)([task_status_enum_1.TaskStatus.PENDING, task_status_enum_1.TaskStatus.PROCESSING]),
            },
        });
        if (active >= task_limits_1.MAX_CONCURRENT_USER_TASKS) {
            throw new common_1.BadRequestException(`Досягнуто максимум активних задач (${task_limits_1.MAX_CONCURRENT_USER_TASKS}). Дочекайтесь завершення.`);
        }
    }
    async ensureClusterHasCapacity() {
        const active = await this.tasksRepository.count({
            where: { status: (0, typeorm_2.In)([task_status_enum_1.TaskStatus.PENDING, task_status_enum_1.TaskStatus.PROCESSING]) },
        });
        if (active >= task_limits_1.MAX_TOTAL_QUEUE_SIZE) {
            throw new common_1.BadRequestException('Кластер перевантажений. Спробуйте пізніше.');
        }
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        task_execution_service_1.TaskExecutionService])
], TasksService);
