#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function copyFile(src, dest) {
    try {
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.copyFile(src, dest);
        console.log(`✅ Copied: ${src} → ${dest}`);
    } catch (error) {
        console.error(`❌ Error copying ${src}:`, error.message);
    }
}

async function copyDirectory(src, dest) {
    try {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src, { withFileTypes: true });
        
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
                await copyDirectory(srcPath, destPath);
            } else {
                await copyFile(srcPath, destPath);
            }
        }
    } catch (error) {
        console.error(`❌ Error copying directory ${src}:`, error.message);
    }
}

async function buildStatic() {
    console.log('🚀 Building static site for Digital Ocean...\n');
    
    const publicDir = 'public';
    
    // Clean public directory
    try {
        await fs.rm(publicDir, { recursive: true, force: true });
        console.log('🧹 Cleaned public directory');
    } catch (error) {
        // Directory might not exist, that's ok
    }
    
    // Create public directory
    await fs.mkdir(publicDir, { recursive: true });
    
    // Files to copy to public directory
    const filesToCopy = [
        'src/index.html',
        'src/404.html',
        'src/style.css',
        'src/about.css',
        'src/guide.css',
        'src/thoughts.json',
        'src/thoughts-merged.json',
        'sitemap.xml',
        'robots.txt',
        // Guide icon images
        '80-20-restaurant-growth-os.png',
        'defining-your-true-regular-math.png',
        'the-restaurant-alchemist-manifesto.png',
        'what-is-restaurant-growth-engineering.png',
        'restaurant-alchemist.svg',
        'restaurant-growth-favicon.svg',
        'e-commerce-illustration.svg',
        'kyle-top.png',
        'kyle-guilfoyle-headshot.jpg'
    ];
    
    // Copy individual files
    for (const file of filesToCopy) {
        try {
            await fs.access(file);
            const fileName = path.basename(file);
            await copyFile(file, path.join(publicDir, fileName));
        } catch (error) {
            console.log(`⚠️  Skipping ${file} (not found)`);
        }
    }
    
    // Copy directories
    const directoriesToCopy = [
        'src/thoughts',
        'src/guides',
        'src/there-is-no-rose',
        'images',
        'favicon',
        'scripts',
        'assets'
    ];
    
    for (const dir of directoriesToCopy) {
        try {
            await fs.access(dir);
            const dirName = path.basename(dir);
            await copyDirectory(dir, path.join(publicDir, dirName));
        } catch (error) {
            console.log(`⚠️  Skipping directory ${dir} (not found)`);
        }
    }
    
    // Create clean URL directories and copy HTML files for SEO-friendly URLs
    const cleanUrls = [
        { src: 'src/about.html', dest: 'about/index.html' },
        { src: 'src/contact.html', dest: 'contact/index.html' },
        { src: 'src/thoughts.html', dest: 'thoughts/index.html' }
    ];
    
    for (const { src, dest } of cleanUrls) {
        try {
            await fs.access(src);
            const destPath = path.join(publicDir, dest);
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await copyFile(src, destPath);
            console.log(`✅ Created clean URL: ${dest}`);
        } catch (error) {
            console.log(`⚠️  Could not create clean URL for ${dest}:`, error.message);
        }
    }
    
    // Fix CSS and JS paths in HTML files after copying
    const htmlFiles = ['index.html', '404.html', 'about/index.html', 'contact/index.html', 'thoughts/index.html'];
    
    for (const htmlFile of htmlFiles) {
        try {
            const filePath = path.join(publicDir, htmlFile);
            let content = await fs.readFile(filePath, 'utf8');
            
            // Fix relative paths to absolute paths
            content = content.replace(/href="style\.css"/g, 'href="/style.css"');
            content = content.replace(/href="about\.css"/g, 'href="/about.css"');
            content = content.replace(/src="scripts\/mobile-nav\.js"/g, 'src="/scripts/mobile-nav.js"');
            content = content.replace(/src="scripts\/thoughts\.js"/g, 'src="/scripts/thoughts.js"');
            content = content.replace(/src="scripts\/growth-engine\.js"/g, 'src="/scripts/growth-engine.js"');
            
            // Fix JavaScript files that don't have scripts/ prefix
            content = content.replace(/src="analytics\.js"/g, 'src="/scripts/analytics.js"');
            content = content.replace(/src="forms\.js"/g, 'src="/scripts/forms.js"');
            content = content.replace(/src="mobile-nav\.js"/g, 'src="/scripts/mobile-nav.js"');
            
            // Fix navigation links to use clean URLs
            content = content.replace(/href="\/about\.html"/g, 'href="/about"');
            content = content.replace(/href="\/contact\.html"/g, 'href="/contact"');
            content = content.replace(/href="\/thoughts\.html"/g, 'href="/thoughts"');
            content = content.replace(/href="about\.html"/g, 'href="/about"');
            content = content.replace(/href="contact\.html"/g, 'href="/contact"');
            content = content.replace(/href="thoughts\.html"/g, 'href="/thoughts"');
            
            // Keep .html extensions for guide links (guides don't have clean URLs on hosting)
            // content = content.replace(/href="guides\/([^"]+)\.html"/g, 'href="/guides/$1"');
            
            // Fix JavaScript paths for subdirectory files (about/, contact/, thoughts/)
            if (htmlFile.includes('/')) {
                content = content.replace(/src="scripts\//g, 'src="/scripts/');
            }
            
            await fs.writeFile(filePath, content);
            console.log(`✅ Fixed paths in: ${htmlFile}`);
        } catch (error) {
            console.log(`⚠️  Could not fix paths in ${htmlFile}:`, error.message);
        }
    }

    // Fix paths in thought HTML files
    try {
        const thoughtsDir = path.join(publicDir, 'thoughts');
        const thoughtFiles = await fs.readdir(thoughtsDir);
        
        for (const file of thoughtFiles) {
            if (file.endsWith('.html') && !file.endsWith('.bak')) {
                const filePath = path.join(thoughtsDir, file);
                let content = await fs.readFile(filePath, 'utf8');
                
                // Fix relative paths to absolute paths for thought pages
                content = content.replace(/href="\.\.\/style\.css"/g, 'href="/style.css"');
                content = content.replace(/href="\.\.\/about\.css"/g, 'href="/about.css"');
                content = content.replace(/src="\/scripts\/mobile-nav\.js"/g, 'src="/scripts/mobile-nav.js"');
                content = content.replace(/src="\/scripts\/thoughts\.js"/g, 'src="/scripts/thoughts.js"');
                
                // Fix navigation links to use clean URLs
                content = content.replace(/href="\.\.\/index\.html"/g, 'href="/"');
                content = content.replace(/href="\.\.\/about\.html"/g, 'href="/about"');
                content = content.replace(/href="\.\.\/contact\.html"/g, 'href="/contact"');
                content = content.replace(/href="\.\.\/thoughts\.html"/g, 'href="/thoughts"');
                
                // Fix any remaining .html links to clean URLs
                content = content.replace(/href="\/about\.html"/g, 'href="/about"');
                content = content.replace(/href="\/contact\.html"/g, 'href="/contact"');
                content = content.replace(/href="\/thoughts\.html"/g, 'href="/thoughts"');
                
                // Fix favicon paths
                content = content.replace(/href="\/favicon\//g, 'href="/favicon/');
                
                await fs.writeFile(filePath, content);
                console.log(`✅ Fixed paths in: thoughts/${file}`);
            }
        }
    } catch (error) {
        console.log(`⚠️  Could not fix thought file paths:`, error.message);
    }

    // Fix paths in guide HTML files
    try {
        const guidesDir = path.join(publicDir, 'guides');
        const guideFiles = await fs.readdir(guidesDir);
        
        for (const file of guideFiles) {
            if (file.endsWith('.html')) {
                const filePath = path.join(guidesDir, file);
                let content = await fs.readFile(filePath, 'utf8');
                
                // Fix relative paths to absolute paths for guide pages
                content = content.replace(/href="\.\.\/style\.css"/g, 'href="/style.css"');
                content = content.replace(/href="\.\.\/about\.css"/g, 'href="/about.css"');
                content = content.replace(/href="\.\.\/guide\.css"/g, 'href="/guide.css"');
                content = content.replace(/src="\/scripts\/mobile-nav\.js"/g, 'src="/scripts/mobile-nav.js"');
                content = content.replace(/src="\/scripts\/thoughts\.js"/g, 'src="/scripts/thoughts.js"');
                
                // Fix navigation links to use clean URLs
                content = content.replace(/href="\.\.\/index\.html"/g, 'href="/"');
                content = content.replace(/href="\.\.\/about\.html"/g, 'href="/about"');
                content = content.replace(/href="\.\.\/contact\.html"/g, 'href="/contact"');
                content = content.replace(/href="\.\.\/thoughts\.html"/g, 'href="/thoughts"');
                
                // Fix any remaining .html links to clean URLs (except guides)
                content = content.replace(/href="\/about\.html"/g, 'href="/about"');
                content = content.replace(/href="\/contact\.html"/g, 'href="/contact"');
                content = content.replace(/href="\/thoughts\.html"/g, 'href="/thoughts"');
                // Keep .html extensions for guide links since they don't have clean URLs
                
                // Fix favicon paths
                content = content.replace(/href="\/favicon\//g, 'href="/favicon/');
                
                await fs.writeFile(filePath, content);
                console.log(`✅ Fixed paths in: guides/${file}`);
            }
        }
    } catch (error) {
        console.log(`⚠️  Could not fix guide file paths:`, error.message);
    }
    
    console.log('\n🎉 Static site build complete!');
    console.log('📁 All files copied to public/ directory');
    
    // Generate smart sitemap with accurate lastmod dates
    console.log('\n🗺️  Generating smart sitemap...');
    const SitemapGenerator = require('./generate-sitemap.js');
    const sitemapGenerator = new SitemapGenerator();
    const hasContentChanges = await sitemapGenerator.generateSitemap();
    
    if (hasContentChanges) {
        console.log('📈 Content changes detected - sitemap updated with fresh dates');
    } else {
        console.log('📊 No content changes - sitemap maintains existing dates');
    }
    
    // Validate all paths and assets
    console.log('\n🔍 Running path validation...');
    const PathValidator = require('./validate-paths.js');
    const validator = new PathValidator();
    const isValid = await validator.validatePaths();
    
    if (!isValid) {
        console.log('\n❌ Build completed but validation failed!');
        console.log('💡 Fix the above issues to prevent broken links and missing assets.');
        process.exit(1);
    }
    
    console.log('\n✅ Build and validation complete! Site is ready for deployment.');
}

buildStatic().catch(console.error); 