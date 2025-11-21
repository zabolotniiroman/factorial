import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async findOrCreate(username: string): Promise<User> {
    const normalized = username.trim().toLowerCase()
    let existing = await this.usersRepository.findOne({
      where: { username: normalized },
    })
    if (existing) {
      return existing
    }
    const user = this.usersRepository.create({ username: normalized })
    return this.usersRepository.save(user)
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username: username.trim().toLowerCase() },
    })
  }
}

