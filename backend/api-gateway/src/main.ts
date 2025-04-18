import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import multiPart from '@fastify/multipart';
import { KeycloakMiddleware } from './middleware/keycloak.middleware';
import * as cookieParser from 'cookie-parser';
import fastifyCookie from 'fastify-cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  //decorate the request object to add userInfo so we can access it via fastify in permission guard or other places
  app.getHttpAdapter().getInstance().decorateRequest('userInfo', null);
  app.register(fastifyCookie);

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.use(new KeycloakMiddleware().use);
  app.enableCors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: false  
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
