#!/bin/bash

# install node modules
if [ ! -d "node_modules" ]; then
  npm install
fi

# dev
nodemon app.js

# prod
# forever app.js