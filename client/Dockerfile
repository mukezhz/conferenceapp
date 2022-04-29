FROM node:lts-slim as node
WORKDIR /client
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn
COPY . .
RUN yarn build
# CMD ["yarn", "start"]

FROM nginx:alpine
COPY --from=node /client/dist /usr/share/nginx/html