import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ідентифікатор сервера для демонстрації балансування
  const serverId = process.env.SERVER_ID || 'unknown';

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Middleware для логування запитів (показує, який сервер обробляє)
  app.use((req: any, res: any, next: any) => {
    const method = req.method;
    const url = req.url;
    console.log(`[${serverId}] ${method} ${url}`);
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('FactorialGrid API')
    .setDescription('Документація API для розподілених обчислень')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Порт з environment variable (встановлено в docker-compose.yml)
  const port = process.env.PORT || 8080; 

  // Слухаємо на 0.0.0.0 щоб Docker міг проксувати запити
  await app.listen(port, '0.0.0.0'); 

  console.log(`Application is running on port: ${port}`);
  console.log(`Access via load balancer: http://localhost:8080/api/docs`);
}

bootstrap();