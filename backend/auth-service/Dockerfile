FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]