import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOrCreate(loginDto.username)
    return {
      username: user.username,
      userId: user.id,
      isAuthenticated: true,
    }
  }
}

