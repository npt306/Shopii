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


// async deleteDocument(id: string) {
//   try {
//     // Ensure index is defined
//     if (!this.index) {
//       throw new Error("Elasticsearch index is not defined");
//     }

//     // Step 1: Search for documents with the matching ProductID
//     const searchResponse = await elasticsearchClient.search({
//       index: this.index,
//       body: {
//         query: {
//           term: {
//             ProductID: id,
//           },
//         },
//       },
//     });

//     // Step 2: Check if any documents were found
//     const hits = searchResponse.hits.hits;
//     if (hits.length === 0) {
//       throw new Error(`No document found with ProductID ${id}`);
//     }

//     // Step 3: Delete each matching document by its _id
//     // const deletePromises = hits.map((hit) =>
//     //   elasticsearchClient.delete({
//     //     index: this.index, // Now guaranteed to be a string
//     //     id: hit._id,
//     //   })
//     // );

//       // Step 4: Execute all delete operations
//       await Promise.all(deletePromises);

//       return {
//         message: `Successfully deleted ${hits.length} document(s) with ProductID ${id}`,
//         deletedCount: hits.length,
//       };
//     } catch (error) {
//       throw new Error(`Failed to delete document(s) with ProductID ${id}: ${error.message}`);
//     }
//   }

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