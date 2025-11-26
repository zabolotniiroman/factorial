import { IsEnum, IsInt, IsPositive, Min } from 'class-validator'
import { TaskType } from '../enums/task-type.enum'
import { ApiProperty } from '@nestjs/swagger'

export class CreateTaskDto {
	@ApiProperty({
		description: 'Тип обчислення',
		enum: TaskType,
		example: TaskType.FACTORIAL,
	})
	@IsEnum(TaskType)
	type: TaskType

	@ApiProperty({
		description: 'Вхідне число N',
		minimum: 1,
		maximum: 500000,
		example: 50,
	})
	@IsInt()
	@Min(1)
	input_n: number
}
