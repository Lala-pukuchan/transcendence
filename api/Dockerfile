# 基本的にはfrontのものと同じ
FROM node:16-alpine
ARG API_WORKDIR
WORKDIR ${API_WORKDIR}
ENV TZ Asia/Tokyo
RUN apk update
RUN apk upgrade
RUN apk add git vim
# NestJSをグローバルインストールしておく
RUN yarn global add @nestjs/cli
