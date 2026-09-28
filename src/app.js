// Application state and wiring: buttons, resolution path, detours, colour painting.
import { MOVE_NAMES, solved, apply, inverse, scramble, randomState, facelets, fromFacelets } from './cube.js';
import { init, solve } from './solver.js';
import { $, STICKER, COLOR_FR, name, signed } from './ui/format.js';
import { drawNet } from './ui/net.js';
import { createCube3d } from './ui/cube3d.js';
import { drawGraph } from './ui/graph.js';
import { stepTexts, moveHint, seqHtml } from './ui/explain.js';
import { drawLocal, drawStrip } from './ui/closeup.js';
import { createExplorer } from './ui/explorer.js';

// path[i] = { m, phase } with phase 1 / 2 from the solver, 0 for a move forced by the user.
const st = {
  cube: solved(), active: false, path: [], states: [], step: 0,
  nodes: 0, firstLen: 0, detours: {}, paint: null,
};
let brush = 'U', timer = null;
const current = () => st.active ? st.states[st.step] : st.cube;
const shown = () => st.paint ? st.paint.join('') : facelets(current());
const status = msg => { $('#status').textContent = msg; };
const cube3d = createCube3d($('#scene'), $('#cube3d'));

// Static 3D view; during a resolution the next layer to turn is outlined.
const show3d = () => cube3d.draw(shown(), !st.paint && st.active && st.step < st.path.length ? st.path[st.step].m : undefined);
// Play move m from facelets f, then settle on the current state.
const animate = (f, m) => cube3d.draw(f, m, show3d);

function render() {
  drawNet($('#net'), shown());
  const local = drawGraph($('#graph'), st);
  [$('#easy').innerHTML, $('#deep').innerHTML] = stepTexts(st, local);
  $('#seq').innerHTML = seqHtml(st);
  $('#move3d').innerHTML = moveHint(st);
  const { active, path, step } = st;
  drawLocal($('#local'), current(), active && step < path.length ? path[step].m : undefined, active && step > 0 ? inverse(path[step - 1].m) : undefined);
  drawStrip($('#strip'), st);
  show3d();
  for (const id of ['first', 'prev', 'next', 'last', 'play']) $('#' + id).disabled = !st.active;
}

function solveFrom(c) {
  const r = solve(c, 500);
  st.nodes = r.nodes;
  return r.phase1.map(m => ({ m, phase: 1 })).concat(r.phase2.map(m => ({ m, phase: 2 })));
}
function rebuild(from) { // recompute states after index `from`
  st.states = st.states.slice(0, from + 1);
  for (let i = from; i < st.path.length; i++) st.states.push(apply(st.states[i], [st.path[i].m]));
}
function setCube(c, msg) {
  stop();
  Object.assign(st, { cube: c, active: false, path: [], states: [], step: 0, detours: {} });
  if (msg !== undefined) status(msg);
  render();
}
function detour(m) {
  stop();
  const i = st.step, orig = st.path[i]?.m, before = st.path.length;
  st.path = st.path.slice(0, i).concat([{ m, phase: 0 }], solveFrom(apply(st.states[i], [m])));
  rebuild(i);
  for (const k in st.detours) if (+k >= i) delete st.detours[k];
  st.detours[i] = { orig, before, after: st.path.length };
  status(`Détour au coup ${i + 1} : ${name(m)}${orig === undefined ? '' : ` au lieu de ${name(orig)}`}. Nouveau chemin : ${st.path.length} coups (avant : ${before}, Δ = ${signed(st.path.length - before)}).`);
  render();
}
function go(i) {
  if (!st.active) return;
  const from = st.step;
  st.step = Math.max(0, Math.min(st.path.length, i));
  render();
  if (st.step === from + 1) animate(facelets(st.states[from]), st.path[from].m);
  else if (st.step === from - 1) animate(facelets(st.states[from]), inverse(st.path[st.step].m));
}
function stop() { clearInterval(timer); timer = null; $('#play').textContent = 'lecture'; }

// A move chosen by the user: turn the cube; during a resolution, follow the path forward or back, or force a detour.
function playMove(m) {
  if (!st.active) {
    const f = facelets(st.cube);
    setCube(apply(st.cube, [m]));
    return animate(f, m);
  }
  if (m === st.path[st.step]?.m) return go(st.step + 1);
  if (st.step > 0 && m === inverse(st.path[st.step - 1].m)) return go(st.step - 1);
  detour(m);
}
$('#pad').innerHTML = MOVE_NAMES.map((_, m) => `<button data-m="${m}">${name(m)}</button>`).join('');
$('#pad').onclick = e => { const m = e.target.closest('button')?.dataset.m; if (m !== undefined) playMove(+m); };
$('#local').onclick = e => { const m = e.target.closest('.nbc')?.dataset.m; if (m !== undefined) { stop(); playMove(+m); } };
$('#strip').onclick = e => { const i = e.target.closest('.node')?.dataset.i; if (i !== undefined) { stop(); go(+i); } };
createExplorer($('#explorer'), c => {
  setCube(c, 'Cube chargé depuis le petit graphe. Clique sur « résoudre » : le solveur retrouve-t-il le plus court chemin ?');
  $('#left').scrollIntoView({ behavior: 'smooth' });
});

$('#scramble').onclick = () => {
  const k = Math.max(1, Math.min(200, Math.round(+$('#len').value) || 25)), s = scramble(k);
  $('#len').value = k;
  setCube(apply(solved(), s), `Mélange de ${k} coups : ${s.map(name).join(' ')}`);
};
$('#random').onclick = () => setCube(randomState(), 'État tiré uniformément parmi les 4,3·10¹⁹ positions (méthode des compétitions WCA).');
$('#reset').onclick = () => setCube(solved(), '');
$('#solve').onclick = () => {
  const c = current(), t = performance.now();
  stop();
  Object.assign(st, { cube: c, active: true, step: 0, detours: {}, states: [c] });
  st.path = solveFrom(c); rebuild(0); st.firstLen = st.path.length;
  status(st.path.length ? `Solution en ${st.path.length} coups, trouvée en ${Math.round(performance.now() - t)} ms.` : 'Le cube est déjà résolu.');
  render();
};

// Step navigation.
$('#first').onclick = () => { stop(); go(0); };
$('#prev').onclick = () => { stop(); go(st.step - 1); };
$('#next').onclick = () => { stop(); go(st.step + 1); };
$('#last').onclick = () => { stop(); go(st.path.length); };
$('#play').onclick = () => {
  if (timer) return stop();
  if (st.step === st.path.length) go(0);
  $('#play').textContent = 'pause';
  timer = setInterval(() => { go(st.step + 1); if (st.step === st.path.length) stop(); }, 1500);
};
$('#graph').onclick = e => {
  const { i, m } = e.target.dataset;
  if (m !== undefined) { stop(); playMove(+m); }
  else if (i !== undefined) { stop(); go(+i); }
};
$('#seq').onclick = e => { const i = e.target.closest('button')?.dataset.i; if (i !== undefined) { stop(); go(+i); } };

// Colour painting: copy a real cube, then check it against the three invariants.
function setPaint(p) { st.paint = p; $('#left').classList.toggle('painting', !!p); render(); }
$('#swatches').innerHTML = Object.keys(COLOR_FR).map(c => `<button class="sw ${c === brush ? 'on' : ''}" data-c="${c}" style="background:${STICKER[c]}" title="${COLOR_FR[c]}" aria-label="${COLOR_FR[c]}"></button>`).join('');
$('#swatches').onclick = e => {
  const c = e.target.dataset.c;
  if (!c) return;
  brush = c;
  document.querySelectorAll('.sw').forEach(b => b.classList.toggle('on', b.dataset.c === c));
};
$('#paint').onclick = () => { setCube(current(), ''); setPaint([...facelets(st.cube)]); };
$('#net').onclick = e => { const i = e.target.dataset?.i; if (st.paint && i !== undefined) { st.paint[+i] = brush; render(); } };
$('#paintClear').onclick = () => setPaint(st.paint.map((c, i) => i % 9 === 4 ? c : 'X'));
$('#paintCancel').onclick = () => { setPaint(null); status(''); };
$('#paintOk').onclick = () => {
  const r = fromFacelets(st.paint.join(''));
  if (r.error) return status('Cube impossible : ' + r.error.replace(/couleur ([URFDLB])/, (_, c) => 'couleur ' + COLOR_FR[c]));
  st.paint = null; $('#left').classList.remove('painting');
  setCube(r.cube, 'Cube saisi et valide (les trois invariants sont respectés). Clique sur « résoudre ».');
};

// Reading level on small screens: en clair / en détail / les deux.
$('#levels').onclick = e => {
  const lv = e.target.dataset.level;
  if (!lv) return;
  $('.duo').dataset.level = lv;
  document.querySelectorAll('#levels button').forEach(b => b.setAttribute('aria-pressed', b.dataset.level === lv));
};

render();
setTimeout(() => { // let the page paint before the ~1 s table build
  const { ms } = init();
  status(`Prêt. Tables de distances construites en ${ms} ms (quatre parcours en largeur, 4 millions de sommets).`);
  $('#solve').disabled = false;
  render(); // colour the neighbours now that h is known
}, 30);
