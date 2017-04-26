#!/bin/bash

# install deps
apt-get update -y
apt-get upgrade -y
apt-get update -y
apt-get install -y nmap fish htop wget curl git python-pip build-essential apt-transport-https ca-certificates curl software-properties-common

# install docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update -y
sudo apt-get install -y docker-ce 

# install docker-compose
pip install docker-compose

# install nodejs
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

# install node packages
sudo npm i nsp -g
sudo npm install -g snyk

# install certbot
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update -y
sudo apt-get install -y certbot 

# build all images
cd docker/build
sh build-all.sh
# build it!
#