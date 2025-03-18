import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { KeycloakMiddleware } from './middleware/keycloak.middleware';
import { env } from 'process';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.use(new KeycloakMiddleware().use);
    app.enableCors({
      origin: `http://${env.REDIRECT_GATEWAY}`, // frontend URL
      // origin: `http://localhost:8000`, // frontend URL
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
