import { IsEnum, IsInt, IsPositive } from 'class-validator'
import { TaskType } from '../enums/task-type.enum'

export class CreateTaskDto {
  @IsEnum(TaskType)
  type!: TaskType

  @IsInt()
  @IsPositive()
  input_n!: number
}

