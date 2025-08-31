const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing deployment for Vercel...');

// Ensure all necessary files exist
const requiredFiles = [
  'index.html',
  'demo.html',
  'material-shop.html',
  'modern-design.css',
  'auth-system.js',
  'payment-system.js',
  'reviews-system.js',
  'comparison-system.js',
  'wishlist-final.js',
  'advanced-search.js',
  'product-carousel.js',
  'system-diagnostic.js',
  'quick-test.js',
  'manifest.json',
  'service-worker.js'
];

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Create a deployment summary
const deploymentInfo = {
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  files: requiredFiles.filter(file => fs.existsSync(file)),
  totalFiles: requiredFiles.length,
  configFiles: ['vercel.json', '_headers', '.vercelignore']
};

fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
console.log('📝 Deployment info saved to deployment-info.json');

console.log('🎯 Ready for Vercel deployment!');
console.log('Run: vercel --prod');
console.log('Or push to GitHub for automatic deployment');
