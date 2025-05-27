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
        'index.html',
        'about.html',
        'contact.html',
        'thoughts.html',
        '404.html',
        'style.css',
        'about.css',
        'thoughts.js',
        'mobile-nav.js',
        'thoughts.json',
        'thoughts-merged.json',
        'sitemap.xml',
        'robots.txt',
        'restaurant-growth-favicon.svg'
    ];
    
    // Copy individual files
    for (const file of filesToCopy) {
        try {
            await fs.access(file);
            await copyFile(file, path.join(publicDir, file));
        } catch (error) {
            console.log(`⚠️  Skipping ${file} (not found)`);
        }
    }
    
    // Copy directories
    const directoriesToCopy = [
        'thoughts',
        'favicon',
        'images'
    ];
    
    for (const dir of directoriesToCopy) {
        try {
            await fs.access(dir);
            await copyDirectory(dir, path.join(publicDir, dir));
        } catch (error) {
            console.log(`⚠️  Skipping directory ${dir} (not found)`);
        }
    }
    
    console.log('\n🎉 Static site build complete!');
    console.log('📁 All files copied to public/ directory');
}

buildStatic().catch(console.error); 