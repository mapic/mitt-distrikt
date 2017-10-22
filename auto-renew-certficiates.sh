#!/bin/bash

DOMAIN=mittlier.no

clear
echo ""
echo "Renewing certificates for domains"
echo ""

bash stop-containers.sh
cd install
bash create-ssl.sh $DOMAIN blog.$DOMAIN hello@mapic.io
cd ..
bash restart-containers.sh
