FROM wordpress:latest
MAINTAINER knutole@mitt-distrikt.no

RUN apt-get update -y
RUN apt-get install -y curl nmap wget unzip nano

COPY plugins /tmp/plugins
COPY security /tmp/security

EXPOSE 80 443

COPY docker-entrypoint.sh /usr/local/bin/