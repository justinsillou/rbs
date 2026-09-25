// Rubik's cube model + Kociemba two-phase solver.
// Nested graphs: G0 = <U,R,F,D,L,B>  ⊃  G1 = <U,D,R2,F2,L2,B2>  ⊃  {solved}
// Phase 1 walks the quotient graph G0/G1, phase 2 walks the Cayley graph of G1.
(function (root) {
  'use strict';

  const FACES = 'URFDLB';
  const MOVE_NAMES = [];
  for (const f of FACES) MOVE_NAMES.push(f, f + '2', f + "'");

  // Cubie model (Kociemba conventions).
  // Corners: URF UFL ULB UBR DFR DLF DBL DRB — Edges: UR UF UL UB DR DF DL DB FR FL BL BR
  const BASE = [
    { cp: [3, 0, 1, 2, 4, 5, 6, 7], co: [0, 0, 0, 0, 0, 0, 0, 0], ep: [3, 0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // U
    { cp: [4, 1, 2, 0, 7, 5, 6, 3], co: [2, 0, 0, 1, 1, 0, 0, 2], ep: [8, 1, 2, 3, 11, 5, 6, 7, 4, 9, 10, 0], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // R
    { cp: [1, 5, 2, 3, 0, 4, 6, 7], co: [1, 2, 0, 0, 2, 1, 0, 0], ep: [0, 9, 2, 3, 4, 8, 6, 7, 1, 5, 10, 11], eo: [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0] }, // F
    { cp: [0, 1, 2, 3, 5, 6, 7, 4], co: [0, 0, 0, 0, 0, 0, 0, 0], ep: [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // D
    { cp: [0, 2, 6, 3, 4, 1, 5, 7], co: [0, 1, 2, 0, 0, 2, 1, 0], ep: [0, 1, 10, 3, 4, 5, 9, 7, 8, 2, 6, 11], eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // L
    { cp: [0, 1, 3, 7, 4, 5, 2, 6], co: [0, 0, 1, 2, 0, 0, 2, 1], ep: [0, 1, 2, 11, 4, 5, 6, 10, 8, 9, 3, 7], eo: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1] }, // B
  ];

  const solved = () => ({ cp: [0, 1, 2, 3, 4, 5, 6, 7], co: Array(8).fill(0), ep: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], eo: Array(12).fill(0) });

  // a * b = apply a, then b
  function mul(a, b) {
    return {
      cp: b.cp.map(p => a.cp[p]),
      co: b.cp.map((p, i) => (a.co[p] + b.co[i]) % 3),
      ep: b.ep.map(p => a.ep[p]),
      eo: b.ep.map((p, i) => (a.eo[p] + b.eo[i]) % 2),
    };
  }

  const MOVES = [];
  for (const b of BASE) { const b2 = mul(b, b); MOVES.push(b, b2, mul(b2, b)); }

  const apply = (c, moves) => moves.reduce((x, m) => mul(x, MOVES[m]), c);
  const parse = s => s.trim().split(/\s+/).filter(Boolean).map(t => {
    const i = MOVE_NAMES.indexOf(t.replace('’', "'"));
    if (i < 0) throw new Error('Mouvement inconnu : ' + t);
    return i;
  });
  const format = ms => ms.map(m => MOVE_NAMES[m]).join(' ');
  const isSolved = c => c.cp.every((x, i) => x === i && !c.co[i]) && c.ep.every((x, i) => x === i && !c.eo[i]);

  function scramble(n = 25) {
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
  function randomState() {
    const shuffle = n => { const p = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; };
    const odd = p => p.reduce((s, x, i) => s ^ p.slice(i + 1).filter(y => y < x).length % 2, 0);
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

  function facelets(c) {
    const f = [];
    for (let i = 0; i < 6; i++) f[i * 9 + 4] = FACES[i];
    for (let i = 0; i < 8; i++) for (let n = 0; n < 3; n++) f[CORNER_FACELET[i][(n + c.co[i]) % 3]] = CORNER_COLOR[c.cp[i]][n];
    for (let i = 0; i < 12; i++) for (let n = 0; n < 2; n++) f[EDGE_FACELET[i][(n + c.eo[i]) % 2]] = EDGE_COLOR[c.ep[i]][n];
    return f.join('');
  }

  // Coordinates = projections of the state graph onto small graphs.
  function binom(n, k) { if (k > n) return 0; let r = 1; for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1); return Math.round(r); }
  function rank(p) { // Lehmer code
    let r = 0;
    for (let i = 0; i < p.length; i++) { let s = 0; for (let j = i + 1; j < p.length; j++) if (p[j] < p[i]) s++; r = r * (p.length - i) + s; }
    return r;
  }
  const coC = c => c.co.slice(0, 7).reduce((a, x) => a * 3 + x, 0);       // 3^7  = 2187
  const eoC = c => c.eo.slice(0, 11).reduce((a, x) => a * 2 + x, 0);      // 2^11 = 2048
  function sliceC(c) {                                                     // C(12,4) = 495
    let a = 0, x = 0;
    for (let j = 11; j >= 0; j--) if (c.ep[j] >= 8) a += binom(11 - j, ++x);
    return a;
  }
  const cpC = c => rank(c.cp);                                             // 8! = 40320
  const udC = c => rank(c.ep.slice(0, 8));                                 // 8! (valid in G1)
  const spC = c => rank(c.ep.slice(8).map(x => x - 8));                    // 4! = 24 (valid in G1)

  const ALL = [...Array(18).keys()];
  const P2 = [0, 1, 2, 9, 10, 11, 4, 7, 13, 16]; // U U2 U' D D2 D' R2 F2 L2 B2

  // Move table by BFS from solved: each coordinate value gets a representative cube.
  function moveTable(n, coord, moves) {
    const t = new Uint16Array(n * 18), seen = new Uint8Array(n), q = [solved()];
    seen[0] = 1;
    for (let i = 0; i < q.length; i++) {
      const x = coord(q[i]);
      for (const m of moves) {
        const d = mul(q[i], MOVES[m]), y = coord(d);
        t[x * 18 + m] = y;
        if (!seen[y]) { seen[y] = 1; q.push(d); }
      }
    }
    if (q.length !== n) throw new Error('move table: ' + q.length + ' / ' + n);
    return t;
  }

  // Pruning table = exact BFS distances in the product graph (a, b). Lower bound on the real distance.
  function pruneTable(na, ta, nb, tb, moves) {
    const N = na * nb, d = new Int8Array(N).fill(-1);
    d[0] = 0;
    for (let depth = 0, done = 1, grew = true; done < N && grew; depth++) {
      grew = false;
      for (let i = 0; i < N; i++) {
        if (d[i] !== depth) continue;
        const a = (i / nb) | 0, b = i % nb;
        for (const m of moves) {
          const j = ta[a * 18 + m] * nb + tb[b * 18 + m];
          if (d[j] < 0) { d[j] = depth + 1; done++; grew = true; }
        }
      }
    }
    return d;
  }

  let T = null;
  function init() {
    if (T) return T;
    const t0 = Date.now();
    const coM = moveTable(2187, coC, ALL), eoM = moveTable(2048, eoC, ALL), slM = moveTable(495, sliceC, ALL);
    const cpM = moveTable(40320, cpC, P2), udM = moveTable(40320, udC, P2), spM = moveTable(24, spC, P2);
    T = {
      coM, eoM, slM, cpM, udM, spM,
      p1a: pruneTable(2187, coM, 495, slM, ALL),
      p1b: pruneTable(2048, eoM, 495, slM, ALL),
      p2a: pruneTable(40320, cpM, 24, spM, P2),
      p2b: pruneTable(40320, udM, 24, spM, P2),
    };
    // Distance distributions of each projected graph: hist[d] = number of vertices at distance d.
    const hist = t => t.reduce((h, v) => (h[v] = (h[v] || 0) + 1, h), []);
    T.hist = { p1a: hist(T.p1a), p1b: hist(T.p1b), p2a: hist(T.p2a), p2b: hist(T.p2b) };
    T.ms = Date.now() - t0;
    return T;
  }

  const h1 = (co, eo, sl) => Math.max(T.p1a[co * 495 + sl], T.p1b[eo * 495 + sl]);
  const h2 = (cp, ud, sp) => Math.max(T.p2a[cp * 24 + sp], T.p2b[ud * 24 + sp]);
  const skip = (f, last) => f === last || f === last - 3;

  // IDA* on phase 1, then IDA* on phase 2 for each phase-1 path; keep the shortest total within the time budget.
  function solve(cube, budgetMs = 500) {
    init();
    const t0 = Date.now(), p1 = [];
    let best = null, nodes = 0;

    function dfs2(cp, ud, sp, d, last, path) {
      nodes++;
      if (d === 0) return cp === 0 && ud === 0 && sp === 0;
      if (h2(cp, ud, sp) > d) return false;
      for (const m of P2) {
        const f = (m / 3) | 0;
        if (skip(f, last)) continue;
        path.push(m);
        if (dfs2(T.cpM[cp * 18 + m], T.udM[ud * 18 + m], T.spM[sp * 18 + m], d - 1, f, path)) return true;
        path.pop();
      }
      return false;
    }

    function phase2(maxD) {
      const c = apply(cube, p1), cp = cpC(c), ud = udC(c), sp = spC(c), path = [];
      const last = p1.length ? (p1[p1.length - 1] / 3) | 0 : -1;
      for (let d = h2(cp, ud, sp); d <= maxD; d++) if (dfs2(cp, ud, sp, d, last, path)) return path;
      return null;
    }

    function dfs1(co, eo, sl, d, last) { // returns true = stop searching
      nodes++;
      if (d === 0) {
        if (co || eo || sl) return false;
        // Ending with a G1 move means a shorter phase 1 was already tried.
        if (p1.length && P2.includes(p1[p1.length - 1])) return false;
        const lim = best ? Math.min(best.length - p1.length - 1, 18) : 18;
        const p2 = lim >= 0 && phase2(lim);
        if (p2) best = { phase1: p1.slice(), phase2: p2, length: p1.length + p2.length };
        return best && Date.now() - t0 > budgetMs;
      }
      if (h1(co, eo, sl) > d) return false;
      for (const m of ALL) {
        const f = (m / 3) | 0;
        if (skip(f, last)) continue;
        p1.push(m);
        if (dfs1(T.coM[co * 18 + m], T.eoM[eo * 18 + m], T.slM[sl * 18 + m], d - 1, f)) return true;
        p1.pop();
      }
      return false;
    }

    const co = coC(cube), eo = eoC(cube), sl = sliceC(cube);
    for (let d = h1(co, eo, sl); d <= 20; d++) {
      if (best && d >= best.length) break;
      if (dfs1(co, eo, sl, d, -1)) break;
    }
    if (best) best.nodes = nodes;
    return best;
  }

  // Local graph around a state in the given phase's graph: coordinates, the two projected
  // distances a, b (h = max), and the h of each neighbour.
  function neighbourhood(c, phase) {
    init();
    const h = phase === 1 ? x => h1(coC(x), eoC(x), sliceC(x)) : x => h2(cpC(x), udC(x), spC(x));
    const k = phase === 1
      ? { co: coC(c), eo: eoC(c), sl: sliceC(c) }
      : { cp: cpC(c), ud: udC(c), sp: spC(c) };
    const [a, b] = phase === 1
      ? [T.p1a[k.co * 495 + k.sl], T.p1b[k.eo * 495 + k.sl]]
      : [T.p2a[k.cp * 24 + k.sp], T.p2b[k.ud * 24 + k.sp]];
    return { h: h(c), a, b, coords: k, neighbours: (phase === 1 ? ALL : P2).map(m => ({ m, h: h(mul(c, MOVES[m])) })) };
  }

  // Which graph a state lives in (1 = outside G1, 2 = inside G1) and its lower bound h there.
  function estimate(c) {
    init();
    const co = coC(c), eo = eoC(c), sl = sliceC(c);
    return co || eo || sl ? { phase: 1, h: h1(co, eo, sl) } : { phase: 2, h: h2(cpC(c), udC(c), spC(c)) };
  }

  const api = { MOVE_NAMES, solved, mul, apply, parse, format, isSolved, scramble, randomState, facelets, init, solve, neighbourhood, estimate };
  if (typeof module !== 'undefined') module.exports = api; else root.Cube = api;
})(this);
