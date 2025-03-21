import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { KeycloakMiddleware } from './middleware/keycloak.middleware';
import { env } from 'process';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.use(new KeycloakMiddleware().use);
    app.enableCors({
      // `http://34.58.241.34:8000` 
      // origin: [`http://34.58.241.34:8000`, `http://34.58.241.34:8001`], // frontend URL
      origin: [`http://localhost:8000`, `http://localhost:8001`], // frontend URLs
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true, // Important for cookies to work cross-domain
    });
    await app.listen(3003);
  } catch (error) {
    console.error('Error during application startup', error);
  }
}
bootstrap();
