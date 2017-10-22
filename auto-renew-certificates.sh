#!/bin/bash

DOMAIN=mittlier.no
MDPATH=/mapic/mitt-distrikt

clear
echo ""
echo "Renewing certificates for domains"
echo ""

# stop app
docker rm -f docker_nginx_1
docker rm -f docker_wordpress_1
docker rm -f docker_web_1
docker rm -f docker_mysql_1
docker rm -f docker_redis_1

# create ssl
cd $MDPATH/install
bash create-ssl.sh $DOMAIN blog.$DOMAIN hello@mapic.io

# start app
cd $MDPATH/docker
docker-compose -f app.yml up -d
