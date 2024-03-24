FROM node:21-alpine AS base

ENV YARN_VERSION=4.1.0 NEXT_TELEMETRY_DISABLED=1

RUN apk update && apk upgrade

# install and use yarn 4.x
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

