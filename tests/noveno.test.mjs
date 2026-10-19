import test from 'node:test';
import assert from 'node:assert/strict';
import { units, wallLayout, splitWall, readView } from '../dist/noveno/units.js';
import { canStand, moveWithCollisions } from '../dist/movement.js';

function obstaclesFor(unit){return wallLayout(unit).flatMap(wall=>splitWall(wall)).filter(part=>part.bottom<1.4&&part.top>.15).map(part=>part.axis==='x'?[part.start,part.end,part.fixed-.065,part.fixed+.065]:[part.fixed-.065,part.fixed+.065,part.start,part.end]);}
test('shared links select the requested apartment and tour',()=>{
  const view=readView('?unidad=9c&vista=recorrido');assert.equal(view.unit.id,'9c');assert.equal(view.view,'recorrido');
});
test('unknown or malformed public parameters have safe defaults',()=>{
  const view=readView('?unidad=other&vista=javascript:alert(1)');assert.equal(view.unit.id,'9b');assert.equal(view.view,'piso');
});
test('all apartment entry points are clear of structural walls',()=>{
  for(const unit of units){const obstacles=obstaclesFor(unit),bounds=[-unit.width/2+.22,unit.width/2-.22,-6.75,6.34];for(const room of unit.rooms)assert.ok(canStand(...room.eye,obstacles,.17,bounds),`${unit.label}/${room.id}`);}
});
test('bedroom and bathroom doors connect to the central circulation',()=>{
  for(const unit of units){
    const obstacles=obstaclesFor(unit),bounds=[-unit.width/2+.22,unit.width/2-.22,-6.75,6.34];
    for(const z of [-2.9,-1]){const end=moveWithCollisions({x:0,z},-1.35,0,obstacles,.17,bounds);assert.ok(end.x< -1.3,`${unit.label} left doorway ${z}`);}
    if(unit.bedrooms>=2){const z=(unit.bedrooms===2?-3:-3.5)-.75;assert.ok(moveWithCollisions({x:0,z},1.4,0,obstacles,.17,bounds).x>1.3);}
    if(unit.bedrooms===3)assert.ok(moveWithCollisions({x:0,z:-1},1.4,0,obstacles,.17,bounds).x>1.3);
  }
});
test('balcony facade has a floor-level opening in every apartment',()=>{
  for(const unit of units)assert.ok(moveWithCollisions({x:0,z:4.6},0,1.2,obstaclesFor(unit),.17,[-20,20,-8,7]).z>5.7);
});
test('apartments occupy separate footprints on the same floor',()=>{
  for(let i=1;i<units.length;i++)assert.ok(units[i-1].offset+units[i-1].width/2<units[i].offset-units[i].width/2);
});
