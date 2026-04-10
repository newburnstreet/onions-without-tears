const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generate() {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // ── Background ──────────────────────────────────────────────
  ctx.fillStyle = '#FFF8F0';
  ctx.fillRect(0, 0, W, H);

  // ── Black outer border ───────────────────────────────────────
  ctx.strokeStyle = '#2D2016';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  // ── Chef box — fixed size, upper left ────────────────────────
  const BOX_X = 55;
  const BOX_Y = 75;
  const BOX_W = 290;
  const BOX_H = 420;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H);
  ctx.strokeStyle = '#E8CDB5';
  ctx.lineWidth = 2;
  ctx.strokeRect(BOX_X, BOX_Y, BOX_W, BOX_H);

  // ── Load & crop chef ─────────────────────────────────────────
  const img = await loadImage(path.join(__dirname, 'src', 'assets', 'front-cover.jpeg'));

  const tmpCanvas = createCanvas(img.width, img.height);
  const tctx = tmpCanvas.getContext('2d');
  tctx.drawImage(img, 0, 0);
  const data = tctx.getImageData(0, 0, img.width, img.height);
  let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
  for (let i = 0; i < img.width * img.height; i++) {
    const r = data.data[i*4], g = data.data[i*4+1], b = data.data[i*4+2];
    if (!(r > 240 && g > 240 && b > 240)) {
      const x = i % img.width, y = Math.floor(i / img.width);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  const srcW = maxX - minX;
  const srcH = Math.round((maxY - minY) * 0.75);

  const pad = 16;
  const maxW = BOX_W - pad * 2;
  const maxH = BOX_H - pad * 2;
  const scale = Math.min(maxW / srcW, maxH / srcH);
  const drawW = Math.round(srcW * scale);
  const drawH = Math.round(srcH * scale);
  const chefX = BOX_X + pad + (maxW - drawW) / 2;
  const chefY = BOX_Y + pad + (maxH - drawH) / 2;
  ctx.drawImage(img, minX, minY, srcW, srcH, chefX, chefY, drawW, drawH);

  // ── Text column ──────────────────────────────────────────────
  const TX = 390;
  const TW = W - TX - 55;

  // Title — fit on one line
  let titleSize = 82;
  ctx.font = `bold ${titleSize}px serif`;
  while (ctx.measureText('Onions Without Tears').width > TW && titleSize > 30) {
    titleSize -= 2;
    ctx.font = `bold ${titleSize}px serif`;
  }

  const TITLE_Y = 195;
  ctx.fillStyle = '#2D2016';
  ctx.fillText('Onions Without Tears', TX, TITLE_Y);

  // Pink rule
  ctx.fillStyle = '#C2185B';
  ctx.fillRect(TX, TITLE_Y + 18, 200, 3);

  // Subtitle
  ctx.fillStyle = '#6B5B4E';
  ctx.font = '30px serif';
  ctx.fillText('A handbook of cooking tips', TX, TITLE_Y + 75);

  // Author
  ctx.font = 'italic 26px serif';
  ctx.fillText('by Alison Bessborough', TX, TITLE_Y + 118);

  // URL
  ctx.fillStyle = '#C2185B';
  ctx.font = '22px serif';
  ctx.fillText('www.onionswithouttears.co.uk', TX, TITLE_Y + 175);

  // ── Save ─────────────────────────────────────────────────────
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.93 });
  fs.writeFileSync(path.join(__dirname, 'public', 'og-image.jpg'), buffer);
  console.log('OG image generated: public/og-image.jpg');
}

generate().catch(console.error);
