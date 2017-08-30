#!/bin/bash

# install node modules
if [ ! -d "node_modules" ]; then
  npm install
fi

# dev
# nodemon app.js

# prod
# forever app.js

forever -m 100 --spinSleepTime 1000 -f -v -w --watchDirectory routes/ app.js
