import { Injectable } from '@nestjs/common';
import { elasticsearchClient } from '../config/app.config';
import {ProductDTO} from './dto/product.dto';
@Injectable()
export class SearchService {
  private readonly index = 'search';
  private readonly productsPerPage = 5;

  async indexDocument(document: any) {
    try {
      return await elasticsearchClient.index({
        index: this.index,
        document
      });
    } catch (error) {
      throw new Error(`Failed to index document: ${error.message}`);
    }
  }

  async bulkIndex(documents: any[]) {
    try {
      return await elasticsearchClient.helpers.bulk({
        index: this.index,
        datasource: documents,
        onDocument: () => ({ index: {} })
      });
    } catch (error) {
      throw new Error(`Failed to bulk index documents: ${error.message}`);
    }
  }

  async search(query: string, page: number) {
    try {
      console.log('Search query:', query, 'Page:', page);
      const response = await elasticsearchClient.search({
        index: this.index,
        size: this.productsPerPage,
        from: (page - 1) * this.productsPerPage,
        query: {                                                  
          multi_match: {
            query: query,
            fields: ['Name'],
          },
        },
      });

      const totalHits = response.hits.total as { value: number };
      const totalPages = Math.ceil(totalHits.value / this.productsPerPage);

      return {
        $: response.hits.hits,
        totalPages: totalPages,
        currentPage: page,
        totalProducts: totalHits.value
      };
    } catch (error: any) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}