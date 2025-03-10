import { Module } from '@nestjs/common';
import { SearchService } from './app.service';
import { SearchController } from './app.controller';

@Module({
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService]
})
export class SearchModule {}