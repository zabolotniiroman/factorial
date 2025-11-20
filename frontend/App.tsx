import React, { useEffect, useState, useCallback } from 'react'
import { AuthForm } from './components/AuthForm'
import { NewTaskForm } from './components/NewTaskForm'
import { TaskCard } from './components/TaskCard'
import { getTasks, cancelTask } from './services/apiService'
import { Task, User } from './types'

// Polling interval for task updates
const POLLING_INTERVAL = 1500

const App: React.FC = () => {
	const [user, setUser] = useState<User | null>(null)
	const [tasks, setTasks] = useState<Task[]>([])

	// Simple session persistence
	useEffect(() => {
		const savedUser = localStorage.getItem('user')
		if (savedUser) {
			setUser(JSON.parse(savedUser))
		}
	}, [])

	const handleLogin = (loggedInUser: User) => {
		setUser(loggedInUser)
		localStorage.setItem('user', JSON.stringify(loggedInUser))
	}

	const handleLogout = () => {
		setUser(null)
		localStorage.removeItem('user')
	}

	const fetchTasks = useCallback(async () => {
		if (!user) return
		const data = await getTasks()
		setTasks(data)
	}, [user])

	// Poll for updates
	useEffect(() => {
		if (!user) return
		fetchTasks() // Initial load

		const interval = setInterval(fetchTasks, POLLING_INTERVAL)
		return () => clearInterval(interval)
	}, [user, fetchTasks])

	const handleCancel = async (id: string) => {
		await cancelTask(id)
		fetchTasks()
	}

	if (!user) {
		return <AuthForm onLogin={handleLogin} />
	}

	return (
		<div className='min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-blue-500/30'>
			{/* Navbar */}
			<nav className='sticky top-0 z-50 bg-gray-800/80 backdrop-blur-md border-b border-gray-700'>
				<div className='container mx-auto px-4 h-16 flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='bg-blue-600 p-2 rounded-lg'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 text-white'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
								/>
							</svg>
						</div>
						<h1 className='text-xl font-bold tracking-tight'>
							Factorial<span className='text-blue-500'>Grid</span>
						</h1>
					</div>

					<div className='flex items-center gap-4'>
						<div className='text-right hidden sm:block'>
							<div className='text-sm font-medium text-white'>
								{user.username}
							</div>
							<div className='text-xs text-green-400 flex items-center justify-end gap-1'>
								<span className='block h-2 w-2 rounded-full bg-green-500 animate-pulse'></span>
								Підключено
							</div>
						</div>
						<button
							onClick={handleLogout}
							className='p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors'
							title='Вийти'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-6 w-6'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
								/>
							</svg>
						</button>
					</div>
				</div>
			</nav>

			<main className='container mx-auto px-4 py-8'>
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Left Column: Create Task */}
					<div className='lg:col-span-1 space-y-6'>
						<NewTaskForm onTaskCreated={fetchTasks} />

						<div className='rounded-xl bg-gray-800/50 p-6 border border-gray-700/50'>
							<h3 className='text-sm font-bold text-gray-400 uppercase tracking-wider mb-4'>
								Статус системи
							</h3>
							<div className='space-y-3'>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-500'>Балансувальник</span>
									<span className='text-green-400'>Активний</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-500'>
										Вузли обробки (Workers)
									</span>
									<span className='text-white'>2 / 2 Онлайн</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-500'>Активні задачі</span>
									<span className='text-white'>
										{
											tasks.filter(
												t =>
													t.status === 'PROCESSING' || t.status === 'PENDING'
											).length
										}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column: Task History */}
					<div className='lg:col-span-2'>
						<h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 text-blue-400'
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
							Черга задач та історія
						</h2>

						{tasks.length === 0 ? (
							<div className='flex flex-col items-center justify-center h-64 rounded-xl bg-gray-800 border border-gray-700 border-dashed text-gray-500'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-12 w-12 mb-2 opacity-50'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
									/>
								</svg>
								<p>Історія порожня. Створіть нову задачу.</p>
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{tasks.map(task => (
									<TaskCard
										key={task.id}
										task={task}
										onCancel={handleCancel}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	)
}

export default App

