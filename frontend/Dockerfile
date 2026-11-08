FROM node:22-alpine AS base

ENV YARN_VERSION=4.9.1 NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache python3 py3-setuptools make g++

# install and use yarn 4.x
RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate
