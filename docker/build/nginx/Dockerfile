# base image
FROM ubuntu:16.04

# maintainer
MAINTAINER knutole@mapic.io

# install dependencies
RUN apt-get -y update
RUN apt-get -y install build-essential curl wget fish htop sudo

# install nginx
ADD ./install-nginx.sh /tmp
RUN sh /tmp/install-nginx.sh

# todo: add certbot