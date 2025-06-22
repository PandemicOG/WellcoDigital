FROM nginx:alpine

# Remove default Nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy all files from the current directory to the Nginx html directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
