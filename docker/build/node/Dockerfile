# base image
FROM ubuntu:16.04

# maintainer
MAINTAINER knutole@mapic.io

# install dependencies
RUN apt-get -y update
RUN apt-get -y install build-essential curl wget fish htop sudo

# install nodejs
ADD ./install-node.sh /tmp
RUN sh /tmp/install-node.sh

# install yarn
ADD ./install-yarn.sh /tmp
RUN sh /tmp/install-yarn.sh

# install redis
ADD ./install-redis.sh /tmp
RUN sh /tmp/install-redis.sh

# install node tools
RUN npm install -g nodemon forever

