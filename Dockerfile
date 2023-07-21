# create a docker image for the application of t3 nextjs stack

FROM node:lts-alpine3.14

RUN apk update && \
    apk add --no-cache libc6-compat autoconf automake libtool make tiff jpeg zlib zlib-dev pkgconf nasm file gcc musl-dev

# Create app directory
WORKDIR /usr/src/asdr-t3

# Install app dependencies
COPY package*.json ./

RUN npm install -g npm

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install

# Bundle app source
COPY . .

RUN npm run postinstall

# Expose port 3000
EXPOSE 3000

# Environment variables
ENV NODE_ENV="production"

# Build the app
RUN npm run build

# Run the app
CMD [ "npm", "start" ]

# docker build -t asdr-t3 .