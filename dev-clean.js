const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning development environment...');

// Remove .next directory
if (fs.existsSync('.next')) {
  console.log('Removing .next directory...');
  fs.rmSync('.next', { recursive: true, force: true });
}

// Remove node_modules (optional, uncomment if needed)
// console.log('Removing node_modules...');
// fs.rmSync('node_modules', { recursive: true, force: true });

// Clear npm cache
console.log('Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.log('Cache clear failed, continuing...');
}

// Reinstall dependencies (if node_modules was removed)
// console.log('Reinstalling dependencies...');
// execSync('npm install', { stdio: 'inherit' });

console.log('✅ Environment cleaned!');
console.log('Run "npm run dev" to start the development server.'); 