#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

console.log('🔄 Syncing Notion content...');

async function syncNotion() {
    try {
        // Build content
        console.log('📝 Fetching latest Notion content...');
        await execAsync('npm run build');
        
        console.log('✅ Notion content synced successfully!');
        console.log('📂 Files updated in public/ directory');
        
        // Optional: Auto-commit and push
        const shouldDeploy = process.argv.includes('--deploy');
        if (shouldDeploy) {
            console.log('🚀 Deploying to production...');
            await execAsync('git add .');
            await execAsync('git commit -m "Auto-sync: Updated Notion content"');
            await execAsync('git push origin seo-recovery');
            console.log('🎉 Deployed to production!');
        } else {
            console.log('💡 Run with --deploy flag to auto-deploy to production');
        }
        
    } catch (error) {
        console.error('❌ Sync failed:', error.message);
        process.exit(1);
    }
}

syncNotion(); 