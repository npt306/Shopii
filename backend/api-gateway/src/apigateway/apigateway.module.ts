import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApigatewayController } from './apigateway.controller';

@Module({
  imports: [HttpModule],
  controllers: [ApigatewayController],
})
export class ApigatewayModule {}
