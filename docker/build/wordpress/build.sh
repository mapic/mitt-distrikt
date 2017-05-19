#!/bin/bash

# ensure latest wordpress
docker pull wordpress:latest

# build
docker build -t lier/wordpress:latest .