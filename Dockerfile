FROM node:6.3.0-slim
MAINTAINER Jonathan Gros-Dubois

LABEL description="Docker file for SocketCluster with support for clustering."

RUN mkdir -p /usr/src/
WORKDIR /usr/src/
COPY . /usr/src/

RUN npm install .

EXPOSE 4000

CMD ["npm", "start"]
