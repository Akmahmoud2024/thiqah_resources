###################
### build stage ###
###################

# node base image to build the angular app.
FROM node:18 as build

WORKDIR /app

ARG NPM_TOKEN

# Copying necessary files
COPY package.json obfuscate.js ./

# Install Yarn and dependencies
RUN npm install -g yarn --force
RUN npm install -g @angular/cli@16.2.0 --force

RUN rm -f yarn.lock
RUN rm -rf node_modules

RUN yarn cache clean
RUN yarn install

# Copy the rest of the project files
COPY . .

# Build the Angular app
RUN ng build --configuration production
RUN node obfuscate.js

##################
### Final stage ##
##################

# nginx web server image to serve our application
FROM nginxinc/nginx-unprivileged:1.21.1-alpine

# clean nginx dir
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Create a directory for scripts with proper permissions
USER root

# Copy entrypoint script
COPY --from=build /app/encrypt-config.js /usr/share/nginx/html/encrypt-config.js
COPY --from=build /app/entrypoint.sh /usr/share/nginx/html/entrypoint.sh

# Ensure Unix line endings for entrypoint.sh
RUN dos2unix /usr/share/nginx/html/entrypoint.sh

# Install Node.js
RUN apk add --no-cache nodejs npm dos2unix

# Install crypto-js locally in /usr/share/nginx/html
WORKDIR /usr/share/nginx/html
RUN npm install crypto-js

# Adjust permissions for the necessary files
RUN chmod -R 755 /usr/share/nginx/html

# Ensure the nginx user can modify env.js
RUN chmod 777 /usr/share/nginx/html/env.js

# Make the entrypoint script executable
RUN chmod +x /usr/share/nginx/html/entrypoint.sh

# expose port
EXPOSE 8080

# run nginx
ENTRYPOINT ["/usr/share/nginx/html/entrypoint.sh"]" ]
