const opentype = require('opentype.js');
const fs = require('fs');

const FONT_PATH = 'C:\\Windows\\Fonts\\BERNHC.TTF';
const FONT_SIZE = 120;
const COLOR = '#2D2016';
const PADDING = 12;

const font = opentype.loadSync(FONT_PATH);
const words = ['ONIONS', 'WITHOUT', 'TEARS'];

words.forEach(word => {
  const path = font.getPath(word, PADDING, FONT_SIZE + PADDING, FONT_SIZE);
  const bb = path.getBoundingBox();
  const w = Math.ceil(bb.x2) + PADDING;
  const h = Math.ceil(bb.y2) + PADDING;
  const pathData = path.toSVG(2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <path fill="${COLOR}" d="${pathData.match(/d="([^"]+)"/)?.[1] || ''}"/>
</svg>`;

  const out = `public/title-${word.toLowerCase()}.svg`;
  fs.writeFileSync(out, svg);
  console.log(`${out}  ${w}x${h}`);
});
