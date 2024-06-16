#!/bin/sh

# Run the encryption script
echo "Running encrypt-config.js script..."
node /usr/share/nginx/html/encrypt-config.js true

# Start the Nginx server
echo "Starting Nginx again ..."
nginx -g "daemon off;"
