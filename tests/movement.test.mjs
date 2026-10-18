import test from 'node:test';
import assert from 'node:assert/strict';
import { canStand, moveWithCollisions } from '../dist/movement.js';

const wallWithDoor = [[-3,-.5,-.08,.08],[.5,3,-.08,.08]];
const bounds = [-10,10,-10,10];
test('passes through an open one-metre doorway', () => {
  const end = moveWithCollisions({ x:0,z:1 },0,-2,wallWithDoor,.17,bounds);
  assert.ok(Math.abs(end.z + 1) < .001);
});
test('cannot tunnel through a wall, even in a long movement', () => {
  const end = moveWithCollisions({ x:1,z:2 },0,-6,wallWithDoor,.17,bounds);
  assert.ok(end.z >= .25 && end.z < .35);
});
test('slides along a wall while moving diagonally', () => {
  const end = moveWithCollisions({ x:1,z:1 },1,-2,wallWithDoor,.17,bounds);
  assert.ok(end.x > 1.95 && end.z >= .25);
});
test('the body radius keeps the camera away from a doorway jamb', () => {
  assert.equal(canStand(.4,0,wallWithDoor,.17,bounds),false);
  assert.equal(canStand(.3,0,wallWithDoor,.17,bounds),true);
});
test('large furniture blocks movement', () => {
  const end = moveWithCollisions({ x:0,z:2 },0,-3,[[-1,1,-1,1]],.17,bounds);
  assert.ok(end.z >= 1.17);
});
test('the property boundary prevents leaving the model', () => {
  const end = moveWithCollisions({ x:5.5,z:7.5 },3,3,[]);
  assert.ok(end.x <= 5.75 && end.z <= 7.8);
});
test('a return through the same doorway is possible', () => {
  const end = moveWithCollisions({ x:0,z:-1 },0,2,wallWithDoor,.17,bounds);
  assert.ok(Math.abs(end.z - 1) < .001);
});
