export enum TaskType {
	FACTORIAL = 'FACTORIAL',
	DOUBLE_FACTORIAL = 'DOUBLE_FACTORIAL',
	SUPER_FACTORIAL = 'SUPER_FACTORIAL',
}

export enum TaskStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	COMPLETED = 'COMPLETED',
	FAILED = 'FAILED',
	CANCELLED = 'CANCELLED',
}

export interface User {
	username: string
	isAuthenticated: boolean
}

export interface Task {
	id: string
	type: TaskType
	inputN: number
	status: TaskStatus
	progress: number
	createdAt: Date
	assignedServer?: string
	result?: string
	executionTime?: number
	error?: string
}

