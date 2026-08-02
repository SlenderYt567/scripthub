const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const index = path.join(dist, 'index.html');
const target404 = path.join(dist, '404.html');

if (!fs.existsSync(index)) {
  console.error('index.html not found in dist. Run `npm run build` first.');
  process.exit(1);
}

try {
  fs.copyFileSync(index, target404);
  console.log('Copied index.html to 404.html');
} catch (err) {
  console.error('Failed to copy index.html to 404.html', err);
  process.exit(1);
}
