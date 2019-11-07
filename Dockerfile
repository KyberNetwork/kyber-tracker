FROM node:8 as build-env
COPY . /kyber-tracker/
WORKDIR /kyber-tracker
RUN npm install && npm run build-kovan

FROM node:8-slim
ENV NODE_ENV=kovan
COPY --from=build-env /kyber-tracker /kyber-tracker
WORKDIR /kyber-tracker
ENTRYPOINT ["/kyber-tracker/entrypoint.sh"]
EXPOSE 8000
CMD ["help"]
