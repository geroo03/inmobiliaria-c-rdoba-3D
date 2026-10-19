import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rooms, photos, hotspots, photosFor, readView, viewURL, nextRoom, clampPan } from '../dist/visita-real/data.js';

test('all rooms have real local photographs with source and license', () => {
  assert.equal(new Set(photos.map(photo => photo.id)).size, 8);
  for (const room of rooms) {
    assert.ok(photosFor(room.id).length > 0);
    for (const photo of photosFor(room.id)) {
      const image = readFileSync(new URL(`../dist/visita-real/${photo.src}`, import.meta.url));
      assert.equal(image[0], 0xff); assert.equal(image[1], 0xd8);
      assert.ok(image.length > 10000);
      assert.equal(new URL(photo.source).hostname, 'commons.wikimedia.org');
      assert.equal(photo.author, 'Chris Olszewski'); assert.equal(photo.license, 'CC BY-SA 4.0');
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
