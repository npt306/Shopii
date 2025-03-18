import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApigatewayModule } from './apigateway/apigateway.module';
import { ProductModule } from './modules/product/product.modele';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from "../../user_auth/src/guards/permission.guard";

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
    VouchersModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
  }],
})
export class AppModule {}
