#!/usr/bin/env node

const NotionCMS = require('./notion-cms');
const fs = require('fs').promises;
const path = require('path');

async function buildContent() {
    console.log('🚀 Building content for deployment...\n');
    
    try {
        // Run Notion CMS sync
        const cms = new NotionCMS();
        await cms.run();
        
        // Check if merged content was created
        const mergedPath = path.join(__dirname, 'thoughts-merged.json');
        try {
            await fs.access(mergedPath);
            console.log('✅ Merged content file created successfully');
        } catch (error) {
            console.log('⚠️  No merged content created (likely no Notion configuration)');
            console.log('   Site will use local content only');
        }
        
        console.log('\n🎉 Content build complete!');
        console.log('\nNext steps:');
        console.log('1. Commit and push your changes');
        console.log('2. Your site will automatically use the latest content');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    buildContent();
}

module.exports = buildContent; 