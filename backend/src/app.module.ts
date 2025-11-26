import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Task } from './tasks/task.entity'
import { User } from './users/user.entity'
import { TasksModule } from './tasks/tasks.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'secret',
      database: process.env.DB_DATABASE || 'factorial',
      entities: [Task, User],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    TasksModule,
  ],
})
export class AppModule {}

