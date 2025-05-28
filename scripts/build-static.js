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
        'src/about.html',
        'src/contact.html',
        'src/thoughts.html',
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
        'kyle-top.png'
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
    
    // Fix CSS and JS paths in HTML files after copying
    const htmlFiles = ['index.html', 'about.html', 'contact.html', 'thoughts.html', '404.html'];
    
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
                
                // Fix navigation links
                content = content.replace(/href="\.\.\/index\.html"/g, 'href="/"');
                content = content.replace(/href="\.\.\/about\.html"/g, 'href="/about.html"');
                content = content.replace(/href="\.\.\/contact\.html"/g, 'href="/contact.html"');
                content = content.replace(/href="\.\.\/thoughts\.html"/g, 'href="/thoughts.html"');
                
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
                
                // Fix navigation links
                content = content.replace(/href="\.\.\/index\.html"/g, 'href="/"');
                content = content.replace(/href="\.\.\/about\.html"/g, 'href="/about.html"');
                content = content.replace(/href="\.\.\/contact\.html"/g, 'href="/contact.html"');
                content = content.replace(/href="\.\.\/thoughts\.html"/g, 'href="/thoughts.html"');
                
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
}

buildStatic().catch(console.error); 