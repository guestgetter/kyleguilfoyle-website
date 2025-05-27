# Notion CMS Setup Guide

Your website now supports a hybrid content management system that combines your existing local content with new content from Notion!

## 🎯 What This Does

- **Keeps all existing content** - Your 30+ existing articles remain exactly as they are
- **Adds Notion integration** - New articles can be written in Notion and automatically appear on your site
- **Seamless merging** - Both sources appear together in your thoughts section
- **Visual distinction** - Notion content gets a "From Notion" badge

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name it "Kyle Guilfoyle Website"
4. Select your workspace
5. Click "Submit"
6. Copy the "Internal Integration Token" (starts with `secret_`)

### Step 2: Create Content Database

1. In Notion, create a new page called "Website Content"
2. Add a database with these properties:
   - **Title** (Title) - The article title
   - **Date** (Date) - Publication date
   - **Excerpt** (Text) - Short description for the card
   - **Slug** (Text) - URL slug (optional, auto-generated from title)
   - **Status** (Select) - Options: "Draft", "Published"
3. Share the database with your integration:
   - Click "Share" on the database page
   - Click "Invite" and select your integration

### Step 3: Configure Environment

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your values:
   ```
   NOTION_TOKEN=secret_your_actual_token_here
   NOTION_DATABASE_ID=your_database_id_here
   ```

   To get the database ID:
   - Open your database in Notion
   - Copy the URL: `https://notion.so/workspace/DATABASE_ID?v=...`
   - The DATABASE_ID is the long string between the last `/` and `?`

### Step 4: Test the Integration

```bash
npm run sync-notion
```

You should see output like:
```
🚀 Starting Notion CMS sync...
✅ Generated merged content: 30 local + 2 Notion articles
✅ Generated 2 HTML files from Notion
🎉 Notion CMS sync complete!
```

## 📝 Writing New Content

### In Notion:
1. Add a new row to your database
2. Fill in Title, Date, Excerpt
3. Set Status to "Published"
4. Write your content in the page body
5. Run `npm run build` to sync

### Content will automatically:
- Appear in your thoughts section
- Get proper HTML formatting
- Include navigation and styling
- Show "From Notion" badge

## 🔄 Deployment Workflow

### For new Notion content:
```bash
npm run build    # Syncs Notion and builds content
git add .
git commit -m "Add new content from Notion"
git push
```

### For local changes:
```bash
git add .
git commit -m "Update local content"
git push
```

## 🎨 Customization

### Supported Notion Blocks:
- Paragraphs
- Headings (H1, H2, H3)
- Bulleted lists
- Numbered lists

### To add more block types:
Edit the `blocksToHTML()` method in `notion-cms.js`

### To customize styling:
- Notion content uses the same CSS as local content
- Add custom styles for `.thought-card.notion` in `style.css`
- Modify the `.source-badge.notion` styles

## 🔧 Advanced Usage

### Manual sync:
```bash
npm run sync-notion
```

### Build for deployment:
```bash
npm run build
```

### Environment variables:
- `NOTION_TOKEN` - Your integration token
- `NOTION_DATABASE_ID` - Your content database ID

## 🚨 Troubleshooting

### "No Notion database ID configured"
- Check your `.env` file exists and has the correct `NOTION_DATABASE_ID`

### "Error fetching from Notion"
- Verify your `NOTION_TOKEN` is correct
- Ensure the database is shared with your integration
- Check the database has the required properties

### Content not appearing
- Ensure Status is set to "Published" in Notion
- Run `npm run build` to sync
- Check browser console for errors

## 📁 File Structure

```
├── notion-cms.js           # Main Notion integration
├── build-content.js        # Build script
├── thoughts-merged.json    # Combined content (auto-generated)
├── .env                    # Your environment variables
├── env.example            # Template for environment setup
└── thoughts/              # Individual article HTML files
```

## 🎉 Benefits

- **No migration needed** - Keep all existing content
- **Easy content creation** - Write in Notion's familiar interface
- **Automatic formatting** - Notion blocks convert to proper HTML
- **SEO optimized** - Generated pages include proper meta tags
- **Mobile responsive** - Uses your existing responsive design
- **Version controlled** - Generated files can be committed to git

## 🔮 Future Enhancements

Possible additions:
- Rich text formatting (bold, italic, links)
- Image support from Notion
- Categories/tags
- Automatic publishing via webhooks
- Draft preview functionality

---

**Need help?** The system is designed to be safe - if anything goes wrong, your existing content remains untouched and the site falls back to local content only. 