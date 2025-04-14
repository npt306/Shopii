import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    ParseIntPipe,
    ParseArrayPipe,
  } from '@nestjs/common';
  import { SearchService } from './search.service';
  
  @Controller('api/search')
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
    async search(
      @Query('q') query: string,
      @Query('Categories') Categories?: string,
      @Query('page') page?: number,
      @Query('minPrice') minPrice?: number,
      @Query('maxPrice') maxPrice?: number,
    ) {
      return await this.searchService.search(query, Categories, page, minPrice, maxPrice);
    }
  }
