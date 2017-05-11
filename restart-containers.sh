#!/bin/bash

# stop, remove old
./stop-containers.sh

# start compose
cd docker
docker-compose -f app.yml up -d 

# show logs
docker-compose -f app.yml logs -f