import { Module } from '@nestjs/common';
import { UsersController } from './Users/users/users.controller';
import { UsersService } from './Users/users/users.service';
import { UsersModule } from './Users/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: configService => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [join(process.cwd(), 'dist/**/*.entity{.ts,.js}')],
        synchronize: false,
      }),
    }),
    UsersModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule { }