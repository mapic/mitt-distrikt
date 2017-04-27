#!/bin/bash

#################################################################################################
#                                                                                               #
# This script will install all required dependencies.                                           #
#                                                                                               #
# Only tested on Ubuntu 16.04, but will probably work on Ubuntu 14.04 and 17.04.                #
#                                                                                               #
# This script will NOT work on Windows or OSX. You need to install the requirements             #
# manually instead. Please see the wiki for required deps:                                      #
# https://github.com/mapic/kart-og-medvirkning/wiki/Install#manually-install-requirements       #
#                                                                                               #
#################################################################################################

check_ubuntu () {
    OS="$(lsb_release -rs)"
    # OS="16.04" # uncomment for manual override
    if [ "$OS" == "16.04" ] || [ "$OS" == "17.04"  ] || [ "$OS" == "14.04" ] ; then
        echo "Ubuntu version $OS"
    else
        echo "You're not running Ubuntu versions 14.04, 16.04 or 17.04. This script probably won't work for you."
        echo "Please see the wiki for manual installation: https://github.com/mapic/kart-og-medvirkning/wiki/Install"
        exit 1
    fi
}

# check ubuntu version
check_ubuntu

# update/upgrade
apt-get update -y
apt-get upgrade -y
apt-get update -y

# install tools/deps
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

# install openssl
sudo apt-get install -y openssl libssl-dev
