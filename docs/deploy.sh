#!/bin/bash

# Digital Ocean deployment script for kyleguilfoyle.com
# Usage: ./deploy.sh <droplet_ip>

# Check if IP address was provided
if [ -z "$1" ]; then
    echo "Error: Please provide your Droplet's IP address"
    echo "Usage: ./deploy.sh <droplet_ip>"
    exit 1
fi

DROPLET_IP=$1
SSH_USER="root"
SITE_DOMAIN="kyleguilfoyle.com"

echo "=== Starting deployment to Digital Ocean ==="
echo "Droplet IP: $DROPLET_IP"
echo "Domain: $SITE_DOMAIN"

# Create a temporary package of all website files
echo "Creating website package..."
zip -r website.zip . -x "*.git*" "*.DS_Store" "node_modules/*" "*.bak" "update_*.sh" "deploy.sh" "*.zip"

# Copy files to the server
echo "Uploading files to server..."
scp website.zip $SSH_USER@$DROPLET_IP:/tmp/

# Setup server and deploy website
echo "Setting up web server and deploying files..."
ssh $SSH_USER@$DROPLET_IP << 'EOF'
    # Update server
    apt update && apt upgrade -y
    
    # Install Nginx and other utilities
    apt install -y nginx unzip certbot python3-certbot-nginx

    # Create web directory
    mkdir -p /var/www/kyleguilfoyle.com
    
    # Extract website files
    unzip -q /tmp/website.zip -d /var/www/kyleguilfoyle.com
    rm /tmp/website.zip
    
    # Set proper permissions
    chown -R www-data:www-data /var/www/kyleguilfoyle.com
    chmod -R 755 /var/www/kyleguilfoyle.com
    
    # Create Nginx server block
    cat > /etc/nginx/sites-available/kyleguilfoyle.com << 'NGINX'
server {
    listen 80;
    listen [::]:80;
    
    root /var/www/kyleguilfoyle.com;
    index index.html;
    
    server_name kyleguilfoyle.com www.kyleguilfoyle.com;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Configure proper MIME types
    include /etc/nginx/mime.types;
    
    # Redirect old URLs if needed
    # location /old-path/ {
    #     return 301 /new-path/;
    # }
    
    # Properly handle 404 errors
    error_page 404 /404.html;
    
    # Add cache control headers for static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
NGINX
    
    # Enable the site
    ln -s /etc/nginx/sites-available/kyleguilfoyle.com /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    nginx -t
    
    # Restart Nginx
    systemctl restart nginx
    
    echo "Basic deployment complete!"
    echo "---------------------------------------"
    echo "Next steps:"
    echo "1. Point your domain to this server's IP address"
    echo "2. Once DNS is updated, run: certbot --nginx -d kyleguilfoyle.com -d www.kyleguilfoyle.com"
    echo "3. Set up automated backups"
EOF

echo "=== Deployment script completed ==="
echo "Your site is now running on http://$DROPLET_IP"
echo "Update your domain's DNS A record to point to $DROPLET_IP"
echo "After DNS propagation, secure the site with SSL using certbot"

# Cleanup
rm website.zip 