const fs = require('fs');
const path = require('path');

// Build script for static deployment
console.log('🏗️ Building Modern Shop for deployment...');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('📁 Created dist directory');
}

// Files to copy
const filesToCopy = [
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
  'service-worker.js',
  'vercel.json',
  '_headers',
  '_redirects',
  '.nojekyll'
];

// Copy files
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(distDir, file);

  if (fs.existsSync(srcPath)) {
    // Create subdirectories if needed
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${file}`);
  } else {
    console.log(`⚠️ File not found: ${file}`);
  }
});

// Copy data directory
const dataSrc = path.join(__dirname, 'data');
const dataDest = path.join(distDir, 'data');
if (fs.existsSync(dataSrc)) {
  copyDirectory(dataSrc, dataDest);
  console.log('✅ Copied data directory');
}

// Copy images directory
const imagesSrc = path.join(__dirname, 'images');
const imagesDest = path.join(distDir, 'images');
if (fs.existsSync(imagesSrc)) {
  copyDirectory(imagesSrc, imagesDest);
  console.log('✅ Copied images directory');
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

console.log('🎉 Build completed successfully!');
console.log(`📦 Files built to: ${distDir}`);
