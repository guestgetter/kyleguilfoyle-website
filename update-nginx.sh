#!/bin/bash

# Script to update nginx configuration on Digital Ocean droplet
# This fixes the SEO issues by adding proper redirects

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Updating Nginx Configuration ===${NC}"

# Get droplet IP from user
read -p "Enter your Digital Ocean droplet IP address: " DROPLET_IP

if [ -z "$DROPLET_IP" ]; then
    echo -e "${RED}Error: IP address is required${NC}"
    exit 1
fi

SSH_USER="root"
SITE_DOMAIN="kyleguilfoyle.com"

echo -e "${YELLOW}This will:${NC}"
echo "1. Upload new nginx configuration"
echo "2. Test the configuration"
echo "3. Reload nginx if test passes"
echo "4. Return HTTP 410 (Gone) for spam URLs"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# Upload the nginx config
echo -e "${YELLOW}Uploading nginx configuration...${NC}"
scp nginx-config.conf $SSH_USER@$DROPLET_IP:/tmp/

# Update nginx on server
echo -e "${YELLOW}Installing configuration on server...${NC}"
ssh $SSH_USER@$DROPLET_IP << 'EOF'
    # Backup existing config
    cp /etc/nginx/sites-available/kyleguilfoyle.com /etc/nginx/sites-available/kyleguilfoyle.com.bak.$(date +%Y%m%d_%H%M%S)
    
    # Install new config
    mv /tmp/nginx-config.conf /etc/nginx/sites-available/kyleguilfoyle.com
    
    # Test nginx configuration
    echo "Testing nginx configuration..."
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo "Configuration test passed!"
        echo "Reloading nginx..."
        systemctl reload nginx
        echo "Nginx reloaded successfully!"
    else
        echo "Configuration test FAILED! Restoring backup..."
        mv /etc/nginx/sites-available/kyleguilfoyle.com.bak.$(date +%Y%m%d)* /etc/nginx/sites-available/kyleguilfoyle.com
        echo "Backup restored. Please check the configuration file."
        exit 1
    fi
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}=== Nginx configuration updated successfully! ===${NC}"
    echo ""
    echo -e "${YELLOW}Next steps in Google Search Console:${NC}"
    echo "1. Go to Removals → Outdated Content"
    echo "2. Submit removal requests for spam URL patterns"
    echo "3. Go to URL Inspection and test your homepage"
    echo "4. Click 'Request Indexing' for key pages"
    echo ""
    echo -e "${YELLOW}Test your redirects:${NC}"
    echo "curl -I https://kyleguilfoyle.com/wp-admin"
    echo "  (Should return 410 Gone)"
    echo "curl -I https://kyleguilfoyle.com/plantronics-something"
    echo "  (Should return 410 Gone)"
else
    echo -e "${RED}Error: Configuration update failed!${NC}"
    exit 1
fi

