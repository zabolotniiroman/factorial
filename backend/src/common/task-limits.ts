import { TaskType } from '../tasks/enums/task-type.enum'

export const MAX_CONCURRENT_USER_TASKS = 3
export const MAX_TOTAL_QUEUE_SIZE = 20

export const TASK_LIMITS: Record<
  TaskType,
  { maxN: number; description: string }
> = {
  [TaskType.FACTORIAL]: {
    maxN: 20000,
    description: 'Обмеження для запобігання перевантаженню при n!',
  },
  [TaskType.DOUBLE_FACTORIAL]: {
    maxN: 60000,
    description: 'Подвійний факторіал повільніший після 60k',
  },
  [TaskType.SUPER_FACTORIAL]: {
    maxN: 2500,
    description: 'Суперфакторіал росте надто швидко після 2500',
  },
}

