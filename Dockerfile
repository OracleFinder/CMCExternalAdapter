FROM node:alpine

WORKDIR /adaptor
ADD . .

ENV PORT=80

RUN npm install
ENTRYPOINT ["node", "server.js"]