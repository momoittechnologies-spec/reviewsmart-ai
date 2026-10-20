const fs = require('fs');
const path = require('path');

console.log('>>> Preparing ReviewSmart Standalone Bundle for Hostinger...');

const rootDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.error('ERROR: .next/standalone does not exist. Run "next build" first.');
  process.exit(1);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
}

// 1. Copy .next/static into .next/standalone/.next/static
const nextStaticSrc = path.join(rootDir, '.next', 'static');
const nextStaticDest = path.join(standaloneDir, '.next', 'static');
console.log('-> Copying .next/static to standalone...');
copyRecursiveSync(nextStaticSrc, nextStaticDest);

// 2. Copy public into .next/standalone/public
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
console.log('-> Copying public directory to standalone...');
copyRecursiveSync(publicSrc, publicDest);

// 3. Copy .htaccess to standalone
const htaccessSrc = path.join(rootDir, '.htaccess');
const htaccessDest = path.join(standaloneDir, '.htaccess');
if (fs.existsSync(htaccessSrc)) {
  console.log('-> Copying .htaccess to standalone...');
  fs.copyFileSync(htaccessSrc, htaccessDest);
}

// 4. Copy ecosystem.config.cjs to standalone
const pm2Src = path.join(rootDir, 'ecosystem.config.cjs');
const pm2Dest = path.join(standaloneDir, 'ecosystem.config.cjs');
if (fs.existsSync(pm2Src)) {
  console.log('-> Copying ecosystem.config.cjs to standalone...');
  fs.copyFileSync(pm2Src, pm2Dest);
}

console.log('>>> SUCCESS! ReviewSmart AI standalone package is ready in .next/standalone.');
