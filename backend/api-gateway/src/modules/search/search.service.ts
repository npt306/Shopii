import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ProductDocument } from './dto/product.dto';
@Injectable()
export class SearchService {
  constructor(private readonly httpService: HttpService) {}

  async indexDocument(document: ProductDocument): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post('/search/index', document)
    );
    return response.data;
  }

  async bulkIndex(documents: ProductDocument[]): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post('/search/bulk', documents)
    );
    return response.data;
  }

  async search(
    query: string,
    Categories?: string,
    page: number = 1,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<any> {
    const params: any = {
      q: query,
      page: page,
    };

    if (Categories) {
      params.Categories = Categories;
    }
    if (minPrice !== undefined) {
      params.minPrice = minPrice;
    }
    if (maxPrice !== undefined) {
      params.maxPrice = maxPrice;
    }

    const response = await lastValueFrom(
      this.httpService.get('/search', { params })
    );
    return response.data;
  }
}