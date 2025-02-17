FROM node:20-alpine as builder
WORKDIR /home/node/app
COPY ./package.json ./
RUN chown -R node:node /home/node/app
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine as production
WORKDIR /home/node/app
COPY --from=builder /home/node/app ./
CMD ["node", "dist/main.js"]
