#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class PathValidator {
    constructor(publicDir = 'public') {
        this.publicDir = publicDir;
        this.errors = [];
        this.warnings = [];
    }

    async validatePaths() {
        console.log('🔍 Validating all paths and assets...\n');
        
        await this.validateHtmlFiles();
        await this.validateCssFiles();
        await this.validateImages();
        
        this.printResults();
        return this.errors.length === 0;
    }

    async validateHtmlFiles() {
        const htmlFiles = await this.findHtmlFiles();
        
        for (const htmlFile of htmlFiles) {
            await this.validateHtmlFile(htmlFile);
        }
    }

    async findHtmlFiles() {
        const files = [];
        
        async function scanDir(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        await scanDir(fullPath);
                    } else if (entry.name.endsWith('.html')) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Directory doesn't exist, skip
            }
        }
        
        await scanDir(this.publicDir);
        return files;
    }

    async validateHtmlFile(htmlFile) {
        try {
            const content = await fs.readFile(htmlFile, 'utf8');
            const relativePath = path.relative(this.publicDir, htmlFile);
            
            // Check CSS links
            const cssLinks = content.match(/href="([^"]*\.css)"/g) || [];
            for (const link of cssLinks) {
                const cssPath = link.match(/href="([^"]*)"/)[1];
                if (!cssPath.startsWith('http')) { // Skip external CSS
                    await this.validateAsset(cssPath, htmlFile, 'CSS');
                }
            }
            
            // Check JS scripts
            const jsScripts = content.match(/src="([^"]*\.js)"/g) || [];
            for (const script of jsScripts) {
                const jsPath = script.match(/src="([^"]*)"/)[1];
                if (!jsPath.startsWith('http')) { // Skip external JS
                    await this.validateAsset(jsPath, htmlFile, 'JavaScript');
                }
            }
            
            // Check images
            const images = content.match(/src="([^"]*\.(png|jpg|jpeg|gif|svg|webp))"/gi) || [];
            for (const img of images) {
                const imgPath = img.match(/src="([^"]*)"/i)[1];
                if (!imgPath.startsWith('http')) { // Skip external images
                    await this.validateAsset(imgPath, htmlFile, 'Image');
                }
            }
            
            // Check internal links
            const links = content.match(/href="([^"]*\.html?)"/g) || [];
            for (const link of links) {
                const linkPath = link.match(/href="([^"]*)"/)[1];
                if (!linkPath.startsWith('http') && !linkPath.startsWith('#')) {
                    await this.validateAsset(linkPath, htmlFile, 'Link');
                }
            }
            
        } catch (error) {
            this.errors.push(`❌ Could not read HTML file: ${htmlFile}`);
        }
    }

    async validateAsset(assetPath, fromFile, assetType) {
        // Convert relative paths to absolute paths from public directory
        let fullPath;
        
        if (assetPath.startsWith('/')) {
            // Absolute path from root
            fullPath = path.join(this.publicDir, assetPath.substring(1));
        } else {
            // Relative path from current file
            const fileDir = path.dirname(fromFile);
            fullPath = path.resolve(fileDir, assetPath);
        }
        
        try {
            await fs.access(fullPath);
        } catch (error) {
            const relativePath = path.relative(this.publicDir, fromFile);
            this.errors.push(`❌ ${assetType} not found: "${assetPath}" in ${relativePath}`);
        }
    }

    async validateCssFiles() {
        // Check if required CSS files exist
        const requiredCss = ['style.css', 'about.css', 'guide.css'];
        
        for (const cssFile of requiredCss) {
            const cssPath = path.join(this.publicDir, cssFile);
            try {
                await fs.access(cssPath);
            } catch (error) {
                this.errors.push(`❌ Required CSS file missing: ${cssFile}`);
            }
        }
    }

    async validateImages() {
        // Check if guide icon images exist
        const requiredImages = [
            '80-20-restaurant-growth-os.png',
            'defining-your-true-regular-math.png',
            'the-restaurant-alchemist-manifesto.png',
            'what-is-restaurant-growth-engineering.png'
        ];
        
        for (const imgFile of requiredImages) {
            const imgPath = path.join(this.publicDir, imgFile);
            try {
                await fs.access(imgPath);
            } catch (error) {
                this.errors.push(`❌ Required guide icon missing: ${imgFile}`);
            }
        }
    }

    printResults() {
        console.log('\n📊 Validation Results:');
        console.log('='.repeat(50));
        
        if (this.errors.length === 0) {
            console.log('✅ All paths and assets are valid!');
        } else {
            console.log(`❌ Found ${this.errors.length} error(s):`);
            this.errors.forEach(error => console.log(`  ${error}`));
        }
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  Found ${this.warnings.length} warning(s):`);
            this.warnings.forEach(warning => console.log(`  ${warning}`));
        }
        
        console.log('='.repeat(50));
    }
}

async function main() {
    const validator = new PathValidator();
    const isValid = await validator.validatePaths();
    
    if (!isValid) {
        console.log('\n💡 Fix the above issues before deploying to prevent broken links and missing assets.');
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = PathValidator; 