#!/bin/bash
if [ ! -d "node_modules" ]; then
  npm install
fi
nodemon server.js