# Digital Ocean Deployment Checklist for KyleGuilfoyle.com

## Before Deployment

- [x] Run SEO update scripts to ensure all pages have proper meta tags
- [x] Create a 404.html error page
- [x] Update sitemap.xml
- [x] Verify robots.txt is correct
- [x] Create deployment script (deploy.sh)

## Creating Digital Ocean Droplet

1. Log into your Digital Ocean account
2. Click "Create" and select "Droplets"
3. Choose settings:
   - **Distribution**: Ubuntu 22.04 LTS
   - **Plan**: Basic shared CPU ($4-$6/month option)
   - **CPU**: Regular with SSD (1 GB RAM / 1 CPU)
   - **Region**: Choose closest to your target audience (NY or SF recommended)
   - **Authentication**: Choose SSH keys (recommended) or Password
   - **Hostname**: kyleguilfoyle-com

## Deployment Steps

1. Make note of your Droplet's IP address after creation
2. Run the deployment script: `./deploy.sh YOUR_DROPLET_IP`
3. Wait for the script to complete (usually takes 3-5 minutes)
4. Verify the site loads at http://YOUR_DROPLET_IP

## DNS Configuration

1. Log into your domain registrar account
2. Go to DNS management for kyleguilfoyle.com
3. Update/Create DNS records:
   - A record: `@` → YOUR_DROPLET_IP
   - A record: `www` → YOUR_DROPLET_IP
   - Remove any old A records pointing to the previous host
4. Reduce TTL to minimum value if possible (for faster propagation)
5. Wait for DNS changes to propagate (may take 24-48 hours)

## SSL Setup (After DNS Propagation)

1. SSH into your Droplet: `ssh root@YOUR_DROPLET_IP`
2. Run: `certbot --nginx -d kyleguilfoyle.com -d www.kyleguilfoyle.com`
3. Follow the prompts to set up SSL
4. Verify HTTPS works: https://kyleguilfoyle.com

## Post-Deployment Checks

1. Verify all pages load properly
2. Test responsive design on mobile devices
3. Check that all links work correctly
4. Confirm SSL is working properly
5. Verify that forms submit correctly
6. Test any JavaScript functionality
7. Submit updated sitemap.xml to Google Search Console

## Setup Automated Backups (Optional)

1. In Digital Ocean dashboard, go to your Droplet
2. Click on "Backups" tab
3. Enable weekly backups ($1/month additional)

## Security Hardening (Optional)

1. SSH into your Droplet: `ssh root@YOUR_DROPLET_IP`
2. Create non-root user: 
   ```
   adduser kyle
   usermod -aG sudo kyle
   ```
3. Set up SSH keys for the new user
4. Configure firewall: 
   ```
   ufw allow 'Nginx Full'
   ufw allow OpenSSH
   ufw enable
   ```
5. Update SSH config to disable root login:
   ```
   nano /etc/ssh/sshd_config
   # Set PermitRootLogin to no
   systemctl restart sshd
   ```

## Website Monitoring (Optional)

1. Set up [Uptime Robot](https://uptimerobot.com/) (free tier) to monitor your site
2. Configure email alerts for any downtime

## Digital Ocean CLI Reference

If you prefer using the Digital Ocean CLI:

```bash
# Install doctl (Digital Ocean CLI)
brew install doctl  # macOS
doctl auth init     # Set up API token

# Create droplet via CLI
doctl compute droplet create kyleguilfoyle-com \
  --image ubuntu-22-04-x64 \
  --region nyc1 \
  --size s-1vcpu-1gb \
  --ssh-keys YOUR_SSH_KEY_ID

# List your droplets
doctl compute droplet list
``` 