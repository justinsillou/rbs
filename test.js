// node test.js — self-check: move model, facelets, solver.
const assert = require('assert');
const C = require('./cube.js');

const s = C.solved();
assert.strictEqual(C.facelets(s), 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
// R moves the F right column up onto U.
const r = C.facelets(C.apply(s, C.parse('R')));
assert.deepStrictEqual([r[2], r[5], r[8]], ['F', 'F', 'F']);
// Each move has order 4, and a sexy move has order 6.
for (let m = 0; m < 18; m++) assert(C.isSolved(C.apply(s, [m, m, m, m])));
assert(C.isSolved(C.apply(s, C.parse("R U R' U' ".repeat(6)))));

// Colours -> cube round trip, and each broken invariant is detected.
for (let i = 0; i < 20; i++) {
  const c = C.randomState();
  assert.deepStrictEqual(C.fromFacelets(C.facelets(c)).cube, c);
}
const swap = (f, i, j) => { const a = [...f]; [a[i], a[j]] = [a[j], a[i]]; return a.join(''); };
const sf = C.facelets(s);
assert(/tordu/.test(C.fromFacelets(swap(swap(sf, 8, 9), 9, 20)).error));   // twist URF corner
assert(/retournée/.test(C.fromFacelets(swap(sf, 5, 10)).error));           // flip UR edge
assert(/échangées/.test(C.fromFacelets(swap(swap(sf, 5, 7), 10, 19)).error)); // swap UR and UF edges
assert(/9/.test(C.fromFacelets('X' + sf.slice(1)).error));

// 3D geometry: a quarter turn = rotation by -90° about the face's outward axis
// (clockwise seen from outside) must move each sticker where the model says.
const rot = (v, a) => { // Rodrigues with cos = 0, sin = -1: v' = a(a·v) - a × v
  const d = v[0] * a[0] + v[1] * a[1] + v[2] * a[2];
  const x = [a[1] * v[2] - a[2] * v[1], a[2] * v[0] - a[0] * v[2], a[0] * v[1] - a[1] * v[0]];
  return v.map((_, k) => a[k] * d - x[k]);
};
const key = ({ p, n }) => p.join() + '|' + n.join();
const where = new Map(C.STICKER_3D.map((g, i) => [key(g), i]));
assert.strictEqual(where.size, 54);
const rnd = C.randomState(), before = C.facelets(rnd);
for (let m = 0; m < 18; m += 3) {
  const a = C.FACE_AXIS[C.MOVE_NAMES[m]], after = C.facelets(C.apply(rnd, [m]));
  C.STICKER_3D.forEach((g, i) => {
    const inLayer = g.p[0] * a[0] + g.p[1] * a[1] + g.p[2] * a[2] === 1;
    const j = inLayer ? where.get(key({ p: rot(g.p, a), n: rot(g.n, a) })) : i;
    assert.strictEqual(after[j], before[i], `move ${C.MOVE_NAMES[m]} sticker ${i}`);
  });
}

let t = Date.now();
C.init();
console.log('tables:', Date.now() - t, 'ms');

let total = 0;
for (let i = 0; i < 20; i++) {
  const scr = C.apply(s, C.scramble(25));
  t = Date.now();
  const sol = C.solve(scr, 300);
  assert(C.isSolved(C.apply(scr, sol.phase1.concat(sol.phase2))), 'not solved');
  total += sol.length;
  console.log(`#${i} ${sol.length} moves (${sol.phase1.length}+${sol.phase2.length}) ${Date.now() - t} ms`);
}
assert(C.solve(s).length === 0);
// Uniform random states (WCA-style) are always solvable.
for (let i = 0; i < 5; i++) {
  const r = C.randomState(), sol = C.solve(r, 300);
  assert(C.isSolved(C.apply(r, sol.phase1.concat(sol.phase2))), 'random state not solved');
}
console.log('ok, avg', (total / 20).toFixed(1), 'moves');
