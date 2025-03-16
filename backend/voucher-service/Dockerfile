FROM node:20-alpine

WORKDIR /usr/src/app

COPY backend/voucher-service/package*.json ./

RUN npm install --omit=dev 

COPY backend/voucher-service .

RUN npm run build

EXPOSE 3002

CMD ["node", "dist/main"]