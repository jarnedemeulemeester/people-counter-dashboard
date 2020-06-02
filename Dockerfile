FROM node:14-alpine

WORKDIR /app

COPY . .

RUN yarn install --production

CMD ["node", "index"]