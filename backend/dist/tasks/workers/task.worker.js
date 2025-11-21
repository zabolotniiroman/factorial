"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const task_type_enum_1 = require("../enums/task-type.enum");
const data = worker_threads_1.workerData;
const PROGRESS_STEPS = 500;
const emitProgress = (progress) => {
    worker_threads_1.parentPort?.postMessage({
        type: 'progress',
        taskId: data.taskId,
        progress,
    });
};
const factorial = (n) => {
    let result = 1n;
    const total = BigInt(n);
    const step = Math.max(1, Math.floor(n / PROGRESS_STEPS));
    for (let i = 2; i <= n; i++) {
        result *= BigInt(i);
        if (i % step === 0) {
            emitProgress((i / n) * 100);
        }
    }
    emitProgress(99);
    return result;
};
const doubleFactorial = (n) => {
    let result = 1n;
    const start = n % 2 === 0 ? 2 : 1;
    const terms = Math.ceil(n / 2);
    const step = Math.max(1, Math.floor(terms / PROGRESS_STEPS));
    for (let idx = 0; idx < terms; idx++) {
        const value = start + idx * 2;
        result *= BigInt(value);
        if (idx % step === 0) {
            emitProgress((idx / terms) * 100);
        }
    }
    emitProgress(99);
    return result;
};
const superFactorial = (n) => {
    let result = 1n;
    let currentFactorial = 1n;
    const step = Math.max(1, Math.floor(n / PROGRESS_STEPS));
    for (let i = 1; i <= n; i++) {
        currentFactorial *= BigInt(i);
        result *= currentFactorial;
        if (i % step === 0) {
            emitProgress((i / n) * 100);
        }
    }
    emitProgress(99);
    return result;
};
const run = () => {
    const startedAt = Date.now();
    try {
        let output;
        switch (data.type) {
            case task_type_enum_1.TaskType.FACTORIAL:
                output = factorial(data.inputN);
                break;
            case task_type_enum_1.TaskType.DOUBLE_FACTORIAL:
                output = doubleFactorial(data.inputN);
                break;
            case task_type_enum_1.TaskType.SUPER_FACTORIAL:
                output = superFactorial(data.inputN);
                break;
            default:
                throw new Error('Unsupported task type');
        }
        worker_threads_1.parentPort?.postMessage({
            type: 'completed',
            taskId: data.taskId,
            result: output.toString(),
            executionTime: (Date.now() - startedAt) / 1000,
        });
    }
    catch (error) {
        worker_threads_1.parentPort?.postMessage({
            type: 'failed',
            taskId: data.taskId,
            error: error?.message || 'Worker failed',
        });
    }
};
run();
