const fs = require('fs');
const path = require('path');

console.log('Running postinstall script for SubTrack...');

// Create necessary directories
const directories = [
  'src/assets/fonts',
  'src/assets/images',
  'src/assets/animations',
  'src/assets/sounds',
  'src/locales',
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

console.log('Postinstall script completed!');