ARG HOME_APP=/app
FROM node:lts-slim as builder
ARG HOME_APP
WORKDIR ${HOME_APP}
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY tsconfig.json .
COPY src src
RUN npm run compile

# FROM node:lts-slim
# ARG HOME_APP
# WORKDIR /server
# COPY --from=builder ${HOME_APP}/compile .
# CMD ["node", "index.js"]