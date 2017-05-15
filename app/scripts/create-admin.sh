#!/bin/bash
CONTAINER=$(docker ps -f name=web -q)
docker exec $CONTAINER node scripts/js/create-admin.js $@