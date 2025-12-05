/**
 * Simple script to generate extension icons
 * Run with: node generate-icons.js
 * 
 * Note: This requires the 'canvas' package. Install with: npm install canvas
 * If canvas is not available, use generate-icons.html in a browser instead.
 */

const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const iconDir = path.join(__dirname, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Try to use canvas if available
let Canvas;
try {
  Canvas = require('canvas');
} catch (e) {
  console.log('Canvas package not found. Please either:');
  console.log('1. Install it: npm install canvas');
  console.log('2. Or use generate-icons.html in your browser');
  console.log('3. Or use an online SVG to PNG converter with icon.svg');
  process.exit(1);
}

function createIcon(size) {
  const canvas = Canvas.createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw blue background
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, size, size);

  // Draw white chef hat
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = Math.max(1, size / 32);

  // Chef hat (triangle)
  const hatY = size * 0.2;
  const hatWidth = size * 0.6;
  const hatHeight = size * 0.3;
  ctx.beginPath();
  ctx.moveTo(size * 0.2, hatY);
  ctx.lineTo(size * 0.5, hatY + hatHeight);
  ctx.lineTo(size * 0.8, hatY);
  ctx.closePath();
  ctx.fill();

  // Utensils
  const utensilX1 = size * 0.3;
  const utensilX2 = size * 0.7;
  const utensilY = size * 0.6;
  const utensilHeight = size * 0.25;

  // Spoon handle
  ctx.fillRect(utensilX1 - size * 0.02, utensilY, size * 0.04, utensilHeight);
  // Spoon bowl
  ctx.beginPath();
  ctx.arc(utensilX1, utensilY + utensilHeight, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Fork handle
  ctx.fillRect(utensilX2 - size * 0.02, utensilY, size * 0.04, utensilHeight);
  // Fork tines
  for (let i = 0; i < 3; i++) {
    const tineX = utensilX2 - size * 0.03 + (i * size * 0.03);
    ctx.fillRect(tineX, utensilY + utensilHeight, size * 0.01, size * 0.02);
  }

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(iconDir, `icon${size}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

// Generate all icons
console.log('Generating extension icons...');
sizes.forEach(createIcon);
console.log('Done! Icons created in icons/ directory.');


