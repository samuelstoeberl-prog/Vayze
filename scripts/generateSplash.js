const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawSplashScreen(size = 2048) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3B82F6');
  gradient.addColorStop(1, '#1D4ED8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const iconSize = size * 0.25; 
  const iconX = (size - iconSize) / 2;
  const iconY = (size - iconSize) / 2;

  const scale = iconSize / 100;
  const offsetY = -4 * scale;

  ctx.save();
  ctx.translate(iconX, iconY);

  ctx.strokeStyle = 'white';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6.2 * scale;

  ctx.beginPath();
  ctx.moveTo(50 * scale, 85 * scale + offsetY);
  ctx.quadraticCurveTo(50 * scale, 62 * scale + offsetY, 33 * scale, 38 * scale + offsetY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(50 * scale, 85 * scale + offsetY);
  ctx.quadraticCurveTo(50 * scale, 62 * scale + offsetY, 67 * scale, 38 * scale + offsetY);
  ctx.stroke();

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(50 * scale, 78 * scale + offsetY, 5.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.lineWidth = 4.2 * scale;
  ctx.moveTo(50 * scale, 83 * scale + offsetY);
  ctx.lineTo(50 * scale, 92 * scale + offsetY);
  ctx.stroke();

  ctx.lineWidth = 3.2 * scale;

  ctx.beginPath();
  ctx.moveTo(31 * scale, 37 * scale + offsetY);
  ctx.lineTo(36 * scale, 40 * scale + offsetY);
  ctx.lineTo(31 * scale, 43 * scale + offsetY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(69 * scale, 37 * scale + offsetY);
  ctx.lineTo(64 * scale, 40 * scale + offsetY);
  ctx.lineTo(69 * scale, 43 * scale + offsetY);
  ctx.stroke();

  ctx.restore();

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

  const canvas = drawSplashScreen(2048);
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(assetsDir, 'splash-screen.png');
  fs.writeFileSync(filePath, buffer);
}

generateSplashScreen().catch(() => {});
