import { Task, TaskStatus, TaskType } from '../types'

const API_URL = 'http://localhost:8080/api'

export const login = async (username: string): Promise<string | null> => {
	try {
		const res = await fetch(`${API_URL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username }),
		})
		if (res.ok) {
			const data = await res.json()
			return data.access_token
		}
		return null
	} catch (e) {
		console.error('Backend connection failed', e)
		return null
	}
}

const getAuthHeaders = () => {
	const token = localStorage.getItem('access_token')
	return {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`,
	}
}

export const createTask = async (type: TaskType, n: number): Promise<Task> => {
	const response = await fetch(`${API_URL}/tasks`, {
		method: 'POST',
		headers: getAuthHeaders(),
		body: JSON.stringify({ type, input_n: Number(n) }),
	})

	if (!response.ok) {
		const errorData = await response.json()
		throw new Error(errorData.detail || 'Failed to create task')
	}

	const data = await response.json()
	return {
		...data,
		createdAt: new Date(data.created_at),
		inputN: data.input_n,
	}
}

export const getTasks = async (): Promise<Task[]> => {
	try {
		const response = await fetch(`${API_URL}/tasks`, {
			headers: getAuthHeaders(),
		})
		if (!response.ok) return []
		const data = await response.json()
		console.log(data)

		return data.map((task: any) => ({
			...task,
			createdAt: new Date(task.created_at),
			inputN: task.input_n,
			status: task.status as TaskStatus,
			type: task.type as TaskType,
		}))
	} catch (e) {
		console.error('Failed to fetch tasks:', e)
		return []
	}
}

export const cancelTask = async (taskId: string): Promise<void> => {
	await fetch(`${API_URL}/tasks/${taskId}/cancel`, {
		method: 'POST',
		headers: getAuthHeaders(),
	})
}
