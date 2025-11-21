import { parentPort, workerData } from 'worker_threads'
import { TaskType } from '../enums/task-type.enum'

type Payload = {
  taskId: string
  inputN: number
  type: TaskType
}

const data = workerData as Payload

const PROGRESS_STEPS = 500

const emitProgress = (progress: number) => {
  parentPort?.postMessage({
    type: 'progress',
    taskId: data.taskId,
    progress,
  })
}

const factorial = (n: number) => {
  let result = 1n
  const total = BigInt(n)
  const step = Math.max(1, Math.floor(n / PROGRESS_STEPS))
  for (let i = 2; i <= n; i++) {
    result *= BigInt(i)
    if (i % step === 0) {
      emitProgress((i / n) * 100)
    }
  }
  emitProgress(99)
  return result
}

const doubleFactorial = (n: number) => {
  let result = 1n
  const start = n % 2 === 0 ? 2 : 1
  const terms = Math.ceil(n / 2)
  const step = Math.max(1, Math.floor(terms / PROGRESS_STEPS))
  for (let idx = 0; idx < terms; idx++) {
    const value = start + idx * 2
    result *= BigInt(value)
    if (idx % step === 0) {
      emitProgress((idx / terms) * 100)
    }
  }
  emitProgress(99)
  return result
}

const superFactorial = (n: number) => {
  let result = 1n
  let currentFactorial = 1n
  const step = Math.max(1, Math.floor(n / PROGRESS_STEPS))
  for (let i = 1; i <= n; i++) {
    currentFactorial *= BigInt(i)
    result *= currentFactorial
    if (i % step === 0) {
      emitProgress((i / n) * 100)
    }
  }
  emitProgress(99)
  return result
}

const run = () => {
  const startedAt = Date.now()
  try {
    let output: bigint
    switch (data.type) {
      case TaskType.FACTORIAL:
        output = factorial(data.inputN)
        break
      case TaskType.DOUBLE_FACTORIAL:
        output = doubleFactorial(data.inputN)
        break
      case TaskType.SUPER_FACTORIAL:
        output = superFactorial(data.inputN)
        break
      default:
        throw new Error('Unsupported task type')
    }

    parentPort?.postMessage({
      type: 'completed',
      taskId: data.taskId,
      result: output.toString(),
      executionTime: (Date.now() - startedAt) / 1000,
    })
  } catch (error: any) {
    parentPort?.postMessage({
      type: 'failed',
      taskId: data.taskId,
      error: error?.message || 'Worker failed',
    })
  }
}

run()

