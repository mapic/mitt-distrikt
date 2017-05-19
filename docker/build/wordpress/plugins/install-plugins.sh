#!/bin/bash

# paths
PLUGINS_DIR="/var/www/html/wp-content/plugins"
FUNCTIONS_FILE="/var/www/html/wp-content/themes/twentyseventeen/functions.php"
EDITOR_FILE="/var/www/html/wp-content/plugins/editor-can-manage-users.php"
ACTIVATE_FILE="/var/www/html/wp-content/plugins/activate-plugins.php"

# copy plugins
cp /tmp/plugins/* $PLUGINS_DIR
cd $PLUGINS_DIR

# remove default plugins
rm -r akismet
rm hello.php

# install adminimize
unzip -qq adminimize.1.11.2.zip

# give editor right to create users
cat $EDITOR_FILE >> $FUNCTIONS_FILE

# automatically enable plugins
cat $ACTIVATE_FILE >> $FUNCTIONS_FILE
