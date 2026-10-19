import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { property, credit, scenes, readScene, sceneURL, direction, clampPitch, clampFov, normalizeYaw } from '../dist/visita-360/data.js';

// Lee ancho y alto de un JPEG desde su marcador SOF.
function jpegSize(bytes) {
  for (let i = 2; i < bytes.length;) {
    if (bytes[i] !== 0xff) { i++; continue; }
    const marker = bytes[i + 1], length = bytes.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
    i += 2 + length;
  }
  throw new Error('JPEG sin marcador SOF');
}
const near = (actual, expected) => actual.every((value, index) => Math.abs(value - expected[index]) < 1e-9);

test('every scene has equirectangular 2:1 panoramas, a preview and its source', () => {
  assert.ok(property.name.trim() && credit.author.trim() && credit.license.trim());
  assert.equal(new URL(credit.licenseUrl).protocol, 'https:');
  assert.equal(new Set(scenes.map(scene => scene.id)).size, scenes.length);
  for (const scene of scenes) {
    for (const file of [scene.src, scene.preview]) {
      const bytes = readFileSync(new URL(`../dist/visita-360/${file}`, import.meta.url)), { width, height } = jpegSize(bytes);
      assert.equal(width, height * 2, `${file}: ${width}×${height}`);
    }
    assert.equal(jpegSize(readFileSync(new URL(`../dist/visita-360/${scene.src}`, import.meta.url))).width, 4096, scene.id);
    assert.equal(new URL(scene.source).protocol, 'https:', scene.id);
  }
});
test('hotspots lead to existing scenes and every scene can be reached from the first', () => {
  for (const scene of scenes) {
    assert.ok(Math.abs(scene.start.yaw) <= 180 && Math.abs(scene.start.pitch) <= 85, scene.id);
    for (const spot of scene.hotspots) {
      assert.ok(scenes.some(item => item.id === spot.scene) && spot.scene !== scene.id, `${scene.id} → ${spot.scene}`);
      assert.ok(spot.label.trim() && Math.abs(spot.yaw) <= 180 && Math.abs(spot.pitch) <= 85, `${scene.id} → ${spot.scene}`);
    }
  }
  const reached = new Set([scenes[0].id]), queue = [scenes[0]];
  while (queue.length) for (const spot of queue.shift().hotspots) if (!reached.has(spot.scene)) { reached.add(spot.scene); queue.push(scenes.find(item => item.id === spot.scene)); }
  assert.equal(reached.size, scenes.length);
});
test('public links open the requested scene and fall back safely', () => {
  assert.equal(readScene('?escena=dormitorio').id, 'dormitorio');
  for (const bad of ['', '?escena=otra', '?escena=%3Cscript%3E', '?escena=__proto__']) assert.equal(readScene(bad).id, scenes[0].id, bad);
  const url = sceneURL('https://example.com/visita-360/?secreto=1#ancla', scenes[1]);
  assert.equal(url.search, `?escena=${scenes[1].id}`); assert.equal(url.hash, '');
});
test('view angles map to the panorama as the viewer draws it', () => {
  assert.ok(near(direction(0, 0), [-1, 0, 0]));
  assert.ok(near(direction(90, 0), [0, 0, -1]));
  assert.ok(near(direction(0, 90), [0, 1, 0]));
  for (const [yaw, pitch] of [[25, 0], [-113, 2], [55, -2]]) assert.ok(Math.abs(Math.hypot(...direction(yaw, pitch)) - 1) < 1e-9);
  assert.equal(clampPitch(120), 85); assert.equal(clampPitch(-120), -85);
  assert.equal(clampFov(10), 35); assert.equal(clampFov(200), 90);
  assert.equal(normalizeYaw(190), -170); assert.equal(normalizeYaw(-190), 170); assert.equal(normalizeYaw(720 + 30), 30);
});
