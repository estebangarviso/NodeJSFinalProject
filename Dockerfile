###
###   EXPRESSJS
###

# global variables
ARG APP_ENV
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG NODE=node:18.17.1-alpine
ARG NODE_ENV='production'
ARG PORT=8080
ARG HOSTNAME='0.0.0.0'
ARG TIME_ZONE='America/New_York'
ARG LANG='en_US.UTF-8'
ARG PNPM_VER=8.7.1
ARG APP_DIR='/app/'
ARG BUILD_DIR='dist'
ARG PUBLIC_DIR='public'

##
## STAGE 0: base config
##
FROM ${NODE} AS base

ARG APP_DIR
ARG APP_ENV
ARG PNPM_VER
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR ${APP_DIR}

# Install dependencies
RUN echo "Copying base files..."
COPY package.json pnpm-lock.yaml* ./
COPY scripts ./scripts

RUN \
  if [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile --ignore-scripts; \
  else echo "Lockfile not found." && exit 1; \
  fi

# # Generate env file based on the APP_ENV
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
RUN pnpm run env:${APP_ENV}

RUN if [ ! -f "${APP_DIR}.env" ]; then echo "Env file not found." && exit 1; fi

##
## STAGE 1: build
##
FROM base AS builder

ARG APP_DIR
ARG PUBLIC_DIR
ARG NODE_ENV

WORKDIR ${APP_DIR}

# Prepares source files
RUN echo "Copying node_modules from base image"
COPY --from=base ${APP_DIR}node_modules ./node_modules
RUN echo "Copying source files..."
COPY . .

# Build the app
ENV NODE_ENV=${NODE_ENV}
RUN pnpm run build

# Removes unnecessary files and dependencies (https://github.com/tj/node-prune)
RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune
RUN rm -rf \
  'package.json' \
  'pnpm-lock.yaml' \
  'node_modules/.bin'

##
## STAGE 3: exec
##
FROM base AS exec

ARG APP_DIR
ARG LANG
ARG TIME_ZONE
ARG NODE_ENV
ARG PORT
ARG HOSTNAME
ARG BUILD_DIR
ARG PUBLIC_DIR

WORKDIR ${APP_DIR}

# creates user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder ${APP_DIR}${PUBLIC_DIR} ./${PUBLIC_DIR}
# Automatically leverage output traces to reduce image size
# https://expressjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=expressjs:nodejs ${APP_DIR}${BUILD_DIR} ./dist

# alpine security updates
RUN apk --no-cache -U upgrade

# non root user mode
USER expressjs
EXPOSE ${PORT}/tcp

# set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV HOSTNAME=${HOSTNAME}

# exec command
CMD ["node", "dist/index.js"]
