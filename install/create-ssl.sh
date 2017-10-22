#!/bin/bash

usage () {
    echo "Usage: ./create-ssl.sh example.com blog.example.com your@email.com"
    exit 1
}

# check for proper usage
[ -z "$1" ] && usage
[ -z "$2" ] && usage
[ -z "$3" ] && usage

DOMAIN=$1
SUBDOMAIN=$2
EMAIL=$3

certbot certonly \
    --standalone \
    --agree-tos \
    --email "$EMAIL" \
    --hsts \
    --expand \
    --non-interactive \
    --force-renewal \
    --domain "$DOMAIN" \
    --domain "$SUBDOMAIN" || exit 1

# cd ../docker/build/nginx
cd ../config
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl_certificate.key
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl_certificate.pem

# todo: must build nginx afterwards... so move to config or something..