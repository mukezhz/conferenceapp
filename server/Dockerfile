FROM node:lts-slim
WORKDIR /server
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn
COPY . .
RUN yarn compile
CMD ["yarn", "dev"]
EXPOSE 8000