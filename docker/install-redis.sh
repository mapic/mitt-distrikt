#!/bin/bash

# get dependencies
apt-get -y update
apt-get install -y build-essential tcl curl sudo

# download & install redis
cd /tmp
curl -O http://download.redis.io/redis-stable.tar.gz
tar xzvf redis-stable.tar.gz
cd redis-stable
make
sudo make install

# create config folder
sudo mkdir /etc/redis