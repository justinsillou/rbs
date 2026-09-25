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
