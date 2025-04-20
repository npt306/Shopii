import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import multiPart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 50 * 1024 * 1024 }),
  );

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: [
      'http://localhost:8000',
      'http://localhost:8001',
      'http://34.58.241.34:8000',
      'http://34.58.241.34:8001',],
    credentials: true,
  });

  await app.register(multiPart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB
    },
  });

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway for the Shopii microservices')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-document', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
