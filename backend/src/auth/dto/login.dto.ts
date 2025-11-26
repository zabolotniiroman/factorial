import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
	@ApiProperty({
		example: 'Roma',
	})
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9_\-]+$/, {
    message: 'Username can contain only alphanumeric characters, "_" or "-"',
  })
  username!: string
}

