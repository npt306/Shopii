import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { SearchService } from './app.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('index')
  async indexDocument(@Body() document: any) {
    return await this.searchService.indexDocument(document);
  }

  @Post('bulk')
  async bulkIndex(@Body() documents: any[]) {
    return await this.searchService.bulkIndex(documents);
  }

  @Get() 
  async search(@Query('q') query: string) {
    console.log('Search query:', query);
    return await this.searchService.search(query);
  }
}