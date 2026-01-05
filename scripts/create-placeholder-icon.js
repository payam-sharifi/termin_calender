#!/usr/bin/env node

/**
 * Placeholder Icon Generator
 * 
 * Creates a simple placeholder icon for testing PWA functionality.
 * Replace this with your actual icon design later.
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

const sourceIconPath = path.join(iconsDir, 'source-icon.png');

async function createPlaceholderIcon() {
  console.log('🎨 Creating placeholder PWA icon...\n');

  try {
    // Create a simple placeholder icon with app name
    const width = 1024;
    const height = 1024;
    
    // Create SVG for the icon
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial, sans-serif" 
          font-size="200" 
          font-weight="bold" 
          fill="white" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          TC
        </text>
        <text 
          x="50%" 
          y="65%" 
          font-family="Arial, sans-serif" 
          font-size="120" 
          fill="rgba(255,255,255,0.9)" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          Calendar
        </text>
      </svg>
    `;

    // Convert SVG to PNG
    await sharp(Buffer.from(svg))
      .resize(width, height)
      .png()
      .toFile(sourceIconPath);

    console.log('✅ Placeholder icon created successfully!');
    console.log(`📁 Location: ${sourceIconPath}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Replace this placeholder with your actual icon design');
    console.log('   2. Run: npm run generate-icons');
    console.log('   3. Your actual icon should be 1024x1024px PNG format');
  } catch (error) {
    console.error('❌ Error creating placeholder icon:', error);
    process.exit(1);
  }
}

// Run the script
createPlaceholderIcon();

