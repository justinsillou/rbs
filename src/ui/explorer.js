// Small subgroups of the cube whose whole Cayley graph fits on screen.
// Columns = BFS spheres around the solved cube; clicking a vertex lights its shortest path back to solved.
import { MOVE_NAMES, solved, apply, inverse, parse, facelets } from '../cube.js';
import { miniCube } from './minicube.js';
import { name, pl } from './format.js';

const PRESETS = [
  { label: '⟨U⟩', moves: "U U2 U'", note: 'une seule face' },
  { label: '⟨R2, U2⟩', moves: 'R2 U2', note: 'deux demi-tours' },
  { label: '⟨U, D⟩', moves: "U U2 U' D D2 D'", note: 'deux faces opposées' },
  { label: '⟨U2, D2, R2⟩', moves: 'U2 D2 R2', note: 'trois demi-tours' },
];
const FACE_COLOR = { U: 'var(--p2)', D: 'var(--good)', R: 'var(--p1)', L: 'var(--dt)', F: 'var(--bad)', B: 'var(--neutral)' };

// Full BFS from solved: vertices with distance, BFS parent and the move that reached them; undirected edges.
function explore(moves) {
  const nodes = [{ c: solved(), f: facelets(solved()), d: 0, parent: -1, move: -1 }], index = new Map([[nodes[0].f, 0]]), edges = new Map();
  for (let i = 0; i < nodes.length; i++) for (const m of moves) {
    const c = apply(nodes[i].c, [m]), f = facelets(c);
    if (!index.has(f)) { index.set(f, nodes.length); nodes.push({ c, f, d: nodes[i].d + 1, parent: i, move: m }); }
    const j = index.get(f), key = Math.min(i, j) + '-' + Math.max(i, j);
    if (!edges.has(key)) edges.set(key, { i, j, face: MOVE_NAMES[m][0] });
  }
  return { nodes, edges: [...edges.values()] };
}

// Column per distance; inside a column, follow the order of the parents to limit crossings.
function layout(nodes, W, H) {
  const diam = Math.max(...nodes.map(n => n.d)), cols = [];
  nodes.forEach((n, i) => (cols[n.d] ||= []).push(i));
  const y = [], x = [];
  cols.forEach((col, d) => {
    col.sort((a, b) => (y[nodes[a].parent] ?? 0) - (y[nodes[b].parent] ?? 0));
    col.forEach((i, k) => { x[i] = 40 + d * (W - 80) / Math.max(diam, 1); y[i] = 30 + (k + 1) * (H - 40) / (col.length + 1); });
  });
  return { x, y, diam };
}

export function createExplorer(root, onLoad) {
  let preset = 0, graph = null, selected = 0;
  root.innerHTML = `<div class="presets">${PRESETS.map((p, i) => `<button data-p="${i}">${p.label}</button> <span class="hint">${p.note}</span>`).join(' · ')}</div>
    <div class="explorer"><svg class="exgraph" role="img" aria-label="Graphe complet d'un sous-groupe"></svg><div class="exinfo"></div></div>`;
  const svg = root.querySelector('.exgraph'), info = root.querySelector('.exinfo');

  function draw() {
    const { nodes, edges } = graph, big = nodes.length > 20, W = 640, H = big ? 460 : 340;
    const { x, y, diam } = layout(nodes, W, H);
    // path from the selected vertex back to solved, along BFS parents
    const onPath = new Set(), pathMoves = [];
    for (let i = selected; i > 0; i = nodes[i].parent) { onPath.add(i); pathMoves.push(inverse(nodes[i].move)); }
    onPath.add(0);
    const isPathEdge = e => onPath.has(e.i) && onPath.has(e.j) && (nodes[e.i].parent === e.j || nodes[e.j].parent === e.i);
    let s = '';
    for (let d = 0; d <= diam; d++) s += `<text x="${40 + d * (W - 80) / Math.max(diam, 1)}" y="16" text-anchor="middle" class="lbl">${d}</text>`;
    for (const e of edges) {
      const [x1, y1, x2, y2] = [x[e.i], y[e.i], x[e.j], y[e.j]], hot = isPathEdge(e);
      const dpath = x1 === x2 ? `M${x1} ${y1}Q${x1 + 20 + Math.abs(y2 - y1) * .25} ${(y1 + y2) / 2} ${x2} ${y2}` : `M${x1} ${y1}L${x2} ${y2}`;
      s += `<path d="${dpath}" fill="none" stroke="${hot ? 'var(--ink)' : FACE_COLOR[e.face]}" stroke-width="${hot ? 3 : 1.2}" opacity="${hot ? 1 : big ? .35 : .7}"/>`;
    }
    nodes.forEach((n, i) => {
      const ring = onPath.has(i) ? `<circle cx="${x[i]}" cy="${y[i]}" r="${big ? 7 : 19}" fill="var(--paper)" stroke="var(--ink)" stroke-width="${i === selected ? 3 : 1.5}"/>` : '';
      const body = big ? `<circle cx="${x[i]}" cy="${y[i]}" r="4" fill="${i ? 'var(--soft)' : 'var(--good)'}"/>` : miniCube(n.f, x[i], y[i] + 1, 3.3);
      s += `<g class="exnode" data-n="${i}">${ring}${body}<circle cx="${x[i]}" cy="${y[i]}" r="${big ? 8 : 18}" fill="transparent"><title>état à ${pl(n.d, 'coup', 'coups')} du cube résolu</title></circle></g>`;
    });
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = s;

    const moves = PRESETS[preset].moves.split(' '), faces = [...new Set(moves.map(m => m[0]))];
    const n = nodes[selected];
    info.innerHTML = `<p><b>${nodes.length} états</b>, ${edges.length} arêtes, diamètre ${diam}. Mouvements autorisés : ${faces.map(f => `<span style="color:${FACE_COLOR[f]}">${moves.filter(m => m[0] === f).map(m => m.replace("'", '′')).join(' ')}</span>`).join(' · ')}.</p>
      <svg viewBox="-20 -20 40 40" class="expreview">${miniCube(n.f, 0, 0, 5)}</svg>
      <p>${selected ? `Cet état est à <b>${pl(n.d, 'coup', 'coups')}</b> du cube résolu. Plus court chemin (trouvé par BFS) : <span class="mono">${pathMoves.map(name).join(' ')}</span>.` : 'C\'est le cube résolu, point de départ du parcours en largeur.'}</p>
      ${selected ? '<p><button class="load">voir ce cube en 3D et le résoudre</button></p>' : ''}`;
  }

  function choose(p) {
    preset = p; graph = explore(parse(PRESETS[p].moves));
    selected = graph.nodes.length - 1; // farthest vertex: longest shortest path
    root.querySelectorAll('[data-p]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.p === p));
    draw();
  }

  root.querySelector('.presets').onclick = e => { const p = e.target.dataset.p; if (p !== undefined) choose(+p); };
  svg.onclick = e => { const n = e.target.closest('.exnode')?.dataset.n; if (n !== undefined) { selected = +n; draw(); } };
  info.onclick = e => { if (e.target.classList.contains('load')) onLoad(graph.nodes[selected].c); };
  choose(1);
}
