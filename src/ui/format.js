// Shared UI vocabulary: sticker colours, French wording, number formatting.
import { MOVE_NAMES } from '../cube.js';

export const $ = s => document.querySelector(s);
export const STICKER = { U: '#f4f1ea', R: '#b8312f', F: '#2f7d4a', D: '#e9c93c', L: '#d9742b', B: '#2b5ea8', X: '#9a948a' };
export const COLOR_FR = { U: 'blanc', R: 'rouge', F: 'vert', D: 'jaune', L: 'orange', B: 'bleu', X: 'gris (vide)' };
export const FACE_FR = { U: 'la face du dessus', D: 'la face du dessous', R: 'la face de droite', L: 'la face de gauche', F: 'la face avant', B: 'la face arrière' };
export const TURN_FR = { '': "d'un quart de tour, dans le sens des aiguilles d'une montre", '2': "d'un demi-tour", "'": "d'un quart de tour, dans l'autre sens" };
export const G0 = 43252003274489856000;

export const name = m => MOVE_NAMES[m].replace("'", '′');
export const say = m => { const n = MOVE_NAMES[m]; return `on tourne ${FACE_FR[n[0]]} ${TURN_FR[n.slice(1)]}`; };
export const num = x => x.toLocaleString('fr-FR');
export const sci = x => { const [m, e] = x.toExponential(1).split('e'); return `${m.replace('.', ',')}·10<sup>${+e}</sup>`; };
export const pct = x => (x && x < 1e-3 ? sci(100 * x) : (100 * x).toLocaleString('fr-FR', { maximumFractionDigits: 1 })) + ' %';
export const pl = (n, one, many) => `${n} ${n > 1 ? many : one}`;
export const signed = d => (d > 0 ? '+' : d < 0 ? '−' : '') + Math.abs(d);
export const sgn = p => { let s = 1; for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (p[i] > p[j]) s = -s; return s; };
