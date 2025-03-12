import { Injectable } from '@nestjs/common';
import { elasticsearchClient } from '../config/app.config';
import {ProductDTO} from './dto/product.dto';
@Injectable()
export class SearchService {
  private readonly index = 'search';

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

  async search(query: string) {
    try {
      console.log('Search query:', query);
      const response = await elasticsearchClient.search({
        index: this.index,
        size: 100,
        query: {                                                  
          multi_match: {
            query: query,
            fields: ['Name'],
          },
        },
      });
      
      return { $: response.hits.hits };
    } catch (error: any) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}