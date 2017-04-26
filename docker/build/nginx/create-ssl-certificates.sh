#!/bin/bash

DOMAIN=meon.io
SUBDOMAIN=blog.meon.io
EMAIL=hello@mapic.io
    
certbot certonly \
    --standalone \
    --agree-tos \
    --email "$EMAIL" \
    --hsts \
    --expand \
    --non-interactive \
    --force-renewal \
    --domain "$DOMAIN" \
    --domain "$SUBDOMAIN"

cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl_certificate.key
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl_certificate.pem