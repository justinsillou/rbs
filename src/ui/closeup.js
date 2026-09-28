// The graph seen up close: real cubes as vertices.
// - drawLocal: the current state and its 18 neighbours (ball of radius 1 in the Cayley graph).
// - drawStrip: the resolution path as a chain of cubes linked by moves.
import { MOVE_NAMES, apply, facelets } from '../cube.js';
import { estimate, ready } from '../solver.js';
import { miniCube } from './minicube.js';
import { name } from './format.js';

// Progress towards solved: being inside G1 beats being outside, then lower h is better.
const score = c => { const { phase, h } = estimate(c); return (phase === 1 ? 100 : 0) + h; };

// c: current state; next / prev: move indices (or undefined) of the path through c.
export function drawLocal(svg, c, next, prev) {
  const W = 600, H = 470, cx = W / 2, cy = H / 2, R = 180, known = ready();
  const here = known ? score(c) : 0;
  const pos = MOVE_NAMES.map((_, k) => { // 18 slots, a small gap between faces
    const a = ((k + Math.floor(k / 3) * .5) / 21) * 2 * Math.PI - Math.PI / 2;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
  });
  let s = '';
  // Same-face neighbours are adjacent to each other (xR --R--> xR2): 6 triangles.
  for (let k = 0; k < 18; k += 3) for (const [i, j] of [[k, k + 1], [k + 1, k + 2], [k, k + 2]])
    s += `<line x1="${pos[i][0]}" y1="${pos[i][1]}" x2="${pos[j][0]}" y2="${pos[j][1]}" stroke="var(--faint)" stroke-dasharray="3 3"><title>${name(i)} et ${name(j)} : ces deux voisins sont reliés par un seul coup de la face ${MOVE_NAMES[k][0]}</title></line>`;
  const nbs = MOVE_NAMES.map((_, m) => {
    const d = apply(c, [m]), sc = known ? score(d) : here;
    const col = sc < here ? 'var(--good)' : sc > here ? 'var(--bad)' : 'var(--neutral)';
    return { m, d, col };
  });
  for (const { m, col } of nbs) {
    const [x, y] = pos[m], strong = m === next;
    s += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${col}" stroke-width="${strong ? 3 : 1}" opacity="${strong ? 1 : .6}"/>`;
  }
  for (const { m, d, col } of nbs) {
    const [x, y] = pos[m], strong = m === next, back = m === prev;
    s += `<g class="nbc" data-m="${m}"><circle cx="${x}" cy="${y}" r="27" fill="var(--paper)" stroke="${strong ? 'var(--ink)' : col}" stroke-width="${strong ? 3 : 2}"/>
      ${miniCube(facelets(d), x, y + 1, 6.5)}
      <text x="${x}" y="${y + (y < cy ? -33 : 43)}" text-anchor="middle" class="lbl">${name(m)}${back ? ' ↩' : ''}</text>
      <title>${name(m)}${strong ? ' : le coup choisi par le solveur' : back ? ' : revenir à l\'état précédent' : ''} (cliquer pour jouer ce coup)</title></g>`;
  }
  const e = known ? estimate(c) : null;
  s += `<circle cx="${cx}" cy="${cy}" r="62" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/>
    ${miniCube(facelets(c), cx, cy + 2, 14)}
    <text x="${cx}" y="${cy + 80}" text-anchor="middle">${e ? (e.phase === 1 ? `hors de G₁, h = ${e.h}` : e.h ? `dans G₁, h = ${e.h}` : 'résolu') : 'état actuel'}</text>`;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = s;
}

// st = { active, path, states, step }
export function drawStrip(box, st) {
  if (!st.active) { box.innerHTML = '<p class="hint">La solution apparaîtra ici, cube par cube : chaque cube est un sommet du graphe, chaque flèche un mouvement.</p>'; return; }
  const { path, states, step } = st, gap = 78, H = 96, W = 40 + path.length * gap;
  const col = p => ['var(--dt)', 'var(--p1)', 'var(--p2)'][p];
  let s = '';
  path.forEach(({ m, phase }, i) => {
    const x = 20 + i * gap + 20;
    s += `<g opacity="${i < step ? 1 : .45}"><line x1="${x + 18}" y1="42" x2="${x + gap - 22}" y2="42" stroke="${col(phase)}" stroke-width="2" ${phase ? '' : 'stroke-dasharray="4 3"'}/>
      <path d="M${x + gap - 22} 42l-7-4v8z" fill="${col(phase)}"/>
      <text x="${x + gap / 2}" y="30" text-anchor="middle" class="lbl" style="fill:${col(phase)}">${name(m)}</text></g>`;
  });
  states.forEach((c, i) => {
    const x = 40 + i * gap;
    s += `<g class="node" data-i="${i}">${i === step ? `<rect x="${x - 22}" y="14" width="44" height="58" rx="6" fill="none" stroke="var(--ink)" stroke-width="2"/>` : ''}
      ${miniCube(facelets(c), x, 43, 4.6)}<rect x="${x - 22}" y="14" width="44" height="58" fill="transparent"><title>état ${i}</title></rect></g>
      <text x="${x}" y="${H - 6}" text-anchor="middle" class="lbl">${i}</text>`;
  });
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:${W}px;max-width:none">${s}</svg>`;
  box.scrollLeft = 40 + step * gap - box.clientWidth / 2;
}
