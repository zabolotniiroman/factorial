import React, { useState } from 'react'
import { login } from '../services/apiService'
import { User } from '../types'

interface AuthFormProps {
	onLogin: (user: User) => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
	const [username, setUsername] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			const success = await login(username)
			if (success) {
				onLogin({ username, isAuthenticated: true })
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-900 p-4'>
			<div className='w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-2xl border border-gray-700'>
				<h2 className='mb-6 text-3xl font-bold text-white text-center'>
					Вхід у систему
				</h2>
				<p className='mb-6 text-gray-400 text-center'>
					Лабораторія розподілених обчислень
				</p>
				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label className='block text-sm font-medium text-gray-300'>
							Студентський квиток / Ім'я
						</label>
						<input
							type='text'
							value={username}
							onChange={e => setUsername(e.target.value)}
							className='mt-1 w-full rounded-lg bg-gray-700 p-3 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
							placeholder='наприклад: student_01'
							required
						/>
					</div>
					<button
						type='submit'
						disabled={loading}
						className='w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50'
					>
						{loading ? 'Авторизація...' : 'Підключитися до кластера'}
					</button>
				</form>
				<div className='mt-4 text-center text-xs text-gray-500'>
					Тільки авторизований доступ
				</div>
			</div>
		</div>
	)
}

