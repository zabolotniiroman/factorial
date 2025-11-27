import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

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

  // --- ВИПРАВЛЕННЯ ТУТ ---
  
  // 1. Змінюємо дефолтний порт на 3000 (щоб співпадало з nginx.conf)
  const port = process.env.PORT || 3000; 

  // 2. Додаємо '0.0.0.0' другим аргументом (щоб Docker "відкрив" порт для Nginx)
  await app.listen(port, '0.0.0.0'); 

  console.log(
    `Application is running on: ${await app.getUrl()}`
  );
  console.log(
    `Swagger documentation is available at http://localhost:8080/api/docs` 
    // (Зверніть увагу: в консолі контейнера порт буде 3000, 
    // але в браузері ви заходите через Nginx на 8080)
  );
}

bootstrap();