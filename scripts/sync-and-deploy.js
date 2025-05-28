#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Starting sync and deploy process...');

try {
  // Check if we have uncommitted changes
  try {
    execSync('git diff --exit-code', { stdio: 'pipe' });
    execSync('git diff --cached --exit-code', { stdio: 'pipe' });
  } catch (error) {
    console.log('⚠️  You have uncommitted changes. Please commit or stash them first.');
    process.exit(1);
  }

  // Sync Notion content and build
  console.log('📝 Syncing Notion content...');
  execSync('npm run build', { stdio: 'inherit' });

  // Check if there are any changes to commit
  try {
    execSync('git diff --exit-code', { stdio: 'pipe' });
    console.log('✅ No changes detected. Site is up to date!');
    process.exit(0);
  } catch (error) {
    // There are changes, continue with commit and push
  }

  // Add all changes
  console.log('📦 Adding changes...');
  execSync('git add .', { stdio: 'inherit' });

  // Commit with timestamp
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const commitMessage = `Auto-sync: Update Notion content (${timestamp})`;
  
  console.log('💾 Committing changes...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  // Push to trigger deployment
  console.log('🚀 Pushing to GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('✅ Sync and deploy complete! Your changes will be live shortly.');
  console.log('🌐 Check your Digital Ocean deployment logs for progress.');

} catch (error) {
  console.error('❌ Error during sync and deploy:', error.message);
  process.exit(1);
} 