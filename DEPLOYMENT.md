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
4. ✅ Push to your current branch
5. ✅ Trigger deployment (if on main branch)

## Current Branch Setup

**Important**: You're currently working on the `seo-recovery` branch, but Digital Ocean deploys from the `main` branch.

### To Deploy to Production:

**Option 1: Merge to Main (Recommended)**
```bash
# After running npm run deploy on seo-recovery
git checkout main
git merge seo-recovery
git push origin main
```

**Option 2: Change Digital Ocean Deployment Branch**
1. Go to your Digital Ocean App Platform dashboard
2. Go to Settings → App-Level Settings
3. Change the deployment branch from `main` to `seo-recovery`

## Manual Process

If you prefer to do it step by step:

```bash
# 1. Sync Notion content and build
npm run build

# 2. Commit changes
git add .
git commit -m "Update Notion content"

# 3. Push to current branch
git push origin seo-recovery

# 4. Merge to main for production (if needed)
git checkout main
git merge seo-recovery
git push origin main
```

## Workflow

1. **Edit content in Notion** - Make your changes, add new articles, update existing ones
2. **Run deploy command** - `npm run deploy` from your local machine
3. **Merge to main** - If you want changes live, merge `seo-recovery` to `main`
4. **Wait for deployment** - Digital Ocean will automatically rebuild and deploy (usually takes 2-3 minutes)
5. **Check your live site** - Your changes should be live!

## Troubleshooting

- **"You have uncommitted changes"**: Commit or stash your local changes first
- **Build fails**: Check that your `.env` file has the correct Notion credentials
- **Deploy fails**: Check Digital Ocean deployment logs in your dashboard
- **Changes not live**: Make sure you've merged to `main` branch or changed deployment branch in Digital Ocean

## Current Setup

- **Source**: Notion database + local content in `src/`
- **Build**: Generates static files in `public/`
- **Deploy**: Digital Ocean serves files from `public/`
- **Trigger**: Push to `main` branch (currently you're on `seo-recovery`)

## Automatic Workflow (Future)

The GitHub Actions workflow is set up to automatically build when you push to `main`. Once you merge `seo-recovery` to `main`, any future pushes to `main` will automatically:
1. Sync Notion content
2. Build the site
3. Deploy to production 