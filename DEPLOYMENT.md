# Deployment Guide

## Quick Deploy (Recommended)

When you make changes in Notion and want them to appear on your live site:

```bash
npm run deploy
```

This single command will:
1. ✅ Sync your Notion content
2. ✅ Build the static site
3. ✅ Commit the changes
4. ✅ Push to GitHub
5. ✅ Trigger Digital Ocean deployment

## Manual Process

If you prefer to do it step by step:

```bash
# 1. Sync Notion content and build
npm run build

# 2. Commit changes
git add .
git commit -m "Update Notion content"

# 3. Push to deploy
git push origin main
```

## Setting Up GitHub Secrets (Optional)

For the GitHub Actions workflow to work with Notion, you need to add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Add these secrets:
   - `NOTION_TOKEN`: Your Notion integration token
   - `NOTION_DATABASE_ID`: Your Notion database ID

## Workflow

1. **Edit content in Notion** - Make your changes, add new articles, update existing ones
2. **Run deploy command** - `npm run deploy` from your local machine
3. **Wait for deployment** - Digital Ocean will automatically rebuild and deploy (usually takes 2-3 minutes)
4. **Check your live site** - Your changes should be live!

## Troubleshooting

- **"You have uncommitted changes"**: Commit or stash your local changes first
- **Build fails**: Check that your `.env` file has the correct Notion credentials
- **Deploy fails**: Check Digital Ocean deployment logs in your dashboard

## Current Setup

- **Source**: Notion database + local content in `src/`
- **Build**: Generates static files in `public/`
- **Deploy**: Digital Ocean serves files from `public/`
- **Trigger**: Push to `main` branch 