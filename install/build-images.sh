#!/bin/bash

# build all images
cd ../docker/build
./build-all.sh || exit 1
