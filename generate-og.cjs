const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generate() {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // ── 1. Measure text — shrink title until layout fits canvas ──
  const subtitleSize = 30;
  const authorSize   = 26;
  const urlSize      = 22;

  const GAP     = 50;   // gap between chef box and text
  const PAD     = 55;   // padding inside border rectangle
  const MAX_W   = W - 40; // max rectangle width (20px margin each side)

  // Natural vertical offsets from title baseline
  const ruleOff     = 22;
  const subtitleOff = 68;
  const authorOff   = 112;
  const urlOff      = 163;

  ctx.font = `${subtitleSize}px serif`;
  const subtitleW = ctx.measureText('A handbook of cooking tips').width;
  ctx.font = `italic ${authorSize}px serif`;
  const authorW = ctx.measureText('by Alison Bessborough').width;
  ctx.font = `${urlSize}px serif`;
  const urlW = ctx.measureText('→ www.OnionsWithoutTears.co.uk').width;

  let titleSize = 82;
  let titleW, capH, blockH, textColW, BOX_S, RECT_W, RECT_H;
  while (titleSize >= 36) {
    ctx.font = `bold ${titleSize}px serif`;
    titleW    = ctx.measureText('Onions Without Tears').width;
    capH      = Math.round(titleSize * 0.72);
    blockH    = capH + urlOff + 10;
    BOX_S     = blockH;
    textColW  = Math.ceil(Math.max(titleW, subtitleW, authorW, urlW)) + 4;
    RECT_W    = BOX_S + GAP + textColW + PAD * 2;
    RECT_H    = BOX_S + PAD * 2;
    if (RECT_W <= MAX_W) break;
    titleSize -= 2;
  }

  // ── 2. Layout positions ───────────────────────────────────────

  // Centre the rectangle in the canvas
  const RECT_X = Math.round((W - RECT_W) / 2);
  const RECT_Y = Math.round((H - RECT_H) / 2);

  const BOX_X = RECT_X + PAD;
  const BOX_Y = RECT_Y + PAD;
  const TX    = BOX_X + BOX_S + GAP;

  // ── 3. Draw ───────────────────────────────────────────────────

  // Background
  ctx.fillStyle = '#FFF8F0';
  ctx.fillRect(0, 0, W, H);

  // Border rectangle — tight around content
  ctx.strokeStyle = '#2D2016';
  ctx.lineWidth = 4;
  ctx.strokeRect(RECT_X, RECT_Y, RECT_W, RECT_H);

  // Chef box (square, gold border, white fill)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(BOX_X, BOX_Y, BOX_S, BOX_S);
  ctx.strokeStyle = '#E8CDB5';
  ctx.lineWidth = 2;
  ctx.strokeRect(BOX_X, BOX_Y, BOX_S, BOX_S);

  // ── 4. Load & draw chef illustration ─────────────────────────
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

  const pad  = 12;
  const maxW = BOX_S - pad * 2;
  const maxH = BOX_S - pad * 2;
  const scale = Math.min(maxW / srcW, maxH / srcH);
  const drawW = Math.round(srcW * scale);
  const drawH = Math.round(srcH * scale);
  const chefX = BOX_X + pad + (maxW - drawW) / 2;
  const chefY = BOX_Y + pad + (maxH - drawH) / 2;
  ctx.drawImage(img, minX, minY, srcW, srcH, chefX, chefY, drawW, drawH);

  // ── 5. Draw text ──────────────────────────────────────────────
  const TITLE_Y = BOX_Y + capH;   // title top aligns with box top

  ctx.font = `bold ${titleSize}px serif`;
  ctx.fillStyle = '#2D2016';
  ctx.fillText('Onions Without Tears', TX, TITLE_Y);

  ctx.fillStyle = '#C2185B';
  ctx.fillRect(TX, TITLE_Y + ruleOff, 200, 3);

  ctx.fillStyle = '#6B5B4E';
  ctx.font = `${subtitleSize}px serif`;
  ctx.fillText('A handbook of cooking tips', TX, TITLE_Y + subtitleOff);

  ctx.font = `italic ${authorSize}px serif`;
  ctx.fillText('by Alison Bessborough', TX, TITLE_Y + authorOff);

  ctx.fillStyle = '#C2185B';
  ctx.font = `${urlSize}px serif`;
  ctx.fillText('→ www.OnionsWithoutTears.co.uk', TX, TITLE_Y + urlOff);

  // ── 6. Save ───────────────────────────────────────────────────
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.93 });
  fs.writeFileSync(path.join(__dirname, 'public', 'og-image.jpg'), buffer);
  console.log(`OG image generated — rect ${RECT_W}×${RECT_H} at (${RECT_X},${RECT_Y}), box ${BOX_S}×${BOX_S}`);
}

generate().catch(console.error);
