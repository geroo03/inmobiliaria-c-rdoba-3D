import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { property, plan, rooms, photos, hotspots, photosFor, readView, viewURL, nextRoom, clampPan, tourSummary } from '../dist/visita-real/data.js';

test('all rooms have local photographs with author, source and license', () => {
  assert.equal(new Set(photos.map(photo => photo.id)).size, photos.length);
  for (const photo of photos) assert.ok(rooms.some(room => room.id === photo.room), photo.id);
  for (const room of rooms) {
    assert.ok(photosFor(room.id).length > 0);
    for (const photo of photosFor(room.id)) {
      const image = readFileSync(new URL(`../dist/visita-real/${photo.src}`, import.meta.url));
      assert.equal(image[0], 0xff); assert.equal(image[1], 0xd8);
      assert.ok(image.length > 10000);
      assert.ok(photo.author.trim() && photo.license.trim(), photo.id);
      assert.equal(new URL(photo.source).protocol, 'https:'); assert.equal(new URL(photo.licenseUrl).protocol, 'https:');
    }
  }
});
test('the tour reaches every room, returns to the start, and hotspots resolve', () => {
  let room = rooms[0]; const reached = new Set();
  for (let i = 0; i < rooms.length; i++) { reached.add(room.id); room = nextRoom(room.id); }
  assert.equal(reached.size, rooms.length); assert.equal(room, rooms[0]);
  for (const [photo, points] of Object.entries(hotspots)) {
    assert.ok(photos.some(item => item.id === photo));
    for (const point of points) { assert.ok(rooms.some(item => item.id === point.room)); assert.ok(point.x > 0 && point.x < 100 && point.y > 0 && point.y < 100); }
  }
});
test('public links restore the room, exact photo and plan, without crossing rooms', () => {
  const state = readView('?ambiente=bano&foto=bano-ducha&vista=plano');
  const url = viewURL('https://example.com/project/visita-real/?secret=old#anchor', state.room, state.photo, state.mode);
  assert.deepEqual(readView(url.search), state); assert.equal(url.searchParams.has('secret'), false); assert.equal(url.hash, '');
  assert.equal(readView('?ambiente=living&foto=bano-ducha').photo.id, 'living');
  assert.equal(readView('?ambiente=%3Cscript%3E&vista=other').room.id, 'living');
  assert.equal(readView('?foto=__proto__').photo.id, 'living');
});
test('zoom panning cannot move the entire image outside the viewport', () => {
  assert.deepEqual(clampPan(999, -999, 800, 600, 800, 600, 1), { x: 0, y: 0 });
  assert.deepEqual(clampPan(999, -999, 800, 600, 800, 600, 2), { x: 400, y: -300 });
  assert.deepEqual(clampPan(50, 20, 300, 400, 800, 600, 1), { x: 0, y: 0 });
});
test('the plan drawing stays inside its 660 × 490 canvas', () => {
  assert.ok(plan.backdrop.includes('<rect'));
  for (const room of rooms) {
    const [x, y, width, height] = room.rect, [labelX, labelY] = room.point;
    assert.ok(x >= 0 && y >= 0 && x + width <= 660 && y + height <= 490, room.id);
    assert.ok(labelX > x && labelX < x + width && labelY > y && labelY < y + height, room.id);
    assert.ok(room.furniture.includes('<'), room.id);
  }
});
test('the viewer takes the property, counts and credits from the data', () => {
  assert.equal(tourSummary(), `${rooms.length} espacios · ${photos.length} fotografías`);
  const viewer = readFileSync(new URL('../dist/visita-real/app.js', import.meta.url), 'utf8');
  for (const fixed of [property.name, ...new Set(photos.map(photo => photo.author)), 'Brisbane', `/ ${String(photos.length).padStart(2, '0')}`, `de ${rooms.length} espacios`]) {
    assert.ok(!viewer.includes(fixed), `app.js no debería contener «${fixed}»`);
  }
});
