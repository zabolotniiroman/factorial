import { Task, TaskStatus, TaskType } from '../types'

const API_URL = 'http://localhost:8080/api'

export const login = async (username: string): Promise<boolean> => {
	try {
		const res = await fetch(`${API_URL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username }),
		})
		return res.ok
	} catch (e) {
		console.error('Backend connection failed', e)
		return false
	}
}

export const createTask = async (type: TaskType, n: number): Promise<Task> => {
	const username = localStorage.getItem('user')
		? JSON.parse(localStorage.getItem('user')!).username
		: 'guest'

	const response = await fetch(
		`${API_URL}/tasks?username=${encodeURIComponent(username)}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type, input_n: n }),
		}
	)

	if (!response.ok) {
		const errorData = await response.json()
		throw new Error(errorData.detail || 'Failed to create task')
	}

	const data = await response.json()
	// Конвертуємо дати з рядків в Date об'єкти
	return {
		...data,
		createdAt: new Date(data.created_at),
		inputN: data.input_n,
	}
}

export const getTasks = async (): Promise<Task[]> => {
	try {
		const username = localStorage.getItem('user')
			? JSON.parse(localStorage.getItem('user')!).username
			: 'guest'

		const response = await fetch(
			`${API_URL}/tasks?username=${encodeURIComponent(username)}`
		)
		if (!response.ok) return []
		const data = await response.json()
		// Конвертуємо дані з API в формат фронтенду
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
	const username = localStorage.getItem('user')
		? JSON.parse(localStorage.getItem('user')!).username
		: 'guest'

	await fetch(
		`${API_URL}/tasks/${taskId}/cancel?username=${encodeURIComponent(
			username
		)}`,
		{
			method: 'POST',
		}
	)
}

