const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generate() {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#FFFEF9';
  ctx.fillRect(0, 0, W, H);

  // Trim the source to its non-white bounding box so scaling isn't
  // dominated by empty margins around the illustration.
  const img = await loadImage(path.join(__dirname, 'src', 'assets', 'front-cover.jpeg'));
  const tmp = createCanvas(img.width, img.height);
  const tctx = tmp.getContext('2d');
  tctx.drawImage(img, 0, 0);
  const data = tctx.getImageData(0, 0, img.width, img.height).data;
  let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
  for (let i = 0; i < img.width * img.height; i++) {
    const r = data[i*4], g = data[i*4+1], b = data[i*4+2];
    if (!(r > 240 && g > 240 && b > 240)) {
      const x = i % img.width, y = Math.floor(i / img.width);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  const srcW = maxX - minX;
  const srcH = maxY - minY;

  // Chef centred, as large as fits with small vertical padding so the
  // hat's top isn't flush with the canvas edge.
  const PAD_Y = 24;
  const targetH = H - PAD_Y * 2;
  const scale = targetH / srcH;
  const drawW = Math.round(srcW * scale);
  const drawH = Math.round(srcH * scale);
  const x = Math.round((W - drawW) / 2);
  const y = PAD_Y;
  ctx.drawImage(img, minX, minY, srcW, srcH, x, y, drawW, drawH);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.93 });
  fs.writeFileSync(path.join(__dirname, 'public', 'og-image.jpg'), buffer);
  console.log(`OG image generated — chef ${drawW}x${drawH} at (${x},${y})`);
}

generate().catch(err => { console.error(err); process.exit(1); });
