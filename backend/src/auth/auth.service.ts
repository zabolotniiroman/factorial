import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOrCreate(loginDto.username)
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      username: user.username,
      userId: user.id,
    }
  }
}

