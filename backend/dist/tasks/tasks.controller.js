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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const tasks_service_1 = require("./tasks.service");
const create_task_dto_1 = require("./dto/create-task.dto");
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async listTasks(username) {
        if (!username) {
            throw new common_1.BadRequestException('username is required');
        }
        const tasks = await this.tasksService.listTasks(username);
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
        }));
    }
    async createTask(username, dto) {
        if (!username) {
            throw new common_1.BadRequestException('username is required');
        }
        const task = await this.tasksService.createTask(username, dto);
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
        };
    }
    async cancelTask(id, username) {
        if (!username) {
            throw new common_1.BadRequestException('username is required');
        }
        const task = await this.tasksService.cancelTask(id, username);
        return {
            id: task?.id,
            status: task?.status,
        };
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "listTasks", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "createTask", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "cancelTask", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
