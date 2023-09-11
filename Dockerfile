# create a docker image for the application of t3 nextjs stack

FROM node:16-alpine

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

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
ENV NODE_ENV="development"

# Build the app
# RUN npm run build

# Run the app
CMD [ "npm", "run", "dev" ]

# docker build -t asdr-t3 .