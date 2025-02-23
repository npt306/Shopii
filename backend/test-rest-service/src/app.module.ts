import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestRestController } from './test-rest/test-rest.controller';

@Module({
  imports: [],
  controllers: [AppController, TestRestController],
  providers: [AppService],
})
export class AppModule {}
