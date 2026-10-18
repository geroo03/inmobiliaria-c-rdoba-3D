import * as THREE from 'three';
import { createSurfaceMaterial } from './scene-materials.js';

export const phases = ['Replanteo y excavación', 'Armaduras y cimientos', 'Estructura y contrapiso', 'Mampostería por hiladas', 'Losa y cubierta', 'Instalaciones y revoques', 'Pisos y aberturas', 'Equipamiento interior', 'Patio y jardín'];
export const phaseStarts = [0, .07, .19, .31, .49, .61, .73, .84, .93, 1];
export const phaseDescriptions = [
  'Se marca la distribución y se abren las zanjas de fundación.',
  'Las armaduras se colocan antes del hormigonado de los cimientos.',
  'Se levantan las columnas, las vigas y la base del piso.',
  'Los ladrillos suben hilada por hilada, dejando libres puertas y ventanas.',
  'El apuntalamiento sostiene el encofrado mientras se forma la cubierta.',
  'Se muestran cañerías y luego revoques. Ocultamos la cubierta para ver el interior.',
  'Se colocan los pisos, los marcos y los paños de vidrio.',
  'Llegan la cocina, los sanitarios, las luminarias y los muebles.',
  'La pérgola, la terraza y la vegetación completan la casa.'
];
export const constructionDuration = 48;
export function phaseIndex(p) {
  for (let i = 0; i < phases.length; i++) if (p < phaseStarts[i + 1]) return i;
  return phases.length - 1;
}

const amount = (p, start, end) => THREE.MathUtils.clamp((p - start) / (end - start), 0, 1);

export function createConstruction({ scene, groups, wallSegments, box, cylinder }) {
  const site = new THREE.Group(); scene.add(site);
  const trenches = new THREE.Group(), steel = new THREE.Group(), footings = new THREE.Group();
  const skeleton = new THREE.Group(), scaffold = new THREE.Group(), shores = new THREE.Group(), services = new THREE.Group();
  site.add(trenches, steel, footings, skeleton, scaffold, shores, services);
  const concrete = createSurfaceMaterial(0xc6c3b6, 'concrete');
  const soil = createSurfaceMaterial(0x987557, 'soil');
  const brickMat = createSurfaceMaterial(0xc47a50, 'brick');
  const rebar = new THREE.MeshStandardMaterial({ color:0x585c58, roughness:.72, metalness:.65 });
  const timber = createSurfaceMaterial(0xb29362, 'wood');
  const excavation = box(trenches, 12.8, .035, 10.8, 0, -.175, 0, soil);
  const axes = [
    ...[-5,-1,5].map(z => ({ axis:'x', fixed:z, start:-6, end:6 })),
    ...[-6,6].map(x => ({ axis:'z', fixed:x, start:-5, end:5 })),
    ...[-2,2].map(x => ({ axis:'z', fixed:x, start:-5, end:-1 }))
  ];
  for (const { axis, fixed, start, end } of axes) {
    const horizontal = axis === 'x', length = end - start, center = (start + end) / 2;
    box(trenches, horizontal ? length + .4 : .55, .018, horizontal ? .55 : length + .4, horizontal ? center : fixed, -.148, horizontal ? fixed : center, 0x594b38);
    box(footings, horizontal ? length + .25 : .4, .29, horizontal ? .4 : length + .25, horizontal ? center : fixed, -.01, horizontal ? fixed : center, concrete);
    for (const offset of [-.12,.12]) for (const y of [-.09,.1]) {
      box(steel, horizontal ? length : .022, .022, horizontal ? .022 : length, horizontal ? center : fixed + offset, y, horizontal ? fixed + offset : center, rebar);
    }
    for (let t = start; t <= end; t += .4) {
      for (const y of [-.09,.1]) box(steel, horizontal ? .014 : .26, .014, horizontal ? .26 : .014, horizontal ? t : fixed, y, horizontal ? fixed : t, rebar);
      for (const offset of [-.12,.12]) box(steel, .014, .2, .014, horizontal ? t : fixed + offset, .005, horizontal ? fixed + offset : t, rebar);
    }
    const beam = box(skeleton, horizontal ? length : .145, .19, horizontal ? .145 : length, horizontal ? center : fixed, 2.94, horizontal ? fixed : center, concrete);
    beam.userData.beam = true;
  }
  for (const z of [-5,-1,5]) for (const x of (z === 5 ? [-6,6] : [-6,-2,2,6])) {
    box(skeleton, .145, 2.8, .145, x, 1.625, z, concrete);
    for (const dx of [-.045,.045]) for (const dz of [-.045,.045]) box(steel, .014, 3.1, .014, x + dx, 1.4, z + dz, rebar);
  }
  // Visible temporary works give the construction its scale and order.
  for (let z = -4.8; z <= 4.8; z += 2.4) {
    for (const x of [-7.0,-6.35]) cylinder(scaffold, .025, .025, 3.4, x, 1.5, z, rebar, 8);
    for (const y of [1.3,2.65]) box(scaffold, .75, .06, 2.25, -6.68, y, z + .55, timber);
    box(scaffold, .025, .025, 2.4, -7, 2.9, z + 1.2, rebar);
  }
  for (const x of [-4,0,4]) for (const z of [-3,2]) {
    cylinder(shores, .035, .045, 2.7, x, 1.58, z, rebar, 8);
    box(shores, .65, .08, .2, x, 2.96, z, timber);
  }
  const formwork = box(shores, 12.1, .07, 10.1, 0, 3.015, 0, timber);
  formwork.userData.formwork = true;
  for (const x of [2.75,3.0,5.55]) {
    const pipeColor = x === 3 ? 0xbd6151 : 0x487c91;
    box(services, .035, 1.9, .035, x, 1.18, -.88, pipeColor);
    box(services, .035, .035, 3.7, x, .27, -2.75, pipeColor);
    box(services, .035, 1.2, .035, x, .8, -4.6, pipeColor);
  }
  for (const x of [-5.86,-2.1,1.88]) {
    box(services, .035, 2.3, .035, x, 1.4, -2.2, 0xd4a04e);
    box(services, .035, .035, 2.6, x, 2.55, -3.4, 0xd4a04e);
  }
  const piles = new THREE.Group(); site.add(piles);
  for (let i = 0; i < 3; i++) {
    const pile = new THREE.Mesh(new THREE.SphereGeometry(.65, 12, 6), soil);
    pile.scale.set(.9,.4,1.2); pile.position.set(6.9,.03,-4 + i * 1.3); pile.castShadow = true; piles.add(pile);
  }
  // Individual staggered bricks, clipped to the very same door/window openings.
  const bricks = [];
  for (const segment of wallSegments) {
    for (let row = 0; row < 14; row++) {
      const bottom = Math.max(segment.bottom, row * .2), top = Math.min(segment.top, row * .2 + .19);
      if (top - bottom < .015) continue;
      const offset = row % 2 ? .2 : 0;
      for (let t = Math.floor(segment.start / .4) * .4 - offset; t < segment.end; t += .4) {
        const left = Math.max(segment.start, t + .008), right = Math.min(segment.end, t + .39);
        if (right - left < .015) continue;
        const horizontal = segment.axis === 'x';
        bricks.push({ row, x:horizontal ? (left + right) / 2 : segment.fixed, y:.225 + (top + bottom) / 2, z:horizontal ? segment.fixed : (left + right) / 2, w:horizontal ? right - left : .145, h:top - bottom, d:horizontal ? .145 : right - left });
      }
    }
  }
  bricks.sort((a,b) => a.row - b.row || a.z - b.z || a.x - b.x);
  const masonry = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1), brickMat, bricks.length);
  const dummy = new THREE.Object3D(), tint = new THREE.Color();
  bricks.forEach((brick,i) => {
    dummy.position.set(brick.x,brick.y,brick.z); dummy.scale.set(brick.w,brick.h,brick.d); dummy.updateMatrix();
    masonry.setMatrixAt(i,dummy.matrix); tint.setHSL(.055 + (i % 7) * .003, .25, .72 + (i % 5) * .04); masonry.setColorAt(i,tint);
  });
  masonry.castShadow = masonry.receiveShadow = true; masonry.instanceMatrix.needsUpdate = true; masonry.instanceColor.needsUpdate = true;
  masonry.computeBoundingSphere(); scene.add(masonry);
  const layingBrick = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), brickMat); layingBrick.castShadow = true; scene.add(layingBrick);
  const floorParts = groups[0].children.slice(3);
  const original = new WeakMap();
  function reveal(parts, t, grow = false) {
    parts.forEach((mesh,i) => {
      if (!original.has(mesh)) original.set(mesh,{ y:mesh.position.y, scale:mesh.scale.y });
      const initial = original.get(mesh), local = THREE.MathUtils.clamp(t * (parts.length + 2) - i,0,1);
      mesh.visible = local > 0;
      mesh.scale.y = initial.scale * (grow ? Math.max(.001,local) : 1);
      const height = mesh.geometry?.parameters?.height || 0;
      mesh.position.y = initial.y - (grow ? height * (1 - local) / 2 : 0);
    });
  }
  const columns = skeleton.children.filter(mesh => !mesh.userData.beam);
  const beams = skeleton.children.filter(mesh => mesh.userData.beam);
  return {
    update(p, exploring) {
      site.visible = !exploring && p > 0 && p < .995;
      trenches.visible = p < .32; excavation.visible = p > .01;
      reveal(trenches.children, amount(p,0,.07));
      steel.visible = p >= .07 && p < .31; reveal(steel.children, amount(p,.07,.13));
      footings.visible = p >= .13; reveal(footings.children, amount(p,.13,.19), true);
      skeleton.visible = p >= .19 && p < .74;
      reveal(columns, amount(p,.19,.255), true); reveal(beams, amount(p,.255,.3));
      scaffold.visible = p >= .29 && p < .79;
      shores.visible = p >= .49 && p < .65; formwork.visible = p >= .51;
      services.visible = p >= .61 && p < .72; reveal(services.children, amount(p,.61,.65));
      piles.visible = p >= .035 && p < .94;
      const build = amount(p,.31,.49) * bricks.length;
      masonry.count = Math.floor(build); masonry.visible = !exploring && p >= .31 && p < .735;
      layingBrick.visible = masonry.visible && build > 0 && masonry.count < bricks.length;
      if (layingBrick.visible) {
        const brick = bricks[masonry.count]; layingBrick.scale.set(brick.w,brick.h,brick.d);
        layingBrick.position.set(brick.x,brick.y + (1 - (build % 1)) * .35,brick.z);
      }
      groups.forEach(group => { group.visible = true; group.scale.set(1,1,1); group.position.y = 0; });
      reveal(groups[0].children.slice(0,2), amount(p,.25,.31), true);
      reveal([groups[0].children[2]], amount(p,.93,.945), true);
      reveal(floorParts.filter(mesh => mesh.position.z < 5), amount(p,.73,.785));
      reveal(floorParts.filter(mesh => mesh.position.z >= 5), amount(p,.935,.955));
      reveal(wallSegments.map(segment => segment.mesh), amount(p,.65,.73));
      groups[2].visible = p >= .785; reveal(groups[2].children[0].children, amount(p,.785,.84));
      groups[3].visible = p >= .52;
      reveal(groups[3].children[0].children, amount(p,.52,.61), true);
      groups[3].children[1].visible = p >= .80;
      reveal(groups[4].children, amount(p,.84,.93));
      reveal(groups[5].children, amount(p,.945,1));
      return { bricks:masonry.visible ? masonry.count : 0, roofCutaway:!exploring && p >= .61 && p < .975 };
    }
  };
}
