#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const BACKGROUND = '#1c1d26';

const iconFiles = [
  'icon-72x72.png',
  'icon-96x96.png',
  'icon-128x128.png',
  'icon-144x144.png',
  'icon-152x152.png',
  'icon-192x192.png',
  'icon-384x384.png',
  'icon-512x512.png',
  'icon-maskable-192x192.png',
  'icon-maskable-512x512.png',
  'source-icon.png',
];

async function createBlankIcon(filename) {
  const size = parseInt(filename.match(/(\d+)x\d+/)?.[1] || '1024', 10);
  const outputPath = path.join(iconsDir, filename);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .png()
    .toFile(outputPath);
}

async function createFavicon() {
  const outputPath = path.join(iconsDir, 'favicon.ico');
  const pngBuffer = await sharp({
    create: {
      width: 32,
      height: 32,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .png()
    .toBuffer();
  await sharp(pngBuffer).toFile(outputPath);
}

async function main() {
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const file of iconFiles) {
    await createBlankIcon(file);
    console.log(`Created ${file}`);
  }

  await createFavicon();
  console.log('Created favicon.ico');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
