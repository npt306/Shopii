import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProductModule } from './modules/product/product.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { UsersModule } from './modules/users/user.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CategoryModule } from './modules/category/category.module';
import { ConfigModule } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './guard/permission.guard';
import { AccountsModule } from './modules/accounts/accounts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Protect Gateway from DDoS attacks and limit number of requests per IP
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // 60 seconds
          limit: 100, // 100 requests
        },
      ],
    }),
    ProductModule,
    VouchersModule,
    UsersModule,
    OrderModule,
    AccountsModule,
    PaymentModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule { }
