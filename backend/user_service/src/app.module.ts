import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { VoucherModule } from './vouchers/voucher.module';
import { User } from './users/entities/user.entity';
import { UserVoucher } from './vouchers/entities/user-voucher.entity';
import { Voucher } from './vouchers/entities/voucher.entity';
import { VoucherHistory } from './vouchers/entities/voucher-history.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Voucher, VoucherHistory, UserVoucher],
        synchronize: false,
      }),
    }),
    UserModule,
    VoucherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
