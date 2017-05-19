#!/bin/bash

usage () {
    echo "Usage: ./enter.sh CONTAINER-KEYWORD"
    exit 1
}

[ -z "$1" ] && usage

docker exec -it $(docker ps -q --filter name=$1) bash