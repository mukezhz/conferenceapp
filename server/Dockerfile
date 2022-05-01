FROM node:lts-slim
WORKDIR /server
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn
COPY . .
RUN yarn compile
CMD ["node", "index.js"]
EXPOSE 8000