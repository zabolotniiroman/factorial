import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	// Налаштування CORS
	app.enableCors({
		origin: ['http://localhost:5173', 'http://localhost:3000'],
		credentials: true,
	})

	// Глобальний префікс для всіх роутів (localhost:8080/api/...)
	app.setGlobalPrefix('api')

	// Валідація даних
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
			transformOptions: { enableImplicitConversion: true },
		})
	)

	// --- НАЛАШТУВАННЯ SWAGGER ---
	const config = new DocumentBuilder()
		.setTitle('FactorialGrid API')
		.setDescription('Документація API для розподілених обчислень')
		.setVersion('1.0')
		.addTag('tasks', 'Операції з задачами')
		.addTag('auth', 'Авторизація')
		.build()

	const document = SwaggerModule.createDocument(app, config)

	// Swagger буде доступний за адресою /api/docs
	SwaggerModule.setup('api/docs', app, document)
	// -----------------------------

	const port = process.env.PORT || 8080
	await app.listen(port)

	console.log(
		`FactorialGrid backend is running on http://localhost:${port}/api`
	)
	console.log(
		`Swagger documentation is available at http://localhost:${port}/api/docs`
	)
}

bootstrap()
