# Development Guidelines

## Preventing Path and Asset Issues

To avoid broken links, missing images, and styling issues, follow these guidelines:

### 📁 File Structure Rules

1. **Source files go in `src/`** - All HTML, CSS, and content files
2. **Built files go in `public/`** - Never edit files in `public/` directly
3. **Assets go in specific directories**:
   - Images: `assets/images/` or root for guide icons
   - Scripts: `scripts/`
   - Favicons: `favicon/`

### 🔗 Path Guidelines

#### ✅ DO: Use absolute paths in HTML
```html
<link rel="stylesheet" href="/style.css">
<script src="/scripts/mobile-nav.js"></script>
<img src="/assets/images/photo.jpg" alt="Photo">
```

#### ❌ DON'T: Use relative paths that break during build
```html
<link rel="stylesheet" href="../style.css">
<script src="./scripts/mobile-nav.js"></script>
<img src="../../images/photo.jpg" alt="Photo">
```

### 🛠️ Development Workflow

1. **Always run validation before committing:**
   ```bash
   npm run validate
   ```

2. **Test your changes locally:**
   ```bash
   npm run build
   ```

3. **Deploy only after validation passes:**
   ```bash
   npm run deploy
   ```

### 🚨 Required Assets Checklist

Before deploying, ensure these files exist:

#### CSS Files
- [ ] `src/style.css` → `public/style.css`
- [ ] `src/about.css` → `public/about.css`
- [ ] `src/guide.css` → `public/guide.css`

#### Guide Icons
- [ ] `80-20-restaurant-growth-os.png`
- [ ] `defining-your-true-regular-math.png`
- [ ] `the-restaurant-alchemist-manifesto.png`
- [ ] `what-is-restaurant-growth-engineering.png`

#### JavaScript Files
- [ ] `scripts/mobile-nav.js`
- [ ] `scripts/thoughts.js`
- [ ] `scripts/analytics.js`
- [ ] `scripts/forms.js`

### 🔧 Troubleshooting

#### If you see broken styling:
1. Check if CSS files are in `public/` directory
2. Verify HTML files use absolute paths (`/style.css` not `../style.css`)
3. Run `npm run validate` to find issues

#### If images are missing:
1. Check if images are copied to `public/` directory
2. Verify image paths in HTML use absolute paths
3. Ensure images exist in source directories

#### If JavaScript isn't working:
1. Check browser console for 404 errors
2. Verify script paths use absolute paths (`/scripts/file.js`)
3. Ensure scripts are copied to `public/scripts/`

### 🎯 Quick Commands

```bash
# Validate all paths and assets
npm run validate

# Build and validate
npm run build

# Deploy (includes build and validation)
npm run deploy

# Manual validation of specific directory
node scripts/validate-paths.js
```

### 🔄 Automated Prevention

The build process now automatically:
1. ✅ Copies all required files to `public/`
2. ✅ Fixes relative paths to absolute paths
3. ✅ Validates all links and assets
4. ✅ Prevents deployment if validation fails

This ensures broken links and missing assets are caught **before** they reach the live site. 