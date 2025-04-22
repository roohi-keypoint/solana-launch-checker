FROM node:23-bookworm-slim AS builder

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

RUN yarn install

COPY src/ ./src/

RUN yarn build

FROM node:23-bookworm-slim AS runner

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN apt update
RUN apt install --assume-yes --no-install-recommends build-essential python3

RUN yarn install --production
RUN yarn add bigint-buffer
RUN yarn rebuild

COPY --from=builder /app/dist ./dist

ENTRYPOINT ["node", "dist/index.js"]
