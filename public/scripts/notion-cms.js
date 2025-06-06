const { Client } = require('@notionhq/client');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

class NotionCMS {
    constructor() {
        this.notion = new Client({
            auth: process.env.NOTION_TOKEN,
        });
        this.databaseId = process.env.NOTION_DATABASE_ID;
    }

    // Convert Notion date to our format
    formatDate(notionDate) {
        if (!notionDate) return new Date().toISOString().split('T')[0];
        
        if (notionDate.start) {
            return notionDate.start;
        }
        return notionDate;
    }

    // Create slug from title
    createSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Extract plain text from Notion rich text
    extractPlainText(richText) {
        if (!richText || !Array.isArray(richText)) return '';
        return richText.map(text => text.plain_text).join('');
    }

    // Fetch content from Notion database
    async fetchNotionContent() {
        try {
            if (!this.databaseId) {
                console.log('No Notion database ID configured, skipping Notion content...');
                return [];
            }

            const response = await this.notion.databases.query({
                database_id: this.databaseId,
                sorts: [
                    {
                        property: 'Publish Date',
                        direction: 'descending'
                    }
                ]
            });

            return response.results
                .filter(page => {
                    // Filter for published content - handle different Status field types
                    const status = page.properties.Status;
                    if (status?.select?.name) {
                        return status.select.name === 'Published';
                    } else if (status?.status?.name) {
                        return status.status.name === 'Published';
                    } else if (status?.multi_select) {
                        return status.multi_select.some(s => s.name === 'Published');
                    }
                    return false; // If no status or unrecognized format, exclude
                })
                .map(page => {
                    const properties = page.properties;
                    
                                    const title = this.extractPlainText(properties.Title?.title || properties.Name?.title);
                const excerpt = this.extractPlainText(properties.Excerpt?.rich_text);
                const date = this.formatDate(properties.Date?.date || properties['Publish Date']?.date);
                const slug = properties['URL Slug']?.rich_text ? 
                    this.extractPlainText(properties['URL Slug'].rich_text) : 
                    (properties.Slug?.rich_text ? 
                        this.extractPlainText(properties.Slug.rich_text) : 
                        this.createSlug(title));
                
                // Get content type (default to 'thought' if not specified)
                const contentType = properties['Content Type']?.select?.name || 
                                  properties['Type']?.select?.name || 
                                  'thought';

                    return {
                        id: `notion-${page.id}`,
                        title,
                        date,
                        slug,
                        excerpt,
                        source: 'notion',
                        contentType: contentType.toLowerCase(),
                        notionId: page.id
                    };
                });
        } catch (error) {
            console.error('Error fetching from Notion:', error.message);
            return [];
        }
    }

    // Load existing thoughts.json content
    async loadExistingContent() {
        try {
            const thoughtsPath = path.join(__dirname, '..', 'src', 'thoughts.json');
            const data = await fs.readFile(thoughtsPath, 'utf8');
            const parsed = JSON.parse(data);
            
            // Ensure all existing content has source: 'local'
            const thoughts = Array.isArray(parsed) ? parsed : (parsed.thoughts || []);
            return thoughts.map(thought => ({
                ...thought,
                source: 'local'
            }));
        } catch (error) {
            console.error('Error loading existing content:', error.message);
            return [];
        }
    }

    // Merge and sort all content
    async generateMergedContent() {
        const [existingContent, notionContent] = await Promise.all([
            this.loadExistingContent(),
            this.fetchNotionContent()
        ]);

        // Combine both sources
        const allContent = [...existingContent, ...notionContent];

        // Sort by date (newest first)
        allContent.sort((a, b) => new Date(b.date) - new Date(a.date));

        return {
            thoughts: allContent,
            lastUpdated: new Date().toISOString(),
            sources: {
                local: existingContent.length,
                notion: notionContent.length
            }
        };
    }

    // Generate individual HTML files for Notion content
    async generateNotionHTML(notionContent) {
        for (const post of notionContent) {
            if (post.source !== 'notion') continue;

            try {
                // Fetch the full page content
                const pageContent = await this.notion.blocks.children.list({
                    block_id: post.notionId
                });

                // Convert blocks to HTML (improved implementation)
                const htmlContent = await this.blocksToHTML(pageContent.results, post.slug);
                
                // Generate the full HTML file
                const fullHTML = this.generateHTMLTemplate(post, htmlContent);
                
                // Write to thoughts directory
                const filePath = path.join(__dirname, '..', 'src', 'thoughts', `${post.slug}.html`);
                await fs.writeFile(filePath, fullHTML, 'utf8');
                
                console.log(`Generated: ${post.slug}.html`);
            } catch (error) {
                console.error(`Error generating HTML for ${post.slug}:`, error.message);
            }
        }
    }

    // Convert Notion blocks to HTML (improved implementation)
    async blocksToHTML(blocks, postSlug) {
        let html = '';
        let inList = false;
        let listType = '';
        
        // Ensure images directory exists
        const imagesDir = await this.ensureImagesDir();
        
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const nextBlock = blocks[i + 1];
            
            switch (block.type) {
                case 'paragraph':
                    if (inList) {
                        html += `</${listType}>\n`;
                        inList = false;
                    }
                    const text = this.extractPlainText(block.paragraph.rich_text);
                    if (text.trim()) {
                        html += `<p>${text}</p>\n`;
                    }
                    break;
                    
                case 'heading_1':
                    if (inList) {
                        html += `</${listType}>\n`;
                        inList = false;
                    }
                    html += `<h1>${this.extractPlainText(block.heading_1.rich_text)}</h1>\n`;
                    break;
                    
                case 'heading_2':
                    if (inList) {
                        html += `</${listType}>\n`;
                        inList = false;
                    }
                    html += `<h2>${this.extractPlainText(block.heading_2.rich_text)}</h2>\n`;
                    break;
                    
                case 'heading_3':
                    if (inList) {
                        html += `</${listType}>\n`;
                        inList = false;
                    }
                    html += `<h3>${this.extractPlainText(block.heading_3.rich_text)}</h3>\n`;
                    break;
                    
                case 'bulleted_list_item':
                    if (!inList || listType !== 'ul') {
                        if (inList) html += `</${listType}>\n`;
                        html += '<ul>\n';
                        inList = true;
                        listType = 'ul';
                    }
                    html += `<li>${this.extractPlainText(block.bulleted_list_item.rich_text)}</li>\n`;
                    
                    // Close list if next block is not a list item
                    if (!nextBlock || (nextBlock.type !== 'bulleted_list_item' && nextBlock.type !== 'numbered_list_item')) {
                        html += '</ul>\n';
                        inList = false;
                    }
                    break;
                    
                case 'numbered_list_item':
                    if (!inList || listType !== 'ol') {
                        if (inList) html += `</${listType}>\n`;
                        html += '<ol>\n';
                        inList = true;
                        listType = 'ol';
                    }
                    html += `<li>${this.extractPlainText(block.numbered_list_item.rich_text)}</li>\n`;
                    
                    // Close list if next block is not a list item
                    if (!nextBlock || (nextBlock.type !== 'bulleted_list_item' && nextBlock.type !== 'numbered_list_item')) {
                        html += '</ol>\n';
                        inList = false;
                    }
                    break;
                    
                case 'image':
                    if (inList) {
                        html += `</${listType}>\n`;
                        inList = false;
                    }
                    
                    try {
                        // Get image URL from Notion
                        let imageUrl = '';
                        if (block.image.type === 'external') {
                            imageUrl = block.image.external.url;
                        } else if (block.image.type === 'file') {
                            imageUrl = block.image.file.url;
                        }
                        
                        if (imageUrl) {
                            // Create filename
                            const imageExtension = imageUrl.split('.').pop().split('?')[0] || 'jpg';
                            const imageName = `${postSlug}-${block.id}.${imageExtension}`;
                            const localImagePath = path.join(imagesDir, imageName);
                            
                            // Download image
                            await this.downloadImage(imageUrl, localImagePath);
                            
                            // Get caption if available
                            const caption = this.extractPlainText(block.image.caption);
                            
                            // Generate HTML
                            const relativeImagePath = `/assets/images/notion/${imageName}`;
                            html += `<figure class="notion-image">\n`;
                            html += `  <img src="${relativeImagePath}" alt="${caption || 'Image'}" loading="lazy">\n`;
                            if (caption) {
                                html += `  <figcaption>${caption}</figcaption>\n`;
                            }
                            html += `</figure>\n`;
                            
                            console.log(`Downloaded image: ${imageName}`);
                        }
                    } catch (error) {
                        console.error(`Error processing image in block ${block.id}:`, error.message);
                        // Add placeholder if image fails
                        html += `<p><em>[Image could not be loaded]</em></p>\n`;
                    }
                    break;
                    
                case 'callout':
                    if (inList) {
                        html += `</${listType}>\n`;
                        inList = false;
                    }
                    
                    // Get callout content and icon
                    const calloutText = this.extractPlainText(block.callout.rich_text);
                    const calloutIcon = block.callout.icon;
                    
                    // Determine callout type based on icon or content
                    let calloutType = 'info'; // default
                    let iconDisplay = '💡'; // default icon
                    
                    if (calloutIcon) {
                        if (calloutIcon.type === 'emoji') {
                            iconDisplay = calloutIcon.emoji;
                            // Map common emojis to callout types for styling
                            const iconMap = {
                                '💡': 'info',
                                '⚠️': 'warning', 
                                '❗': 'warning',
                                '⛔': 'danger',
                                '❌': 'danger',
                                '✅': 'success',
                                '✔️': 'success',
                                '📝': 'note',
                                '📋': 'note',
                                '🔥': 'tip',
                                '💰': 'money',
                                '📈': 'growth',
                                '🎯': 'goal'
                            };
                            calloutType = iconMap[calloutIcon.emoji] || 'info';
                        } else if (calloutIcon.type === 'external') {
                            iconDisplay = `<img src="${calloutIcon.external.url}" alt="icon" class="callout-icon-img">`;
                        }
                    }
                    
                    html += `<div class="notion-callout callout-${calloutType}">\n`;
                    html += `  <div class="callout-icon">${iconDisplay}</div>\n`;
                    html += `  <div class="callout-content">${calloutText}</div>\n`;
                    html += `</div>\n`;
                    break;
                    
                case 'quote':
                    if (inList) {
                        html += `</${listType}>\n`;
                        inList = false;
                    }
                    
                    const quoteText = this.extractPlainText(block.quote.rich_text);
                    html += `<blockquote class="notion-quote">\n`;
                    html += `  <p>${quoteText}</p>\n`;
                    html += `</blockquote>\n`;
                    break;
                    
                case 'table':
                    if (inList) {
                        html += `</${listType}>\n`;
                        inList = false;
                    }
                    
                    try {
                        // Get table children (rows)
                        const tableResponse = await this.notion.blocks.children.list({
                            block_id: block.id
                        });
                        
                        const rows = tableResponse.results;
                        const hasHeader = block.table.has_column_header;
                        const hasRowHeader = block.table.has_row_header;
                        
                        if (rows.length > 0) {
                            html += `<div class="notion-table-wrapper">\n`;
                            html += `<table class="notion-table">\n`;
                            
                            rows.forEach((row, rowIndex) => {
                                if (row.type === 'table_row' && row.table_row.cells) {
                                    const isHeaderRow = hasHeader && rowIndex === 0;
                                    const tagName = isHeaderRow ? 'th' : 'td';
                                    const sectionTag = isHeaderRow ? 'thead' : 'tbody';
                                    
                                    // Open section tag if needed
                                    if (isHeaderRow) {
                                        html += `<${sectionTag}>\n`;
                                    } else if (rowIndex === 1 && hasHeader) {
                                        html += `<${sectionTag}>\n`;
                                    }
                                    
                                    html += `<tr>\n`;
                                    row.table_row.cells.forEach((cell, cellIndex) => {
                                        const isRowHeaderCell = hasRowHeader && cellIndex === 0 && !isHeaderRow;
                                        const actualTagName = isRowHeaderCell ? 'th' : tagName;
                                        const cellText = this.extractPlainText(cell);
                                        html += `  <${actualTagName}>${cellText}</${actualTagName}>\n`;
                                    });
                                    html += `</tr>\n`;
                                    
                                    // Close section tag if this is the last row
                                    if ((isHeaderRow && rows.length === 1) || 
                                        (isHeaderRow && rowIndex === 0 && rows.length > 1)) {
                                        html += `</${sectionTag}>\n`;
                                    } else if (rowIndex === rows.length - 1 && (!hasHeader || rowIndex > 0)) {
                                        html += `</tbody>\n`;
                                    }
                                }
                            });
                            
                            html += `</table>\n`;
                            html += `</div>\n`;
                        }
                    } catch (error) {
                        console.error(`Error processing table in block ${block.id}:`, error.message);
                        html += `<p><em>[Table could not be loaded]</em></p>\n`;
                    }
                    break;
                    
                case 'divider':
                    if (inList) {
                        html += `</${listType}>\n`;
                        inList = false;
                    }
                    html += `<hr class="notion-divider">\n`;
                    break;
                    
                default:
                    console.log(`Unhandled block type: ${block.type}`);
                    break;
            }
        }
        
        // Close any remaining open list
        if (inList) {
            html += `</${listType}>\n`;
        }
        
        return html;
    }

    // Generate HTML template for Notion content
    generateHTMLTemplate(post, content) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} | Kyle Guilfoyle</title>
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://kyleguilfoyle.com/thoughts/${post.slug}.html">
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="${post.excerpt}">
    <meta name="keywords" content="restaurant growth, restaurant marketing, business insights">
    <meta name="author" content="Kyle Guilfoyle">
    
    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.excerpt}">
    <meta property="og:url" content="https://kyleguilfoyle.com/thoughts/${post.slug}.html">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css" type="text/css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon/kg_favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
    <link rel="manifest" href="/favicon/site.webmanifest">
    <meta name="theme-color" content="#1A472A">
    
    <!-- Font Awesome for social media icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <a href="../index.html" class="logo">KYLE GUILFOYLE</a>
        <button class="mobile-nav-toggle mobile-visible" aria-label="Open mobile menu" aria-expanded="false">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        </button>
        <div class="nav-links">
            <a href="../about.html">About</a>
            <a href="../index.html#topics">Topics</a>
            <a href="../contact.html">Contact</a>
            
            <!-- Social Media Icons - Mobile Only -->
            <div class="mobile-social-icons">
                <a href="https://www.instagram.com/kyleguilfoyle/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://www.linkedin.com/in/kyle-guilfoyle/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                <a href="https://www.tiktok.com/@kyleguilfoyle?lang=en" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
            </div>
        </div>
    </nav>

    <!-- Article Content -->
    <article class="thought-article">
        <header class="thought-header">
            <div class="thought-meta">
                <time datetime="${post.date}">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            </div>
            <h1>${post.title}</h1>
        </header>
        
        <div class="thought-content">
            ${content}
        </div>
        
        <footer class="thought-footer">
            <a href="../thoughts.html" class="back-link">← Back to Thoughts</a>
        </footer>
    </article>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2024 Kyle Guilfoyle. All rights reserved.</p>
            <div class="social-links">
                <a href="../thoughts.html">Thoughts</a>
                <a href="#">LinkedIn</a>
                <a href="#">GitHub</a>
                <a href="#">Twitter</a>
            </div>
        </div>
    </footer>

    <script src="/scripts/mobile-nav.js"></script>
</body>
</html>`;
    }

    // Download image from URL
    async downloadImage(url, filename) {
        const fs = require('fs'); // Use regular fs for createWriteStream
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;
            const file = fs.createWriteStream(filename);
            
            protocol.get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(filename);
                });
            }).on('error', (err) => {
                fs.unlink(filename, () => {}); // Ignore unlink errors
                reject(err);
            });
        });
    }

    // Ensure images directory exists
    async ensureImagesDir() {
        const imagesDir = path.join(__dirname, '..', 'assets', 'images', 'notion');
        try {
            await fs.mkdir(imagesDir, { recursive: true });
        } catch (error) {
            // Directory already exists
        }
        return imagesDir;
    }

    // Main execution function
    async run() {
        console.log('🚀 Starting Notion CMS sync...');
        
        try {
            // Generate merged content
            const mergedContent = await this.generateMergedContent();
            
            // Write merged thoughts.json
            const outputPath = path.join(__dirname, '..', 'src', 'thoughts-merged.json');
            await fs.writeFile(outputPath, JSON.stringify(mergedContent, null, 2), 'utf8');
            
            console.log(`✅ Generated merged content: ${mergedContent.sources.local} local + ${mergedContent.sources.notion} Notion articles`);
            
            // Generate HTML files for Notion content
            const notionContent = mergedContent.thoughts.filter(t => t.source === 'notion');
            if (notionContent.length > 0) {
                await this.generateNotionHTML(notionContent);
                console.log(`✅ Generated ${notionContent.length} HTML files from Notion`);
            }
            
            // Update homepage with Notion guides
            // await this.updateHomepageGuides(mergedContent.thoughts);
            
            console.log('🎉 Notion CMS sync complete!');
            
        } catch (error) {
            console.error('❌ Error during sync:', error.message);
            process.exit(1);
        }
    }

    // Update homepage Featured Guides section with Notion guides
    async updateHomepageGuides(allContent) {
        try {
            const homepagePath = path.join(__dirname, '..', 'src', 'index.html');
            let homepage = await fs.readFile(homepagePath, 'utf8');
            
            // Find guides from Notion (content type = 'guide')
            const notionGuides = allContent.filter(item => 
                item.source === 'notion' && 
                item.contentType === 'guide'
            );
            
            if (notionGuides.length === 0) {
                console.log('ℹ️  No Notion guides found to add to homepage');
                // Remove any existing Notion guides from homepage
                homepage = this.removeNotionGuidesFromHomepage(homepage);
                await fs.writeFile(homepagePath, homepage, 'utf8');
                return;
            }
            
            // Find the Featured Guides section
            const guidesStartMarker = '<div class="topics-grid">';
            const guidesEndMarker = '</div>\n    </section>';
            
            const startIndex = homepage.indexOf(guidesStartMarker);
            const endIndex = homepage.indexOf(guidesEndMarker, startIndex);
            
            if (startIndex === -1 || endIndex === -1) {
                console.log('⚠️  Could not find Featured Guides section in homepage');
                return;
            }
            
            // Extract the guides section content
            const beforeGuides = homepage.substring(0, startIndex + guidesStartMarker.length);
            const afterGuides = homepage.substring(endIndex);
            const currentGuidesSection = homepage.substring(startIndex + guidesStartMarker.length, endIndex);
            
            // Remove any existing Notion guides (those with guide-badge class)
            const cleanedGuidesSection = this.removeNotionGuidesFromSection(currentGuidesSection);
            
            // Generate HTML for new Notion guides
            let notionGuidesHTML = '';
            for (const guide of notionGuides) {
                // For now, use a default icon - you can enhance this later
                const iconSrc = guide.icon || 'restaurant-growth-favicon.svg';
                
                notionGuidesHTML += `
            <a href="thoughts/${guide.slug}.html" class="topic-card">
                <div class="topic-icon">
                    <img src="${iconSrc}" alt="${guide.title} Icon" width="120" height="120">
                </div>
                <h3>${guide.title}</h3>
                <p>${guide.excerpt}</p>
                <div class="content-badge guide-badge">Guide</div>
            </a>`;
            }
            
            // Combine cleaned static guides with new Notion guides
            const updatedHomepage = beforeGuides + cleanedGuidesSection + notionGuidesHTML + '\n        ' + afterGuides;
            
            // Write updated homepage
            await fs.writeFile(homepagePath, updatedHomepage, 'utf8');
            
            console.log(`✅ Added ${notionGuides.length} Notion guides to homepage`);
            
        } catch (error) {
            console.error('❌ Error updating homepage guides:', error.message);
        }
    }

    // Helper function to remove Notion guides from a section of HTML
    removeNotionGuidesFromSection(htmlSection) {
        // Remove any topic-card that contains a guide-badge
        const lines = htmlSection.split('\n');
        const cleanedLines = [];
        let insideNotionGuide = false;
        let braceCount = 0;
        
        for (const line of lines) {
            if (line.includes('guide-badge')) {
                // Find the start of this topic-card
                let cardStartIndex = cleanedLines.length - 1;
                while (cardStartIndex >= 0 && !cleanedLines[cardStartIndex].includes('<a href="thoughts/')) {
                    cardStartIndex--;
                }
                // Remove all lines from the card start to current
                if (cardStartIndex >= 0) {
                    cleanedLines.splice(cardStartIndex);
                }
                insideNotionGuide = true;
                continue;
            }
            
            if (insideNotionGuide) {
                if (line.includes('</a>')) {
                    insideNotionGuide = false;
                }
                continue; // Skip lines inside notion guide
            }
            
            cleanedLines.push(line);
        }
        
        return cleanedLines.join('\n');
    }

    // Helper function to remove notion guides from entire homepage
    removeNotionGuidesFromHomepage(homepage) {
        // More robust regex that handles the actual structure with empty lines
        // This matches from the start of a topic-card that links to thoughts/ through the closing </a> tag
        // including any whitespace and empty lines
        const notionGuideRegex = /\s*<a\s+href="thoughts\/[^"]*\.html"\s+class="topic-card">\s*[\s\S]*?<div\s+class="content-badge\s+guide-badge">Guide<\/div>\s*<\/a>/g;
        return homepage.replace(notionGuideRegex, '');
    }
}

// Run if called directly
if (require.main === module) {
    const cms = new NotionCMS();
    cms.run();
}

module.exports = NotionCMS; 