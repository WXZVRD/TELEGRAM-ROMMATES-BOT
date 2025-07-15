FROM node:20

WORKDIR /src

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run build

CMD ["node", "dist/main"]
