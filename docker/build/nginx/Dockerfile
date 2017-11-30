FROM nginx
MAINTAINER knutole@mitt-distrikt.no

# create directories
RUN mkdir /logs

# logs
RUN ln -sf /dev/stdout /logs/access.web.log
RUN ln -sf /dev/stdout /logs/error.web.log
RUN ln -sf /dev/stdout /logs/access.wordpress.log
RUN ln -sf /dev/stdout /logs/error.wordpress.log

# install debug tools
RUN apt-get update -y
RUN apt-get install -y nmap curl wget fish

EXPOSE 80 443
ENV TERM xterm