import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = 'http://34.58.241.34:3000/api';

const productListDuration = new Trend('product_list_duration', true);
const productDetailDuration = new Trend('product_detail_duration', true);

const errorRate = new Rate('errors');

export const options = {

  scenarios: {

    load_test: {
      executor: 'ramping-vus', 
      startVUs: 0,
      stages: [
        { duration: '30s', target: 500 }, 
        { duration: '1m', target: 500 },  
        { duration: '15s', target: 0 },  
      ],
      gracefulRampDown: '10s', 
      exec: 'runScenario', 
      tags: { test_type: 'load' }, 
      env: { BASE_URL: BASE_URL },
    },
  },

  thresholds: {

    'http_req_duration': ['p(95)<800'], 
    'errors': ['rate<0.05'],            

    'product_list_duration{test_type:load}': ['p(95)<500'], 
    'product_list_duration{test_type:stress}': ['p(95)<1500'], 

    'product_detail_duration{test_type:load}': ['p(95)<600'],
    'product_detail_duration{test_type:stress}': ['p(95)<1800'],

    'checks{test_type:load}': ['rate>0.98'], 
    'checks{test_type:stress}': ['rate>0.9'], 
  },
};

export function runScenario() {
  let productId = null;

  const productListRes = http.get(`${BASE_URL}/product/list`);
  const productListCheck = check(productListRes, {
    'Product List: Status is 200': (r) => r.status === 200,
    'Product List: Response body is not empty': (r) => r.body && r.body.length > 0,
  });
  productListDuration.add(productListRes.timings.duration); 
  errorRate.add(!productListCheck); 

  if (!productListCheck) {
    console.error(`Product List request failed! Status: ${productListRes.status}, Body: ${productListRes.body}`);

  }

  try {
    if (productListRes.status === 200 && productListRes.body) {
      const productsData = productListRes.json();
      if (productsData && Array.isArray(productsData.products) && productsData.products.length > 0) {

        const randomIndex = Math.floor(Math.random() * productsData.products.length);
        productId = productsData.products[randomIndex].id;

      } else {
        console.warn(`VU ${__VU} ITER ${__ITER}: Product list response format unexpected or empty.`);
      }
    }
  } catch (e) {
    console.error(`VU ${__VU} ITER ${__ITER}: Error parsing product list JSON: ${e}. Body: ${productListRes.body}`);
  }

  sleep(1); 

  if (productId) {
    const productDetailRes = http.get(`${BASE_URL}/product/detail/${productId}`);
    const productDetailCheck = check(productDetailRes, {
      'Product Detail: Status is 200': (r) => r.status === 200,
      'Product Detail: Contains product name': (r) => r.json('name') !== undefined,
    });
    productDetailDuration.add(productDetailRes.timings.duration); 
    errorRate.add(!productDetailCheck); 

    if (!productDetailCheck) {
      console.error(`Product Detail request failed for ID ${productId}! Status: ${productDetailRes.status}, Body: ${productDetailRes.body}`);
    }

    sleep(1); 
  } else {
    console.warn(`VU ${__VU} ITER ${__ITER}: Skipping product detail request as no productId was extracted.`);

    sleep(1);
  }

}