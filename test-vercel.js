// Test script to verify Vercel deployment
const https = require('https');

const filesToTest = [
  'auth-system.js',
  'payment-system.js',
  'reviews-system.js',
  'comparison-system.js',
  'wishlist-final.js',
  'advanced-search.js',
  'product-carousel.js',
  'system-diagnostic.js',
  'quick-test.js',
  'modern-design.css',
  'manifest.json'
];

const baseUrl = 'https://modern-shop-kappa.vercel.app/';

console.log('🔍 Testing Vercel deployment...\n');

filesToTest.forEach(file => {
  const url = baseUrl + file;

  https.get(url, (res) => {
    const contentType = res.headers['content-type'];
    const statusCode = res.statusCode;

    if (statusCode === 200) {
      if (file.endsWith('.js') && contentType === 'application/javascript') {
        console.log(`✅ ${file} - OK (${contentType})`);
      } else if (file.endsWith('.css') && contentType === 'text/css') {
        console.log(`✅ ${file} - OK (${contentType})`);
      } else if (file.endsWith('.json') && contentType.includes('json')) {
        console.log(`✅ ${file} - OK (${contentType})`);
      } else {
        console.log(`⚠️  ${file} - Status: ${statusCode}, Type: ${contentType}`);
      }
    } else {
      console.log(`❌ ${file} - Status: ${statusCode}, Type: ${contentType}`);
    }
  }).on('error', (err) => {
    console.log(`❌ ${file} - Error: ${err.message}`);
  });
});

// Test main page
setTimeout(() => {
  https.get(baseUrl, (res) => {
    console.log(`\n🏠 Main page: Status ${res.statusCode}, Type: ${res.headers['content-type']}`);
  }).on('error', (err) => {
    console.log(`❌ Main page error: ${err.message}`);
  });
}, 1000);
