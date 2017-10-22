FROM nginx
MAINTAINER knutole@mapic.io

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

# # add certs
# ADD dhparams.pem /tmp
# ADD ssl_certificate.pem /tmp
# ADD ssl_certificate.key /tmp