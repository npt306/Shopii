import { Injectable } from '@nestjs/common';
import { elasticsearchClient } from '../config/app.config';
import {ProductDocument} from './dto/product.dto';

interface SearchHit {
  _id: string; // Explicitly type _id as string
  _source: {
    ProductID: string;
    [key: string]: any; // Adjust based on your document structure
  };
}

interface SearchResponse {
  hits: {
    hits: SearchHit[];
  };
}

@Injectable()
export class SearchService {
  private readonly index = 'search_products';

  async indexDocument(document: ProductDocument) {
    try {
      console.log('Indexing document:', document);
      return await elasticsearchClient.index({
        index: this.index,
        document
      });
    } catch (error) {
      throw new Error(`Failed to index document: ${error.message}`);
    }
  }

  async bulkIndex(documents: ProductDocument[]) {
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

  async search(query: string, Categories?: string,page?: number,
    minPrice?: number,
    maxPrice?: number,
  ) {
    try {
        console.log('Search query:', query, 'Categories:', Categories, 'Page:', page,'minPrice:',minPrice,
          'maxPrice:',
          maxPrice,);

        const pageSize = 14; // Items per page

        const from = ((page || 1) - 1) * pageSize;

        const mustConditions: any[] = [
            {
                multi_match: {
                    query: query,
                    fields: ['Name'],
                },
            },
        ];

        if (Categories && Categories.length > 0) {
          // Split the categories string into an array
          const categoryArray = Categories.split(',').filter(cat => cat.length > 0);
          
          if (categoryArray.length > 0) {
              mustConditions.push({
                  bool: {
                      should: categoryArray.map(category => ({
                          match: { Categories: category }
                      })),
                      minimum_should_match: 1
                  }
              });
          }
        }
        if (minPrice != null || maxPrice != null) {
          const priceRange: any = { range: { Price: {} } };
          if (minPrice != null) {
            priceRange.range.Price.gte = minPrice;
          }
          if (maxPrice != null) {
            priceRange.range.Price.lte = maxPrice;
          }
          mustConditions.push(priceRange);
        }

        const response = await elasticsearchClient.search({
            index: this.index,
            size: pageSize,
            from: from,
            query: {
                bool: {
                    must: mustConditions,
                },
            },
        });

        const counts = await elasticsearchClient.count({
          index: this.index,
          query: {
              bool: {
                  must: mustConditions,
              },
          },
        
      });

      const totalPages = Math.ceil(counts.count / pageSize);

      console.log('Total hits:', counts.count);

        return { $: response.hits.hits,
          totalPages: totalPages,
          currentPage: page || 1,
          totalItems: counts.count };
    } catch (error: any) {
        throw new Error(`Search failed: ${error.message}`);
    }
}


async deleteByProductID(productID: string) {
  try {
    console.log('Deleting documents for product ID:', productID);
    const response = await elasticsearchClient.deleteByQuery({
      index: this.index,
      query: {
        term: {
          ProductID: productID
        }
      },
      refresh: true // This ensures the changes are immediately visible
    });
    console.log('Delete response:', response);
    return {
      message: `Successfully deleted documents for product ${productID}`,
      deleted: response.deleted,
      total: response.total
    };
  } catch (error) {
    throw new Error(`Failed to delete documents for product ${productID}: ${error.message}`);
  }
}

  async deleteByQuery(query: any) {
    try {
      return await elasticsearchClient.deleteByQuery({
        index: this.index,
        query,
      });
    } catch (error) {
      throw new Error(`Failed to delete documents by query: ${error.message}`);
    }
  }

}