#!/bin/bash

# ensure latest wordpress
docker pull wordpress:latest

# build
docker build -t mitt-distrikt/wordpress:latest .