#!/usr/bin/env node

/**
 * PWA Icon Generation Script
 * 
 * This script helps generate all required PWA icons from a single source image.
 * 
 * Requirements:
 * - Install sharp: npm install --save-dev sharp
 * - Create a source icon: public/icons/source-icon.png (1024x1024px recommended)
 * 
 * Usage:
 *   node scripts/generate-icons.js
 * 
 * The script will generate all required icon sizes in public/icons/
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Error: sharp is not installed.');
  console.error('   Please install it with: npm install --save-dev sharp');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes to generate
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// Maskable icon sizes (with safe zone padding)
const maskableSizes = [
  { size: 192, name: 'icon-maskable-192x192.png', safeZone: 0.8 },
  { size: 512, name: 'icon-maskable-512x512.png', safeZone: 0.8 },
];

// Source icon path
const sourceIcon = path.join(iconsDir, 'source-icon.png');

// Check if source icon exists
if (!fs.existsSync(sourceIcon)) {
  console.error('❌ Error: Source icon not found!');
  console.error(`   Expected location: ${sourceIcon}`);
  console.error('\n📝 Instructions:');
  console.error('   1. Create a square icon image (1024x1024px recommended)');
  console.error('   2. Save it as: public/icons/source-icon.png');
  console.error('   3. Run this script again');
  process.exit(1);
}

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  try {
    // Generate regular icons
    console.log('📱 Generating regular icons...');
    for (const icon of iconSizes) {
      const outputPath = path.join(iconsDir, icon.name);
      await sharp(sourceIcon)
        .resize(icon.size, icon.size, {
          fit: 'cover',
          position: 'center',
        })
        .png()
        .toFile(outputPath);
      console.log(`   ✓ Generated ${icon.name}`);
    }

    // Generate maskable icons (with safe zone)
    console.log('\n🎭 Generating maskable icons...');
    for (const icon of maskableSizes) {
      const outputPath = path.join(iconsDir, icon.name);
      const safeZoneSize = Math.floor(icon.size * icon.safeZone);
      const padding = Math.round((icon.size - safeZoneSize) / 2);

      // Create a white background
      const image = sharp({
        create: {
          width: icon.size,
          height: icon.size,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      });

      // Composite the source icon with padding (safe zone)
      await image
        .composite([
          {
            input: await sharp(sourceIcon)
              .resize(safeZoneSize, safeZoneSize, {
                fit: 'cover',
                position: 'center',
              })
              .png()
              .toBuffer(),
            left: padding,
            top: padding,
          },
        ])
        .png()
        .toFile(outputPath);
      console.log(`   ✓ Generated ${icon.name}`);
    }

    console.log('\n✅ All icons generated successfully!');
    console.log(`\n📁 Icons location: ${iconsDir}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Verify icons look correct');
    console.log('   2. Update manifest.json if needed');
    console.log('   3. Test PWA installation on devices');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Run the script
generateIcons();

