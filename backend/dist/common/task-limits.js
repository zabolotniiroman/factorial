"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_LIMITS = exports.MAX_TOTAL_QUEUE_SIZE = exports.MAX_CONCURRENT_USER_TASKS = void 0;
const task_type_enum_1 = require("../tasks/enums/task-type.enum");
exports.MAX_CONCURRENT_USER_TASKS = 3;
exports.MAX_TOTAL_QUEUE_SIZE = 20;
exports.TASK_LIMITS = {
    [task_type_enum_1.TaskType.FACTORIAL]: {
        maxN: 20000,
        description: 'Обмеження для запобігання перевантаженню при n!',
    },
    [task_type_enum_1.TaskType.DOUBLE_FACTORIAL]: {
        maxN: 60000,
        description: 'Подвійний факторіал повільніший після 60k',
    },
    [task_type_enum_1.TaskType.SUPER_FACTORIAL]: {
        maxN: 2500,
        description: 'Суперфакторіал росте надто швидко після 2500',
    },
};
