import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(`api`);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors(); // Utilisation de cors

  const config = new DocumentBuilder()
    .setTitle('Simplon Hub API')
    .setDescription('The Simplon Hub API description')
    .setVersion('1.0')
    .addTag('SimplonHub')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
