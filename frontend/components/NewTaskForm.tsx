import React, { useState } from 'react'
import { TaskType } from '../types'
import { createTask } from '../services/apiService'

interface NewTaskFormProps {
	onTaskCreated: () => void
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({ onTaskCreated }) => {
	const [n, setN] = useState<number | ''>('')
	const [type, setType] = useState<TaskType>(TaskType.FACTORIAL)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!n) return

		setLoading(true)
		setError(null)

		try {
			await createTask(type, Number(n))
			onTaskCreated()
			setN('') // Reset
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='rounded-xl bg-gray-800 p-6 shadow-lg border border-gray-700'>
			<h3 className='mb-4 text-xl font-bold text-white flex items-center gap-2'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-6 w-6 text-green-400'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
					/>
				</svg>
				Нова обчислювальна задача
			</h3>

			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label className='block text-sm font-medium text-gray-400 mb-1'>
						Вхідні дані (N)
					</label>
					<input
						type='number'
						value={n}
						onChange={e => setN(Number(e.target.value))}
						className='w-full rounded-lg bg-gray-700 p-2 text-white border border-gray-600 focus:border-green-500 focus:outline-none'
						placeholder='Введіть ціле число (напр., 5000)'
						min='1'
						required
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-400 mb-1'>
						Алгоритм
					</label>
					<select
						value={type}
						onChange={e => setType(e.target.value as TaskType)}
						className='w-full rounded-lg bg-gray-700 p-2 text-white border border-gray-600 focus:border-green-500 focus:outline-none'
					>
						<option value={TaskType.FACTORIAL}>Факторіал (n!)</option>
						<option value={TaskType.DOUBLE_FACTORIAL}>
							Подвійний факторіал (n!!)
						</option>
						<option value={TaskType.SUPER_FACTORIAL}>
							Суперфакторіал (sf(n))
						</option>
					</select>
				</div>

				{error && (
					<div className='rounded-md bg-red-900/50 p-3 text-sm text-red-200 border border-red-800'>
						{error}
					</div>
				)}

				<button
					type='submit'
					disabled={loading || !n}
					className='w-full rounded-lg bg-green-600 p-2 font-semibold text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
				>
					{loading ? 'Відправка...' : 'Відправити на обробку'}
				</button>
			</form>
		</div>
	)
}

