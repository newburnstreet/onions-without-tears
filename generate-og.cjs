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

  // ── Load chef illustration and trim to its non-white bounding box ──
  // (keeps the hat's top and the full body — no bottom crop this time)
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

  // Chef: left column, fills vertical space with a little padding so the
  // hat's top isn't clipped when platforms overlay chrome.
  const PAD_Y = 30;
  const CHEF_MAX_H = H - PAD_Y * 2;
  const CHEF_MAX_W = 420;
  const chefScale = Math.min(CHEF_MAX_W / srcW, CHEF_MAX_H / srcH);
  const chefDrawW = Math.round(srcW * chefScale);
  const chefDrawH = Math.round(srcH * chefScale);
  const chefX = 90;
  const chefY = Math.round((H - chefDrawH) / 2);
  ctx.drawImage(img, minX, minY, srcW, srcH, chefX, chefY, chefDrawW, chefDrawH);

  // ── Title stack on the right ──
  const titleLines = ['Onions', 'Without', 'Tears'];
  const titleSize = 128;
  const lineH = Math.round(titleSize * 1.02);
  ctx.font = `bold ${titleSize}px serif`;
  ctx.fillStyle = '#2D2016';
  ctx.textBaseline = 'alphabetic';

  const titleX = chefX + chefDrawW + 70;
  const titleBlockH = (titleLines.length - 1) * lineH + titleSize;
  const firstBaselineY = Math.round((H - titleBlockH) / 2) + titleSize;

  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], titleX, firstBaselineY + i * lineH);
  }

  // Accent rule + subtitle beneath the title stack
  const lastBaselineY = firstBaselineY + (titleLines.length - 1) * lineH;
  ctx.fillStyle = '#C2185B';
  ctx.fillRect(titleX, lastBaselineY + 28, 180, 3);

  ctx.fillStyle = '#6B5B4E';
  ctx.font = `italic 30px serif`;
  ctx.fillText('A handbook of cooking tips', titleX, lastBaselineY + 78);

  // ── Save ──
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.93 });
  fs.writeFileSync(path.join(__dirname, 'public', 'og-image.jpg'), buffer);
  console.log(`OG image generated — chef ${chefDrawW}x${chefDrawH} at (${chefX},${chefY}), title at (${titleX},${firstBaselineY})`);
}

generate().catch(err => { console.error(err); process.exit(1); });
