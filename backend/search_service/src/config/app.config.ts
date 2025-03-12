import { Client } from '@elastic/elasticsearch';

export const elasticsearchClient = new Client({
  node: 'https://34.69.91.173:9200',
  auth: {
    username: 'elastic',
    password: '123456789' 
  },
  tls: {
    rejectUnauthorized: false 
  }
});