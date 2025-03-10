import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApigatewayModule } from './apigateway/apigateway.module';
import { ProductModule } from './modules/product/product.modele';
@Module({
  imports: [
    // Protect Gateway from DDoS attacks and limit number of requests per IP
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // 60 seconds
          limit: 100, // 100 requests
        },
      ],
    }),
    ApigatewayModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
