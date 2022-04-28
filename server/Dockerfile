FROM node:lts-slim
WORKDIR /server
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn
COPY . .
CMD ["yarn", "serve"]