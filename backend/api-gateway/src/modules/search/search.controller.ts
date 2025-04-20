import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Delete,
    Param,
    ParseIntPipe,
    ParseArrayPipe,
  } from '@nestjs/common';
  import { SearchService } from './search.service';
  import { ProductDocument } from './dto/product.dto';
  @Controller('api/search')
  export class SearchController {
    constructor(private readonly searchService: SearchService) {}
  
    @Post('index')
    async indexDocument(@Body() document: ProductDocument) {
      return await this.searchService.indexDocument(document);
    }
  
    @Post('bulk')
    async bulkIndex(@Body() documents: ProductDocument[]) {
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
    @Delete(':id')
    async delete(@Param('id') id: string) {
      console.log('Deleting document with ID:', id); // Log the ID being deleted
      return await this.searchService.deleteDocument(id);
    }
  }
