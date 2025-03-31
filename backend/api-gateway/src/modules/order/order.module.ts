import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderController } from './order.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderService } from './order.service';

console.log(process.env.ORDER_SERVICE_URL);
@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.registerAsync({
      imports: [ConfigModule], // Đưa ConfigModule vào
      inject: [ConfigService], // Inject ConfigService
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('ORDER_SERVICE_URL'), // Lấy từ ConfigService
      }),
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
