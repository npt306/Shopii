import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // HTTP service for other endpoints
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // gRPC microservice
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'seller',
      protoPath: join(__dirname, 'proto/seller.proto'),
    },
  });

  await grpcApp.listen();
  await app.listen(3008);
}
bootstrap();
