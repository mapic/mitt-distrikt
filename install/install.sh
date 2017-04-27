#!/bin/bash

usage () {
    echo "Usage: ./install.sh example.com blog.example.com your@email.com"
    exit 1
}

abort () {
    echo "Something went wrong: $1"
    exit 1
}

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

# check for proper usage
[ -z "$1" ] && usage
[ -z "$2" ] && usage
[ -z "$3" ] && usage

# check ubuntu version
check_ubuntu

# set
DOMAIN=$1
SUBDOMAIN=$2
EMAIL=$3

# install requirements
./install-requirements.sh || abort "Couldn't install requirements."

# create ssl
./create-ssl.sh $DOMAIN $SUBDOMAIN $EMAIL || abort "Couldn't create SSL certificates."

# edit config
./edit-config.sh $DOMAIN $SUBDOMAIN || abort "Couldn't edit config."

# celebrate
echo ""
echo "Installation successful!"
echo ""
echo "Start your server with ./restart-containers.sh in the root folder."