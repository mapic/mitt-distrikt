#!/bin/bash


usage () {
    echo "Usage: ./edit-config.sh example.com blog.example.com"
    exit 1
}

# check for proper usage
[ -z "$1" ] && usage
[ -z "$2" ] && usage

DOMAIN=$1
SUBDOMAIN=$2

# edit config
cd ../config
sed "s/server_name example.com;/server_name $DOMAIN;/g" <nginx-default.conf >nginx.tmp.conf
sed "s/server_name blog.example.com;/server_name $SUBDOMAIN;/g" <nginx.tmp.conf >nginx.conf
rm nginx.tmp.conf