// 3D cube in plain CSS 3D: 26 black cubies, stickers from the facelets.
// The layer of a move is grouped so it can be outlined (hint) or animated (turn).
import { MOVE_NAMES, STICKER_3D, FACE_AXIS } from '../cube.js';
import { STICKER } from './format.js';

const U3 = 56; // cubie size in px
const NORMALS = [['0,0,1', 'rotateY(0deg)'], ['0,0,-1', 'rotateY(180deg)'], ['1,0,0', 'rotateY(90deg)'], ['-1,0,0', 'rotateY(-90deg)'], ['0,1,0', 'rotateX(90deg)'], ['0,-1,0', 'rotateX(-90deg)']];
// Camera that shows each face: U, F, R share the default view.
const CAMERA = { U: [-26, -36], R: [-26, -36], F: [-26, -36], L: [-26, 36], B: [-26, 144], D: [26, -36] };

export function createCube3d(scene, box) {
  const view = { x: -26, y: -36 };
  let timer = null, drag = null;
  const orient = () => { box.style.transform = `rotateX(${view.x}deg) rotateY(${view.y}deg)`; };

  // Drag (mouse or finger) to orbit.
  scene.onpointerdown = e => { drag = [e.clientX, e.clientY]; scene.setPointerCapture(e.pointerId); box.style.transition = 'none'; };
  scene.onpointerup = scene.onpointercancel = () => { drag = null; };
  scene.onpointermove = e => {
    if (!drag) return;
    view.y += (e.clientX - drag[0]) * .5;
    view.x = Math.max(-80, Math.min(80, view.x - (e.clientY - drag[1]) * .5));
    drag = [e.clientX, e.clientY];
    orient();
  };

  // Draw facelets f. With `move`, its layer is outlined; with `done` too, the layer turns and done() runs after.
  function draw(f, move, done) {
    clearTimeout(timer);
    const color = new Map(STICKER_3D.map((g, i) => [g.p.join() + '|' + g.n.join(), f[i]]));
    const a = move === undefined ? null : FACE_AXIS[MOVE_NAMES[move][0]];
    let fixed = '', layer = '';
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      if (!x && !y && !z) continue;
      const faces = NORMALS.map(([n, r]) => {
        const c = color.get(`${x},${y},${z}|${n}`);
        return `<div class="f" style="transform:${r} translateZ(${U3 / 2}px)">${c ? `<i style="background:${STICKER[c]}"></i>` : ''}</div>`;
      }).join('');
      const html = `<div class="cubie" style="transform:translate3d(${x * U3}px,${-y * U3}px,${z * U3}px)">${faces}</div>`;
      if (a && x * a[0] + y * a[1] + z * a[2] === 1) layer += html; else fixed += html;
    }
    if (a) { // turn the camera if the face about to move is hidden
      const o = new DOMMatrix(`rotateX(${view.x}deg) rotateY(${view.y}deg)`).transformPoint({ x: a[0], y: -a[1], z: a[2] });
      if (o.z < .3) [view.x, view.y] = CAMERA[MOVE_NAMES[move][0]];
    }
    box.style.transition = 'transform .4s';
    orient();
    box.innerHTML = fixed + `<div class="layer ${done ? '' : 'hint'}">${layer}</div>`;
    if (!done) return;
    // Clockwise seen from outside = rotate3d(+θ) about the outward axis in CSS coordinates (y down).
    const L = box.querySelector('.layer'), p = MOVE_NAMES[move].slice(1), deg = p === '2' ? 180 : p === "'" ? -90 : 90, ms = p === '2' ? 700 : 450;
    L.getBoundingClientRect();
    L.style.transition = `transform ${ms}ms ease-in-out`;
    L.style.transform = `rotate3d(${a[0]}, ${-a[1]}, ${a[2]}, ${deg}deg)`;
    timer = setTimeout(done, ms + 30);
  }

  return { draw };
}
