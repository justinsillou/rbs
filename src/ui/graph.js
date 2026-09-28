// Nested rings G0 ⊃ G1 ⊃ {solved}, the resolution path, and the local graph around the current state.
import { estimate, neighbourhood } from '../solver.js';
import { name } from './format.js';

const C = 320, R0 = 300, R1 = 165;
const moveColor = p => ['var(--dt)', 'var(--p1)', 'var(--p2)'][p];

// Radius = lower bound h in the graph the state lives in; angle = position along the path.
function layout(path, states) {
  const n = path.length;
  return states.map((c, i) => {
    const { phase, h } = estimate(c);
    const r = phase === 1 ? R1 + 12 + (R0 - R1 - 35) * Math.min(h, 12) / 12 : (R1 - 20) * Math.min(h, 18) / 18;
    const a = (-90 + (n ? i * 330 / n : 0)) * Math.PI / 180;
    return [C + r * Math.cos(a), C + r * Math.sin(a), phase];
  });
}

// Neighbours of the current state, coloured by how h changes. Returns [svg, local info].
function fan({ path, states, step }, [x, y], [nx, ny]) {
  const phase = estimate(states[step]).phase === 2 && estimate(states[step + 1]).phase === 2 ? 2 : 1;
  const nb = neighbourhood(states[step], phase), n = nb.neighbours.length, chosenMove = path[step].m;
  // rotate so the chosen neighbour points at the next node of the path
  const a0 = Math.atan2(ny - y, nx - x) - 2 * Math.PI * nb.neighbours.findIndex(v => v.m === chosenMove) / n;
  let s = '';
  nb.neighbours.forEach(({ m, h }, k) => {
    const a = a0 + 2 * Math.PI * k / n, px = x + 32 * Math.cos(a), py = y + 32 * Math.sin(a);
    const c = h < nb.h ? 'var(--good)' : h > nb.h ? 'var(--bad)' : 'var(--neutral)', chosen = m === chosenMove;
    s += `<line x1="${x}" y1="${y}" x2="${px}" y2="${py}" stroke="${c}" stroke-width=".8"/>
      <circle cx="${px}" cy="${py}" r="${chosen ? 5 : 4}" fill="${c}"/>
      <circle class="nb" data-m="${m}" cx="${px}" cy="${py}" r="11" fill="transparent"><title>${name(m)} → h = ${h}${chosen ? '' : ' (cliquer pour forcer ce coup)'}</title></circle>`;
  });
  return [s, { phase, ...nb }];
}

// st = { active, path, states, step }. Returns the local graph info of the current step (or null).
export function drawGraph(svg, st) {
  let s = `<circle cx="${C}" cy="${C}" r="${R0}" fill="none" stroke="var(--faint)" stroke-width="1.5"/>
    <circle cx="${C}" cy="${C}" r="${R1}" fill="none" stroke="var(--faint)" stroke-width="1.5" stroke-dasharray="6 5"/>
    <text x="${C}" y="${C + R0 - 14}" text-anchor="middle">G₀ — tous les états (4,3·10¹⁹)</text>
    <text x="${C}" y="${C - R1 + 24}" text-anchor="middle">G₁ = ⟨U, D, R2, F2, L2, B2⟩</text>
    <circle cx="${C}" cy="${C}" r="5" fill="var(--ink)"/>
    <text x="${C}" y="${C + 24}" text-anchor="middle">résolu</text>`;
  let local = null;
  if (st.active) {
    const { path, states, step } = st, P = layout(path, states);
    path.forEach(({ m, phase }, i) => {
      const [x1, y1] = P[i], [x2, y2] = P[i + 1];
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${moveColor(phase)}" stroke-width="1.8" stroke-linecap="round" ${phase ? '' : 'stroke-dasharray="5 4"'} opacity="${i < step ? 1 : .3}"/>`;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, d = Math.hypot(mx - C, my - C) || 1;
      s += `<text class="lbl" x="${mx + (mx - C) / d * 13}" y="${my + (my - C) / d * 13 + 4}" text-anchor="middle">${name(m)}</text>`;
    });
    if (step < path.length) {
      const [html, info] = fan(st, P[step], P[step + 1]);
      s += html; local = info;
    }
    P.forEach(([x, y, phase], i) => {
      const c = i === path.length ? 'var(--ink)' : moveColor(phase);
      s += i === step
        ? `<circle class="node" data-i="${i}" cx="${x}" cy="${y}" r="7" fill="var(--paper)" stroke="${c}" stroke-width="2.5"><title>état ${i}</title></circle>`
        : `<circle class="node" data-i="${i}" cx="${x}" cy="${y}" r="4" fill="${c}"><title>état ${i}</title></circle>`;
    });
  }
  svg.innerHTML = s;
  return local;
}
