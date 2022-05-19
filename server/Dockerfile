ARG HOME_APP=/app
FROM node:lts-alpine as builder
ARG HOME_APP
WORKDIR ${HOME_APP}
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY tsconfig.json .
COPY src src
RUN npm run compile
CMD [ "node", "compile/index.js" ]

FROM node:lts-alpine
ARG HOME_APP
ENV NODE_ENV=production
WORKDIR /server
COPY --from=builder ${HOME_APP}/compile .
COPY --from=builder ${HOME_APP}/package.json .
COPY --from=builder ${HOME_APP}/package-lock.json .
RUN npm i
CMD ["node", "index.js"]