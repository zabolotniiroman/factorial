import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Task } from './tasks/task.entity'
import { User } from './users/user.entity'
import { TasksModule } from './tasks/tasks.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import * as path from 'path'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: path.resolve(__dirname, '..', 'data', 'factorial.db'),
      entities: [Task, User],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    TasksModule,
  ],
})
export class AppModule {}

