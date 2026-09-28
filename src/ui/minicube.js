// Small isometric cube (faces U, F, R) drawn in SVG: the way a graph vertex is shown as a real cube.
import { STICKER_3D } from '../cube.js';
import { STICKER } from './format.js';

// Isometric projection, x right, y up, z toward the viewer: shows U (top), F (front), R (right).
const proj = ([x, y, z]) => [(x - z) * 0.866, (x + z) * 0.5 - y];
const quad = (c, t1, t2, k) => [[-1, -1], [1, -1], [1, 1], [-1, 1]]
  .map(([a, b]) => proj(c.map((v, i) => v + k * (a * t1[i] + b * t2[i])))).map(p => p.map(v => v.toFixed(3)).join(',')).join(' ');
const tangents = n => [[1, 0, 0], [0, 1, 0], [0, 0, 1]].filter(t => !t.some((v, i) => v && n[i]));

// Black body faces and the 27 visible stickers, in cubie units (cube spans -1.5 .. 1.5).
const BODY = [[0, 1, 0], [0, 0, 1], [1, 0, 0]].map(n => { const [t1, t2] = tangents(n); return quad(n.map(v => v * 1.5), t1, t2, 1.5); });
const STICKERS = STICKER_3D.map((g, i) => ({ i, g })).filter(({ i }) => i < 27) // U R F
  .map(({ i, g }) => { const [t1, t2] = tangents(g.n); return { i, pts: quad(g.p.map((v, k) => v + g.n[k] * .5), t1, t2, .42) }; });

// Cube for facelets f centred on (x, y); s = size of one cubie in px (the cube is about 5.2s wide, 6s tall).
export const miniCube = (f, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">`
  + BODY.map(p => `<polygon points="${p}" fill="#1d1b19"/>`).join('')
  + STICKERS.map(({ i, pts }) => `<polygon points="${pts}" fill="${STICKER[f[i]]}"/>`).join('')
  + '</g>';
