const fs = require('fs').promises;
const path = require('path');

// Smart sitemap generator that tracks actual content changes
class SitemapGenerator {
    constructor() {
        this.baseUrl = 'https://kyleguilfoyle.com';
        this.lastModTrackingFile = 'scripts/content-lastmod.json';
    }

    // Load existing content change tracking
    async loadLastModTracking() {
        try {
            const data = await fs.readFile(this.lastModTrackingFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // File doesn't exist, create empty tracking
            return {};
        }
    }

    // Save content change tracking
    async saveLastModTracking(tracking) {
        await fs.writeFile(this.lastModTrackingFile, JSON.stringify(tracking, null, 2));
    }

    // Get file hash for change detection
    async getFileHash(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            // Simple hash of content length and first/last 100 chars
            const hash = content.length + content.slice(0, 100) + content.slice(-100);
            return Buffer.from(hash).toString('base64');
        } catch (error) {
            return null;
        }
    }

    // Check if content actually changed
    async hasContentChanged(filePath, tracking) {
        const currentHash = await this.getFileHash(filePath);
        if (!currentHash) return false;

        const lastHash = tracking[filePath]?.hash;
        return currentHash !== lastHash;
    }

    // Update tracking for changed content
    async updateTracking(filePath, tracking) {
        const hash = await this.getFileHash(filePath);
        if (hash) {
            tracking[filePath] = {
                hash,
                lastMod: new Date().toISOString().split('T')[0]
            };
        }
    }

    // Get last modified date for a file
    getLastModDate(filePath, tracking) {
        return tracking[filePath]?.lastMod || new Date().toISOString().split('T')[0];
    }

    // Generate sitemap with smart lastmod dates
    async generateSitemap() {
        console.log('🗺️  Generating smart sitemap...');
        
        const tracking = await this.loadLastModTracking();
        let hasChanges = false;

        // Define all URLs with their priorities and change frequencies
        const staticPages = [
            { 
                url: '/', 
                priority: '1.0', 
                changefreq: 'weekly',
                filePath: 'src/index.html'
            },
            { 
                url: '/about', 
                priority: '0.8', 
                changefreq: 'monthly',
                filePath: 'src/about.html'
            },
            { 
                url: '/contact', 
                priority: '0.8', 
                changefreq: 'monthly',
                filePath: 'src/contact.html'
            },
            { 
                url: '/thoughts', 
                priority: '0.6', 
                changefreq: 'weekly',
                filePath: 'src/thoughts.html'
            }
        ];

        // Check for changes in static pages
        for (const page of staticPages) {
            if (await this.hasContentChanged(page.filePath, tracking)) {
                await this.updateTracking(page.filePath, tracking);
                hasChanges = true;
                console.log(`📝 Content changed: ${page.url}`);
            }
        }

        // Get guide pages
        const guidePages = [];
        try {
            const guidesDir = 'src/guides';
            const guideFiles = await fs.readdir(guidesDir);
            
            for (const file of guideFiles) {
                if (file.endsWith('.html')) {
                    const filePath = path.join(guidesDir, file);
                    const url = `/guides/${file}`;
                    
                    if (await this.hasContentChanged(filePath, tracking)) {
                        await this.updateTracking(filePath, tracking);
                        hasChanges = true;
                        console.log(`📝 Guide changed: ${url}`);
                    }
                    
                    guidePages.push({
                        url,
                        priority: '0.7',
                        changefreq: 'monthly',
                        filePath
                    });
                }
            }
        } catch (error) {
            console.log('⚠️  No guides directory found');
        }

        // Get thought pages (including Notion content)
        const thoughtPages = [];
        try {
            const thoughtsDir = 'src/thoughts';
            const thoughtFiles = await fs.readdir(thoughtsDir);
            
            for (const file of thoughtFiles) {
                if (file.endsWith('.html') && !file.endsWith('.bak')) {
                    const filePath = path.join(thoughtsDir, file);
                    const url = `/thoughts/${file}`;
                    
                    if (await this.hasContentChanged(filePath, tracking)) {
                        await this.updateTracking(filePath, tracking);
                        hasChanges = true;
                        console.log(`📝 Thought changed: ${url}`);
                    }
                    
                    thoughtPages.push({
                        url,
                        priority: '0.5',
                        changefreq: 'monthly',
                        filePath
                    });
                }
            }
        } catch (error) {
            console.log('⚠️  No thoughts directory found');
        }

        // Save updated tracking
        await this.saveLastModTracking(tracking);

        // Generate XML sitemap
        const allPages = [...staticPages, ...guidePages, ...thoughtPages];
        
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
        for (const page of allPages) {
            const lastMod = this.getLastModDate(page.filePath, tracking);
            
            sitemap += `  <url>\n`;
            sitemap += `    <loc>${this.baseUrl}${page.url}</loc>\n`;
            sitemap += `    <lastmod>${lastMod}</lastmod>\n`;
            sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
            sitemap += `    <priority>${page.priority}</priority>\n`;
            sitemap += `  </url>\n`;
        }
        
        sitemap += `</urlset>`;

        // Write sitemap to both root and public directory
        await fs.writeFile('sitemap.xml', sitemap);
        try {
            await fs.writeFile('public/sitemap.xml', sitemap);
            console.log('📄 Sitemap written to public/sitemap.xml');
        } catch (error) {
            console.log('⚠️  Could not write sitemap to public/ (directory may not exist yet)');
        }
        
        if (hasChanges) {
            console.log('✅ Smart sitemap generated with updated content dates');
        } else {
            console.log('✅ Smart sitemap generated (no content changes detected)');
        }
        
        console.log(`📊 Sitemap includes ${allPages.length} pages`);
        
        return hasChanges;
    }
}

// Run if called directly
if (require.main === module) {
    const generator = new SitemapGenerator();
    generator.generateSitemap().catch(console.error);
}

module.exports = SitemapGenerator; 