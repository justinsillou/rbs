// Rubik's cube model: cubie representation (Kociemba conventions), moves, colours, invariants, 3D geometry.
// Corners: URF UFL ULB UBR DFR DLF DBL DRB — Edges: UR UF UL UB DR DF DL DB FR FL BL BR

export const FACES = 'URFDLB';
export const MOVE_NAMES = [];
for (const f of FACES) MOVE_NAMES.push(f, f + '2', f + "'");

const BASE = [
  { cp: [3, 0, 1, 2, 4, 5, 6, 7], co: [0, 0, 0, 0, 0, 0, 0, 0], ep: [3, 0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // U
  { cp: [4, 1, 2, 0, 7, 5, 6, 3], co: [2, 0, 0, 1, 1, 0, 0, 2], ep: [8, 1, 2, 3, 11, 5, 6, 7, 4, 9, 10, 0], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // R
  { cp: [1, 5, 2, 3, 0, 4, 6, 7], co: [1, 2, 0, 0, 2, 1, 0, 0], ep: [0, 9, 2, 3, 4, 8, 6, 7, 1, 5, 10, 11], eo: [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0] }, // F
  { cp: [0, 1, 2, 3, 5, 6, 7, 4], co: [0, 0, 0, 0, 0, 0, 0, 0], ep: [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // D
  { cp: [0, 2, 6, 3, 4, 1, 5, 7], co: [0, 1, 2, 0, 0, 2, 1, 0], ep: [0, 1, 10, 3, 4, 5, 9, 7, 8, 2, 6, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // L
  { cp: [0, 1, 3, 7, 4, 5, 2, 6], co: [0, 0, 1, 2, 0, 0, 2, 1], ep: [0, 1, 2, 11, 4, 5, 6, 10, 8, 9, 3, 7], eo: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1] }, // B
];

export const solved = () => ({ cp: [0, 1, 2, 3, 4, 5, 6, 7], co: Array(8).fill(0), ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], eo: Array(12).fill(0) });

// a * b = apply a, then b
export function mul(a, b) {
  return {
    cp: b.cp.map(p => a.cp[p]),
    co: b.cp.map((p, i) => (a.co[p] + b.co[i]) % 3),
    ep: b.ep.map(p => a.ep[p]),
    eo: b.ep.map((p, i) => (a.eo[p] + b.eo[i]) % 2),
  };
}

export const MOVES = [];
for (const b of BASE) { const b2 = mul(b, b); MOVES.push(b, b2, mul(b2, b)); }

export const apply = (c, moves) => moves.reduce((x, m) => mul(x, MOVES[m]), c);
export const inverse = m => m - m % 3 + 2 - m % 3;
export const parse = s => s.trim().split(/\s+/).filter(Boolean).map(t => {
  const i = MOVE_NAMES.indexOf(t.replace('’', "'"));
  if (i < 0) throw new Error('Mouvement inconnu : ' + t);
  return i;
});
export const format = ms => ms.map(m => MOVE_NAMES[m]).join(' ');
export const isSolved = c => c.cp.every((x, i) => x === i && !c.co[i]) && c.ep.every((x, i) => x === i && !c.eo[i]);
const odd = p => p.reduce((s, x, i) => s ^ p.slice(i + 1).filter(y => y < x).length % 2, 0);

export function scramble(n = 25) {
  const out = [];
  let last = -1;
  while (out.length < n) {
    const m = Math.floor(Math.random() * 18), f = (m / 3) | 0;
    if (f === last || f === last - 3) continue; // no same face, fixed order for opposite faces
    out.push(m); last = f;
  }
  return out;
}

// Uniform random element of G0: random pieces, then fix the three invariants
// (corner twist ≡ 0 mod 3, edge flip ≡ 0 mod 2, equal permutation parities).
export function randomState() {
  const shuffle = n => { const p = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; };
  const c = { cp: shuffle(8), ep: shuffle(12), co: Array.from({ length: 8 }, () => Math.floor(Math.random() * 3)), eo: Array.from({ length: 12 }, () => Math.floor(Math.random() * 2)) };
  if (odd(c.cp) !== odd(c.ep)) [c.ep[0], c.ep[1]] = [c.ep[1], c.ep[0]];
  c.co[7] = (15 - c.co.slice(0, 7).reduce((a, b) => a + b, 0)) % 3;
  c.eo[11] = c.eo.slice(0, 11).reduce((a, b) => a + b, 0) % 2;
  return c;
}

// Facelets (54 chars, order U R F D L B, each face row-major on the standard net).
const CORNER_FACELET = [[8, 9, 20], [6, 18, 38], [0, 36, 47], [2, 45, 11], [29, 26, 15], [27, 44, 24], [33, 53, 42], [35, 17, 51]];
const CORNER_COLOR = ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DBL', 'DRB'];
const EDGE_FACELET = [[5, 10], [7, 19], [3, 37], [1, 46], [32, 16], [28, 25], [30, 43], [34, 52], [23, 12], [21, 41], [50, 39], [48, 14]];
const EDGE_COLOR = ['UR', 'UF', 'UL', 'UB', 'DR', 'DF', 'DL', 'DB', 'FR', 'FL', 'BL', 'BR'];

export function facelets(c) {
  const f = [];
  for (let i = 0; i < 6; i++) f[i * 9 + 4] = FACES[i];
  for (let i = 0; i < 8; i++) for (let n = 0; n < 3; n++) f[CORNER_FACELET[i][(n + c.co[i]) % 3]] = CORNER_COLOR[c.cp[i]][n];
  for (let i = 0; i < 12; i++) for (let n = 0; n < 2; n++) f[EDGE_FACELET[i][(n + c.eo[i]) % 2]] = EDGE_COLOR[c.ep[i]][n];
  return f.join('');
}

// Inverse of facelets(): colours -> cube, or { error } naming the broken rule.
export function fromFacelets(f) {
  for (const col of FACES) {
    const k = [...f].filter(x => x === col).length;
    if (k !== 9) return { error: `La couleur ${col} apparaît ${k} fois au lieu de 9.` };
  }
  const c = { cp: [], co: [], ep: [], eo: [] };
  for (let i = 0; i < 8; i++) {
    const ori = [0, 1, 2].find(o => 'UD'.includes(f[CORNER_FACELET[i][o]]));
    const a = f[CORNER_FACELET[i][(ori + 1) % 3]], b = f[CORNER_FACELET[i][(ori + 2) % 3]];
    const j = ori === undefined ? -1 : CORNER_COLOR.findIndex(cc => cc[1] === a && cc[2] === b);
    if (j < 0) return { error: `Le coin n°${i + 1} a une combinaison de couleurs qui n'existe pas sur un vrai cube.` };
    c.cp[i] = j; c.co[i] = ori;
  }
  for (let i = 0; i < 12; i++) {
    const a = f[EDGE_FACELET[i][0]], b = f[EDGE_FACELET[i][1]];
    const j = EDGE_COLOR.findIndex(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a));
    if (j < 0) return { error: `L'arête n°${i + 1} a une combinaison de couleurs qui n'existe pas sur un vrai cube.` };
    c.ep[i] = j; c.eo[i] = EDGE_COLOR[j][0] === a ? 0 : 1;
  }
  if (new Set(c.cp).size < 8) return { error: 'Un même coin apparaît deux fois.' };
  if (new Set(c.ep).size < 12) return { error: 'Une même arête apparaît deux fois.' };
  if (c.co.reduce((a, b) => a + b, 0) % 3) return { error: 'Un coin est tordu sur place : impossible à obtenir en tournant les faces (somme des torsions ≢ 0 mod 3).' };
  if (c.eo.reduce((a, b) => a + b, 0) % 2) return { error: 'Une arête est retournée sur place : impossible à obtenir en tournant les faces (somme des retournements ≢ 0 mod 2).' };
  if (odd(c.cp) !== odd(c.ep)) return { error: 'Deux pièces sont échangées : impossible à obtenir en tournant les faces (parités des coins et des arêtes différentes).' };
  return { cube: c };
}

// 3D geometry of each facelet: cubie position p and outward normal n (x right, y up, z front).
export const STICKER_3D = [];
for (let i = 0; i < 54; i++) {
  const r = ((i % 9) / 3) | 0, k = i % 3;
  STICKER_3D.push([
    { p: [k - 1, 1, r - 1], n: [0, 1, 0] },   // U
    { p: [1, 1 - r, 1 - k], n: [1, 0, 0] },   // R
    { p: [k - 1, 1 - r, 1], n: [0, 0, 1] },   // F
    { p: [k - 1, -1, 1 - r], n: [0, -1, 0] }, // D
    { p: [-1, 1 - r, k - 1], n: [-1, 0, 0] }, // L
    { p: [1 - k, 1 - r, -1], n: [0, 0, -1] }, // B
  ][(i / 9) | 0]);
}
export const FACE_AXIS = { U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1], D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1] };
