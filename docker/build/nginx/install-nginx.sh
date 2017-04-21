#!/bin/bash
echo deb http://nginx.org/packages/ubuntu/ xenial nginx >> /etc/apt/sources.list.d/nginx.list
echo deb-src http://nginx.org/packages/ubuntu/ xenial nginx >> /etc/apt/sources.list.d/nginx.list
apt-get update -y
apt-get install nginx -y --allow-unauthenticated