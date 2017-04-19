# base image
FROM ubuntu:16.04

# maintainer
MAINTAINER knutole@mapic.io

# install dependencies
RUN apt-get -y update
RUN apt-get -y install build-essential curl wget fish htop sudo

# install nodejs
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN sudo apt-get install -y nodejs

# install redis
ADD ./install-redis.sh /tmp
RUN sh /tmp/install-redis.sh