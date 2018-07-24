FROM node:8
COPY . /kyber-tracker
WORKDIR /kyber-tracker
RUN npm install
