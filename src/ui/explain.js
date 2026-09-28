// Step-by-step texts at two reading levels: "en clair" (easy) and "en détail" (deep, graph theory and maths).
import { MOVE_NAMES, facelets } from '../cube.js';
import { init, estimate, SIZES } from '../solver.js';
import { FACE_FR, TURN_FR, G0, name, say, num, sci, pct, pl, signed, sgn } from './format.js';

const zone = c => estimate(c).phase;

// What a child can see on the cube.
function stats(c) {
  const f = facelets(c);
  return {
    twisted: c.co.filter(x => x).length,
    flipped: c.eo.filter(x => x).length,
    lost: [8, 9, 10, 11].filter(j => c.ep[j] < 8).length,
    corners: c.cp.filter((p, i) => p === i && !c.co[i]).length,
    edges: c.ep.filter((p, i) => p === i && !c.eo[i]).length,
    stickers: [...f].filter((x, i) => x === f[((i / 9) | 0) * 9 + 4]).length,
  };
}

// Distance distribution of a projected graph, current distance highlighted.
function histo(h, cur, color) {
  const W = 240, H = 60, max = Math.max(...h.map(v => v || 0)), bw = W / h.length;
  let s = `<svg viewBox="0 0 ${W} ${H + 12}">`;
  h.forEach((v, d) => {
    const bh = Math.max(1, (v || 0) / max * H);
    s += `<rect x="${d * bw + 1}" y="${H - bh}" width="${bw - 2}" height="${bh}" fill="${d === cur ? color : 'var(--faint)'}"><title>d = ${d} : ${num(v || 0)} sommets</title></rect>
      <text x="${d * bw + bw / 2}" y="${H + 10}" text-anchor="middle">${d}</text>`;
  });
  return s + '</svg>';
}
const mean = h => h.reduce((s, v, d) => s + v * d, 0) / h.reduce((s, v) => s + v, 0);
function histos(ka, kb, a, b, color) {
  const { hist } = init();
  const cap = (k, d, l) => `${l} : P(<i>d</i> = ${d}) = ${pct(hist[k][d] / SIZES[k])}, E[<i>d</i>] = ${mean(hist[k]).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`;
  return `<div class="histos"><div>${histo(hist[ka], a, color)}${cap(ka, a, 'Γ<sub>A</sub>')}</div><div>${histo(hist[kb], b, color)}${cap(kb, b, 'Γ<sub>B</sub>')}</div></div>`;
}

const meter = rows => `<table class="meter">${rows.map(([label, before, after, total, goodIsLow]) => {
  const ok = goodIsLow ? total - after : after;
  return `<tr><td>${label}</td><td class="bar"><span><i style="width:${100 * ok / total}%;background:var(--good)"></i></span></td><td>${before} → <b>${after}</b> / ${total}</td></tr>`;
}).join('')}</table>`;

// Run of consecutive moves with the same label as path[i]: moves a .. b-1.
function segment(path, i) {
  const ph = path[i].phase;
  let a = i, b = i;
  while (a > 0 && path[a - 1].phase === ph) a--;
  while (b < path.length && path[b].phase === ph) b++;
  return { a, b };
}

function detourText({ path, states, detours }, i) {
  const d = detours[i], delta = d.after - d.before, m = path[i].m;
  const easy = `<p class="tag p0">Détour imposé — coup ${i + 1} sur ${path.length}</p>
    <p>${d.orig === undefined ? 'Le cube était résolu' : `Ici, le solveur voulait jouer <b class="mono">${name(d.orig)}</b>`}, mais tu as choisi <b class="mono">${name(m)}</b> : ${say(m)}. Il a recalculé un chemin depuis là : la solution passe de ${d.before} à ${d.after} coups.</p>
    <p>${delta < 0 ? 'Surprise : ton détour est plus court ! Le solveur ne trouve donc pas toujours le meilleur chemin : il s\'arrête de chercher au bout d\'une demi-seconde.'
      : delta === 0 ? 'Même longueur : il existe souvent plusieurs meilleurs chemins.'
      : `Ce détour coûte ${pl(delta, 'coup', 'coups')} de plus.`}</p>`;
  const deep = `<p class="tag p0">Arête imposée s = ${name(m)}${d.orig === undefined ? '' : ` (IDA* proposait ${name(d.orig)})`}</p>
    <p>Nouvelle recherche depuis <i>x</i><sub>${i}</sub>·<i>s</i>. Si les deux chemins étaient optimaux, |<i>d</i>(<i>xs</i>) − <i>d</i>(<i>x</i>)| ≤ 1 imposerait Δ ∈ {0, 1, 2}. Ici Δ = ${signed(delta)}${delta < 0 ? ' &lt; 0 : <b>contre-exemple</b>, le chemin initial n\'était pas optimal (budget de temps de 500 ms, pas de garantie de longueur).'
      : delta > 2 ? ' &gt; 2 : le nouveau chemin n\'est pas optimal.' : ', compatible avec l\'optimalité (sans la prouver).'}</p>
    ${zone(states[i]) === 2 && zone(states[i + 1]) === 1 ? '<p><i>x</i> ∈ <i>G</i>₁ mais <i>s</i> ∉ <i>S</i>₂, donc <i>xs</i> ∉ <i>G</i>₁ : l\'état ressort dans le graphe de Schreier et le solveur doit refaire une phase 1.</p>' : ''}`;
  return [easy, deep];
}

// Short instruction under the 3D cube.
export function moveHint(st) {
  const { active, paint, path, step } = st;
  if (paint) return '<i>Mode coloriage : le cube 3D suit tes couleurs.</i>';
  if (!active) return '<i>Clique sur un mouvement (U, R′, F2…) pour le voir en 3D. Glisse sur le cube pour le tourner.</i>';
  if (step === path.length) return `Cube résolu en ${path.length} coups.`;
  const m = path[step].m, n = MOVE_NAMES[m];
  return `Coup ${step + 1} sur ${path.length} : <b class="mono">${name(m)}</b>. Place-toi face à ${FACE_FR[n[0]]} (encadrée) et tourne-la ${TURN_FR[n.slice(1)]}. Clique « suiv. » pour le voir.`;
}

// Returns [easy html, deep html] for the current step. `local` comes from drawGraph.
export function stepTexts(st, local) {
  const { active, path, states, step, detours, nodes, firstLen } = st;
  if (!active) return [
    '<p><i>Clique sur « mélanger », puis sur « résoudre ». Tu pourras ensuite suivre la solution coup par coup, et forcer d\'autres coups pour voir ce qui se passe.</i></p>',
    '<p><i>Choisir un sommet x ∈ G₀ : marche aléatoire de k pas sur Cay(G₀, S) (« mélanger ») ou tirage uniforme (« état aléatoire »), puis lancer la recherche.</i></p>',
  ];
  const n = path.length;

  if (step === n) {
    const nd = Object.keys(detours).length;
    const hist = nd ? ` Chemin initial : ${firstLen} coups ; avec ${pl(nd, 'détour', 'détours')} : ${n} (${signed(n - firstLen)}).` : '';
    return [
      `<p class="tag ok">Terminé !</p>
      <p>Le cube est résolu en <b>${n} coups</b>.${hist}</p>
      <p>Pour trouver ${nd ? 'la dernière partie de ' : ''}ce chemin, l'ordinateur a examiné ${num(nodes)} positions. Ça paraît beaucoup, mais c'est environ une sur ${sci(G0 / nodes)} de toutes celles qui existent : la boussole lui a évité de se perdre.</p>`,
      `<p class="tag ok">Arrivée · x<sub>${n}</sub> = e</p>
      <p>Chemin de longueur <i>n</i> = ${n}.${hist} Sans détour, <i>L</i>₁ + <i>L</i>₂ ≤ 12 + 18 = 30 (somme des diamètres) ; l'optimum global est ≤ 20. L'algorithme ne garantit pas l'optimalité, mais énumère plusieurs chemins de phase 1 sous un budget de 500 ms pour réduire <i>L</i>₁ + <i>L</i>₂.</p>
      <p>Dernière recherche IDA* : ${num(nodes)} nœuds développés, soit une fraction ${sci(nodes / G0)} de |<i>G</i>₀|.</p>`,
    ];
  }

  const { phase, h, a, b, coords: k, neighbours } = local, deg = neighbours.length, mv = path[step];
  const down = neighbours.filter(v => v.h < h).length, up = neighbours.filter(v => v.h > h).length, same = deg - down - up;
  const next = neighbours.find(v => v.m === mv.m).h;
  // Upper bound from the path itself, this move included: moves until the next G1 state (phase 1) or until solved (phase 2).
  let j = step + 1;
  while (phase === 1 && zone(states[j]) === 1) j++;
  const rem = (phase === 1 ? j : n) - step;
  const s0 = stats(states[step]), s1 = stats(states[step + 1]);

  const choice = `Parmi les ${deg} mouvements possibles, ${pl(down, 'nous rapproche', 'nous rapprochent')} du but, ${pl(same, 'ne change rien', 'ne changent rien')} et ${pl(up, 'nous en éloigne', 'nous en éloignent')}. Le solveur joue <b class="mono">${name(mv.m)}</b> : ${say(mv.m)}.`
    + (next < h ? ' La boussole baisse : on se rapproche.'
      : next === h ? ` La boussole ne bouge pas : ce coup ne rapproche pas tout de suite, il prépare les suivants${down ? '' : ' (ici, aucun coup ne la fait baisser)'}. Comme aux échecs, un coup peut servir à préparer le suivant.`
      : ' La boussole monte : c\'est un détour, mais le solveur sait qu\'il mène au but plus vite.');
  const edges = `<p>Voisinage : ${deg} arêtes, Δ<i>h</i> ∈ {−1, 0, +1} (<i>h</i> cohérente), effectifs (${down}, ${same}, ${up}). Un coup tiré uniformément fait progresser avec probabilité ${down}/${deg} ≈ ${pct(down / deg)}. Arête ${mv.phase ? 'choisie' : 'imposée'} : <span class="mono">${name(mv.m)}</span>, <i>h</i> : ${h} → ${next}.`
    + (mv.phase && next >= h ? ' Ici Δ<i>h</i> ≥ 0 alors que le nombre de coups restants sur le chemin baisse de 1 : <i>h</i> n\'est qu\'une borne inférieure, parfois lâche, et IDA* accepte toute arête qui garde <i>g</i> + 1 + <i>h</i>′ ≤ <i>L</i>.' : '') + '</p>';
  let bound = '';
  if (mv.phase) {
    const sg = segment(path, step);
    bound = `<p>Borne IDA* : <i>f</i> = <i>g</i> + <i>h</i> = ${step - sg.a} + ${h} = ${step - sg.a + h} ≤ <i>L</i> = ${sg.b - sg.a}.</p>`;
  }
  const [dEasy, dDeep] = mv.phase ? ['', ''] : detourText(st, step);

  if (phase === 1) return [
    (dEasy || `<p class="tag p1">Mission 1 · mettre les pièces dans le bon sens — coup ${step + 1} sur ${n}</p><p>${choice}</p>`) + `
      <p>Ce que ça change :</p>
      ${meter([['coins tordus', s0.twisted, s1.twisted, 8, true], ['arêtes retournées', s0.flipped, s1.flipped, 12, true], ['arêtes du milieu égarées', s0.lost, s1.lost, 4, true]])}
      <p>La boussole indique : encore <b>au moins ${next} coup${next > 1 ? 's' : ''}</b> après celui-ci pour finir la mission 1 (sur ce chemin : ${rem - 1}). Les couleurs à leur place passent de ${s0.stickers} à ${s1.stickers} sur 54 : pas d'inquiétude si le cube a l'air plus mélangé, cette mission ne regarde pas encore les couleurs.</p>`,
    (dDeep || `<p class="tag p1">Phase 1 · graphe de Schreier Sch(G₀, G₁, S)</p>`) + `
      <p>Sommet <i>x</i><sub>${step}</sub>, classe <i>G</i>₁<i>x</i> codée par (<i>co</i>, <i>eo</i>, <i>e</i>) = (${k.co}, ${k.eo}, ${k.sl}) ∈ ℤ₃⁷ × ℤ₂¹¹ × ⟦0, 494⟧.</p>
      <p>Distances exactes (BFS) dans les projections : <i>d<sub>A</sub></i> = ${a} dans Γ<sub>A</sub> = CO × tranche (${num(SIZES.p1a)} sommets), <i>d<sub>B</sub></i> = ${b} dans Γ<sub>B</sub> = EO × tranche (${num(SIZES.p1b)}). D'où <i>h</i> = max = ${h} ≤ <i>d</i>(<i>G</i>₁<i>x</i>, <i>G</i>₁) ≤ ${rem}.</p>
      ${bound}${edges}
      ${histos('p1a', 'p1b', a, b, 'var(--p1)')}`,
  ];

  return [
    (dEasy || `<p class="tag p2">Mission 2 · remettre chaque pièce à sa place — coup ${step + 1} sur ${n}</p>
      <p>Toutes les pièces sont dans le bon sens. On n'utilise plus que 10 mouvements (tourner le dessus ou le dessous, ou des demi-tours sur les côtés) : ils ne peuvent plus retourner une pièce.</p><p>${choice}</p>`) + `
      ${meter([['coins à leur place', s0.corners, s1.corners, 8, false], ['arêtes à leur place', s0.edges, s1.edges, 12, false], ['couleurs à leur place', s0.stickers, s1.stickers, 54, false]])}
      <p>La boussole indique : encore <b>au moins ${next} coup${next > 1 ? 's' : ''}</b> après celui-ci (sur ce chemin : ${rem - 1}).</p>`,
    (dDeep || `<p class="tag p2">Phase 2 · graphe de Cayley Cay(G₁, S₂), |S₂| = 10</p>`) + `
      <p>Sommet <i>x</i><sub>${step}</sub> ∈ <i>G</i>₁, codé par les rangs de Lehmer (σ<sub>c</sub>, σ<sub>e</sub>, σ<sub>t</sub>) = (${k.cp}, ${k.ud}, ${k.sp}) ∈ 𝔖₈ × 𝔖₈ × 𝔖₄. Invariant de parité : sgn σ<sub>c</sub> = ${sgn(states[step].cp) > 0 ? '+1' : '−1'} = sgn(σ<sub>e</sub>)·sgn(σ<sub>t</sub>), d'où |<i>G</i>₁| = 8!·8!·4!/2.</p>
      <p>Distances exactes (BFS) : <i>d<sub>A</sub></i> = ${a} dans Γ<sub>A</sub> = 𝔖₈ (coins) × 𝔖₄ (tranche), <i>d<sub>B</sub></i> = ${b} dans Γ<sub>B</sub> = 𝔖₈ (arêtes U/D) × 𝔖₄ (${num(SIZES.p2a)} sommets chacun). D'où <i>h</i> = ${h} ≤ <i>d</i>(<i>x</i>, <i>e</i>) ≤ ${rem}.</p>
      ${bound}${edges}
      ${histos('p2a', 'p2b', a, b, 'var(--p2)')}`,
  ];
}

// Sequence of moves under the graph, coloured by phase, current one underlined.
export const seqHtml = ({ active, path, step }) => active ? path.map(({ m, phase }, i) =>
  `<button class="p${phase} ${i < step ? 'done' : ''} ${i === step ? 'cur' : ''}" data-i="${i}">${name(m)}</button>`).join('') : '';
