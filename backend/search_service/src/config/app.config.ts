import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';

dotenv.config();
// console.log(process.env.ELASTICSEARCH_NODE);
// console.log(process.env.ELASTICSEARCH_USERNAME);
// console.log(process.env.ELASTICSEARCH_PASSWORD);
if (!process.env.ELASTICSEARCH_NODE || !process.env.ELASTICSEARCH_USERNAME || !process.env.ELASTICSEARCH_PASSWORD) {
  
  throw new Error('Missing required environment variables for Elasticsearch configuration');
}

export const elasticsearchClient = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  },
  tls: {
    rejectUnauthorized: false 
  }
});