/**
 * Splash Screen Generator
 * Generates splash screen image for Expo
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawSplashScreen(size = 2048) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3B82F6');
  gradient.addColorStop(1, '#1D4ED8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Calculate icon position (centered)
  const iconSize = size * 0.25; // 25% of splash size
  const iconX = (size - iconSize) / 2;
  const iconY = (size - iconSize) / 2;

  // Draw icon
  const scale = iconSize / 100;
  const offsetY = -4 * scale;

  ctx.save();
  ctx.translate(iconX, iconY);

  // Path Style
  ctx.strokeStyle = 'white';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6.2 * scale;

  // Left Path
  ctx.beginPath();
  ctx.moveTo(50 * scale, 85 * scale + offsetY);
  ctx.quadraticCurveTo(50 * scale, 62 * scale + offsetY, 33 * scale, 38 * scale + offsetY);
  ctx.stroke();

  // Right Path
  ctx.beginPath();
  ctx.moveTo(50 * scale, 85 * scale + offsetY);
  ctx.quadraticCurveTo(50 * scale, 62 * scale + offsetY, 67 * scale, 38 * scale + offsetY);
  ctx.stroke();

  // Person
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(50 * scale, 78 * scale + offsetY, 5.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.lineWidth = 4.2 * scale;
  ctx.moveTo(50 * scale, 83 * scale + offsetY);
  ctx.lineTo(50 * scale, 92 * scale + offsetY);
  ctx.stroke();

  // Arrows
  ctx.lineWidth = 3.2 * scale;

  // Left Arrow
  ctx.beginPath();
  ctx.moveTo(31 * scale, 37 * scale + offsetY);
  ctx.lineTo(36 * scale, 40 * scale + offsetY);
  ctx.lineTo(31 * scale, 43 * scale + offsetY);
  ctx.stroke();

  // Right Arrow
  ctx.beginPath();
  ctx.moveTo(69 * scale, 37 * scale + offsetY);
  ctx.lineTo(64 * scale, 40 * scale + offsetY);
  ctx.lineTo(69 * scale, 43 * scale + offsetY);
  ctx.stroke();

  ctx.restore();

  // Add app name below icon
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.08}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Vayze', size / 2, size / 2 + iconSize / 2 + size * 0.1);

  return canvas;
}

async function generateSplashScreen() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  console.log('🎨 Generating Splash Screen...\n');

  const canvas = drawSplashScreen(2048);
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(assetsDir, 'splash-screen.png');
  fs.writeFileSync(filePath, buffer);

  console.log('✅ Generated splash-screen.png (2048x2048)');
  console.log(`📁 Saved to: ${filePath}`);
}

generateSplashScreen().catch(console.error);
