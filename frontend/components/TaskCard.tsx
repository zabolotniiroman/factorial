import React from 'react'
import { Task, TaskStatus, TaskType } from '../types'

interface TaskCardProps {
	task: Task
	onCancel: (id: string) => void
}

const statusColor = (status: TaskStatus) => {
	switch (status) {
		case TaskStatus.PENDING:
			return 'bg-yellow-500/20 text-yellow-300 border-yellow-700'
		case TaskStatus.PROCESSING:
			return 'bg-blue-500/20 text-blue-300 border-blue-700'
		case TaskStatus.COMPLETED:
			return 'bg-green-500/20 text-green-300 border-green-700'
		case TaskStatus.FAILED:
			return 'bg-red-500/20 text-red-300 border-red-700'
		case TaskStatus.CANCELLED:
			return 'bg-gray-600/20 text-gray-400 border-gray-600'
		default:
			return 'bg-gray-800'
	}
}

const getTaskTypeName = (type: TaskType) => {
	switch (type) {
		case TaskType.FACTORIAL:
			return 'Факторіал'
		case TaskType.DOUBLE_FACTORIAL:
			return 'Подвійний Факторіал'
		case TaskType.SUPER_FACTORIAL:
			return 'Суперфакторіал'
		default:
			return type
	}
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onCancel }) => {
	return (
		<div className='relative overflow-hidden rounded-lg bg-gray-800 p-4 shadow-md border border-gray-700 hover:border-gray-600 transition-colors'>
			{/* Header */}
			<div className='flex justify-between items-start mb-3'>
				<div>
					<div className='text-xs text-gray-500 uppercase tracking-wider mb-1'>
						ID задачі: {task.id}
					</div>
					<h4 className='font-bold text-white'>{getTaskTypeName(task.type)}</h4>
					<div className='text-sm text-gray-400'>
						Вхідні дані N: {task.inputN}
					</div>
				</div>
				<div
					className={`px-2 py-1 rounded text-xs font-bold border ${statusColor(
						task.status
					)}`}
				>
					{task.status}
				</div>
			</div>

			{/* Load Balancer Info */}
			<div className='mb-4 flex items-center gap-2 text-xs text-indigo-300 bg-indigo-900/20 p-1.5 rounded w-fit'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-4 w-4'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
					/>
				</svg>
				Сервер: {task.assignedServer || 'Очікування LB...'}
			</div>

			{/* Progress Bar */}
			{(task.status === TaskStatus.PROCESSING ||
				task.status === TaskStatus.PENDING) && (
				<div className='mb-3'>
					<div className='flex justify-between text-xs text-gray-400 mb-1'>
						<span>Прогрес</span>
						<span>{task.progress.toFixed(0)}%</span>
					</div>
					<div className='h-2 w-full rounded-full bg-gray-700 overflow-hidden'>
						<div
							className='h-full bg-blue-500 transition-all duration-300 ease-out'
							style={{ width: `${task.progress}%` }}
						/>
					</div>
				</div>
			)}

			{/* Result Area */}
			{task.status === TaskStatus.COMPLETED && (
				<div className='mt-2 rounded bg-gray-900 p-2 text-sm font-mono text-green-400 break-all border border-gray-800'>
					Результат: {task.result}
					<div className='mt-1 text-xs text-gray-600'>
						Час: {task.executionTime?.toFixed(2)}с
					</div>
				</div>
			)}

			{/* Actions */}
			{(task.status === TaskStatus.PENDING ||
				task.status === TaskStatus.PROCESSING) && (
				<button
					onClick={() => onCancel(task.id)}
					className='mt-2 w-full rounded bg-red-900/30 py-1.5 text-xs text-red-300 hover:bg-red-900/50 transition-colors border border-red-900/50'
				>
					Скасувати виконання
				</button>
			)}
		</div>
	)
}
