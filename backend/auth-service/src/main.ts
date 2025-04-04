import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { KeycloakMiddleware } from './middleware/keycloak.middleware';
import { env } from 'process';
import * as cookieParser from 'cookie-parser';
import { EnvValue } from './environment-value/env-value';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.use(new KeycloakMiddleware().use);
    app.enableCors({

      // origin: [`http://34.58.241.34:8000`, `http://34.58.241.34:8001`, `http://34.58.241.34:8002`], // frontend URL
      origin: [ EnvValue.USER_URL, EnvValue.SELLER_URL, EnvValue.ADMIN_URL], // frontend URLs

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
