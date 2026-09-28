// Flat net of the cube (U on top, L F R B in a row, D below). Non-centre stickers carry data-i for painting.
import { FACES } from '../cube.js';
import { STICKER } from './format.js';

const NET = { U: [3, 0], R: [6, 3], F: [3, 3], D: [3, 6], L: [0, 3], B: [9, 3] };

export function drawNet(svg, f) {
  let s = '';
  [...FACES].forEach((face, i) => {
    const [x0, y0] = NET[face];
    s += `<rect x="${x0 - .04}" y="${y0 - .04}" width="3.08" height="3.08" rx=".14" fill="#1d1b19"/>`;
    for (let k = 0; k < 9; k++)
      s += `<rect ${k === 4 ? '' : `data-i="${i * 9 + k}"`} x="${x0 + k % 3 + .07}" y="${y0 + ((k / 3) | 0) + .07}" width=".86" height=".86" rx=".1" fill="${STICKER[f[i * 9 + k]]}"/>`;
  });
  svg.innerHTML = s;
}
