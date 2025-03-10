import { Client } from '@elastic/elasticsearch';

export const elasticsearchClient = new Client({
  node: 'https://34.69.91.173:9200',
  auth: {
    username: 'elastic',
    password: '123456789' // Use the password you set in .env
  },
  tls: {
    rejectUnauthorized: false // Only for development
  }
});