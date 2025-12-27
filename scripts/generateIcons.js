/**
 * Icon Generator Script
 * Generates app icons in all required sizes for iOS and Android
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Icon sizes needed
const ICON_SIZES = [
  { name: 'icon-1024', size: 1024 }, // iOS App Store
  { name: 'icon-512', size: 512 },   // Android Play Store
  { name: 'icon-192', size: 192 },   // PWA
  { name: 'icon-180', size: 180 },   // iOS
  { name: 'icon-167', size: 167 },   // iPad Pro
  { name: 'icon-152', size: 152 },   // iPad
  { name: 'icon-120', size: 120 },   // iPhone
  { name: 'icon-96', size: 96 },     // Android
  { name: 'icon-72', size: 72 },     // Android
  { name: 'icon-48', size: 48 },     // Android
];

// Adaptive icon sizes (Android)
const ADAPTIVE_SIZES = [
  { name: 'adaptive-icon', size: 1024 },
  { name: 'adaptive-foreground', size: 1024 },
  { name: 'adaptive-background', size: 1024 },
];

// Rounded rect helper
function addRoundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Draw icon with rounded corners
function drawIcon(ctx, size, withRoundedCorners = true) {
  const scale = size / 100;

  // Apply rounded mask if needed
  if (withRoundedCorners) {
    ctx.save();
    addRoundRectPath(ctx, 0, 0, size, size, size * 0.22);
    ctx.clip();
  }

  // Premium Gradient Background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3B82F6');
  gradient.addColorStop(1, '#1D4ED8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // CENTER OFFSET (fixes low positioning)
  const oy = -4 * scale;

  // Path Style - thicker for better visibility
  ctx.strokeStyle = 'white';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6.2 * scale;

  // Left Path (more symmetric)
  ctx.beginPath();
  ctx.moveTo(50 * scale, 85 * scale + oy);
  ctx.quadraticCurveTo(50 * scale, 62 * scale + oy, 33 * scale, 38 * scale + oy);
  ctx.stroke();

  // Right Path (more symmetric)
  ctx.beginPath();
  ctx.moveTo(50 * scale, 85 * scale + oy);
  ctx.quadraticCurveTo(50 * scale, 62 * scale + oy, 67 * scale, 38 * scale + oy);
  ctx.stroke();

  // Person (bigger - 15% increase)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(50 * scale, 78 * scale + oy, 5.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Body (thicker)
  ctx.beginPath();
  ctx.lineWidth = 4.2 * scale;
  ctx.moveTo(50 * scale, 83 * scale + oy);
  ctx.lineTo(50 * scale, 92 * scale + oy);
  ctx.stroke();

  // Arrows (larger & more visible, better angled)
  ctx.lineWidth = 3.2 * scale;

  // Left Arrow (more pronounced angle)
  ctx.beginPath();
  ctx.moveTo(31 * scale, 37 * scale + oy);
  ctx.lineTo(36 * scale, 40 * scale + oy);
  ctx.lineTo(31 * scale, 43 * scale + oy);
  ctx.stroke();

  // Right Arrow (more pronounced angle)
  ctx.beginPath();
  ctx.moveTo(69 * scale, 37 * scale + oy);
  ctx.lineTo(64 * scale, 40 * scale + oy);
  ctx.lineTo(69 * scale, 43 * scale + oy);
  ctx.stroke();

  if (withRoundedCorners) {
    ctx.restore();
  }
}

// Draw adaptive icon background (solid color for Android)
function drawAdaptiveBackground(ctx, size) {
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3B82F6');
  gradient.addColorStop(1, '#1D4ED8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

// Draw adaptive icon foreground (icon only, transparent bg)
function drawAdaptiveForeground(ctx, size) {
  const scale = size / 100;
  const oy = -4 * scale;

  // Path Style
  ctx.strokeStyle = 'white';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6.2 * scale;

  // Left Path
  ctx.beginPath();
  ctx.moveTo(50 * scale, 85 * scale + oy);
  ctx.quadraticCurveTo(50 * scale, 62 * scale + oy, 33 * scale, 38 * scale + oy);
  ctx.stroke();

  // Right Path
  ctx.beginPath();
  ctx.moveTo(50 * scale, 85 * scale + oy);
  ctx.quadraticCurveTo(50 * scale, 62 * scale + oy, 67 * scale, 38 * scale + oy);
  ctx.stroke();

  // Person
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(50 * scale, 78 * scale + oy, 5.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.lineWidth = 4.2 * scale;
  ctx.moveTo(50 * scale, 83 * scale + oy);
  ctx.lineTo(50 * scale, 92 * scale + oy);
  ctx.stroke();

  // Arrows
  ctx.lineWidth = 3.2 * scale;

  // Left Arrow
  ctx.beginPath();
  ctx.moveTo(31 * scale, 37 * scale + oy);
  ctx.lineTo(36 * scale, 40 * scale + oy);
  ctx.lineTo(31 * scale, 43 * scale + oy);
  ctx.stroke();

  // Right Arrow
  ctx.beginPath();
  ctx.moveTo(69 * scale, 37 * scale + oy);
  ctx.lineTo(64 * scale, 40 * scale + oy);
  ctx.lineTo(69 * scale, 43 * scale + oy);
  ctx.stroke();
}

// Generate all icons
async function generateIcons() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  // Create assets directory if it doesn't exist
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  console.log('🎨 Generating Vayze App Icons...\n');

  // Generate regular icons
  for (const iconConfig of ICON_SIZES) {
    const { name, size } = iconConfig;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    drawIcon(ctx, size, true);

    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(assetsDir, `${name}.png`);
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ Generated ${name}.png (${size}x${size})`);
  }

  // Generate adaptive icons (Android)
  console.log('\n📱 Generating Android Adaptive Icons...\n');

  // Adaptive background
  const bgCanvas = createCanvas(1024, 1024);
  const bgCtx = bgCanvas.getContext('2d');
  drawAdaptiveBackground(bgCtx, 1024);
  fs.writeFileSync(
    path.join(assetsDir, 'adaptive-icon-background.png'),
    bgCanvas.toBuffer('image/png')
  );
  console.log('✅ Generated adaptive-icon-background.png');

  // Adaptive foreground
  const fgCanvas = createCanvas(1024, 1024);
  const fgCtx = fgCanvas.getContext('2d');
  drawAdaptiveForeground(fgCtx, 1024);
  fs.writeFileSync(
    path.join(assetsDir, 'adaptive-icon-foreground.png'),
    fgCanvas.toBuffer('image/png')
  );
  console.log('✅ Generated adaptive-icon-foreground.png');

  // Main adaptive icon (combined)
  const adaptiveCanvas = createCanvas(1024, 1024);
  const adaptiveCtx = adaptiveCanvas.getContext('2d');
  drawIcon(adaptiveCtx, 1024, false);
  fs.writeFileSync(
    path.join(assetsDir, 'adaptive-icon.png'),
    adaptiveCanvas.toBuffer('image/png')
  );
  console.log('✅ Generated adaptive-icon.png');

  console.log('\n✨ All icons generated successfully!');
  console.log(`📁 Icons saved to: ${assetsDir}`);
}

// Run the generator
generateIcons().catch(console.error);
