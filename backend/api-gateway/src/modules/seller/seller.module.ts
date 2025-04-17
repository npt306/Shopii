import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { SellerResolver } from './seller.resolver';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.ACCOUNTS_SERVICE_URL, 
    }),
    
    ClientsModule.registerAsync([
      {
        name: 'SELLER_PACKAGE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('ACCOUNTS_SERVICE_GRPC_URL', 'localhost:5000'),
            package: 'seller',
            protoPath: join(__dirname, '../../proto/seller.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [SellerController],
  providers: [SellerService, SellerResolver],
  exports: [SellerService],
})
export class SellerModule {}
