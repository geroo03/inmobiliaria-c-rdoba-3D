import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { createSurfaceMaterial, setWorldUVs } from '../scene-materials.js';
import { wallLayout, splitWall } from './units.js';

const cache=new Map();
export function mat(color,roughness=.75,extra={}){const key=JSON.stringify([color,roughness,extra]);if(!cache.has(key))cache.set(key,new THREE.MeshStandardMaterial({color,roughness,...extra}));return cache.get(key);}
const plaster=createSurfaceMaterial(0xf3efe5,'plaster');
const oak=createSurfaceMaterial(0xbca181,'wood',.55);
const limestone=createSurfaceMaterial(0xd5d1c5,'concrete',.75);
const terrazzo=createSurfaceMaterial(0xc4c5bf,'concrete',.6);
const bronze=mat(0x7e7665,.35,{metalness:.7});
const graphite=mat(0x343c3b,.45,{metalness:.4});
const glass=mat(0xc8dfe4,.12,{transparent:true,opacity:.13,depthWrite:false,metalness:.15,side:THREE.DoubleSide});
const fabric=color=>mat(color,.98);

export function box(parent,w,h,d,x,y,z,material,soft=0){
  const geometry=soft?new RoundedBoxGeometry(w,h,d,2,Math.min(soft,w/2,h/2,d/2)):new THREE.BoxGeometry(w,h,d);
  if(!soft)setWorldUVs(geometry,w,h,d);
  const mesh=new THREE.Mesh(geometry,typeof material==='number'?mat(material):material);mesh.position.set(x,y,z);mesh.castShadow=!mesh.material.transparent;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
export function cylinder(parent,rt,rb,h,x,y,z,material,segments=24){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),typeof material==='number'?mat(material):material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function sphere(parent,r,x,y,z,material,sx=1,sy=1,sz=1){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),typeof material==='number'?mat(material):material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function art(parent,x,y,z,w,h,rotation=0){
  const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rotation;parent.add(group);
  box(group,w,h,.04,0,0,0,oak);box(group,w-.06,h-.06,.045,0,0,.015,0xe9e2d4);
  const paint=mat(0x8f9987,.95);const disk=cylinder(group,w*.23,w*.23,.005,w*.1,.02,.045,paint);disk.rotation.x=Math.PI/2;
  box(group,w*.3,h*.39,.006,-w*.18,-h*.16,.05,0xb18f76);
}
function plant(parent,x,z,scale=1){
  cylinder(parent,.2*scale,.15*scale,.37*scale,x,.2*scale,z,0xb29e82);
  cylinder(parent,.018,.025,.7*scale,x,.7*scale,z,0x6a6551,8);
  for(let i=0;i<8;i++){const a=i*2.4;const leaf=sphere(parent,.17*scale,x+Math.sin(a)*.22*scale,.6*scale+i*.05,z+Math.cos(a)*.22*scale,0x647b55,.65,1.8,.4);leaf.rotation.z=Math.sin(a)*.75;leaf.rotation.y=a;}
}
function curtain(parent,x,z,height=2.7,width=.65){
  const cloth=mat(0xf2eee3,1,{side:THREE.DoubleSide});
  const geometry=new THREE.PlaneGeometry(width,height,20,1),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++)p.setZ(i,Math.cos((p.getX(i)/width+.5)*Math.PI*10)*.045);
  geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,cloth);mesh.position.set(x,height/2+.09,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}

export function createApartment(unit){
  const root=new THREE.Group(),ceilings=new THREE.Group(),obstacles=[];root.position.x=unit.offset;
  const half=unit.width/2,H=2.85;
  const block=(x,z,w,d)=>obstacles.push([unit.offset+x-w/2,unit.offset+x+w/2,z-d/2,z+d/2]);
  const furniture=(w,h,d,x,y,z,material,soft=0)=>{block(x,z,w,d);return box(root,w,h,d,x,y,z,material,soft);};
  box(root,unit.width,.2,12,0,-.1,-1,limestone);
  box(root,unit.width,.14,1.6,0,-.07,5.8,terrazzo);
  const floor=box(root,unit.width-.12,.035,11.88,0,.018,-1,oak);
  for(let x=-half+.15;x<half;x+=.22)box(root,.006,.002,11.82,x,.038,-1,0x9e876a);
  for(let row=0;row<7;row++)for(let x=-half+.15;x<half;x+=.44)box(root,.215,.002,.007,x,.04,-6.4+row*1.8+(Math.round((x+half)/.44)%2)*.7,0x9f896f);
  for(const r of unit.rooms.filter(r=>r.id==='bath')){const [x1,x2,z1,z2]=r.rect;box(root,x2-x1,.042,z2-z1,(x1+x2)/2,.024,(z1+z2)/2,terrazzo);for(let x=x1;x<x2;x+=.65)box(root,.007,.002,z2-z1,x,.048,(z1+z2)/2,0xa1a69f);}
  const walls=wallLayout(unit),segments=walls.flatMap(wall=>splitWall(wall));
  for(const s of segments){
    const horizontal=s.axis==='x',w=horizontal?s.end-s.start:.13,d=horizontal?.13:s.end-s.start,x=horizontal?(s.start+s.end)/2:s.fixed,z=horizontal?s.fixed:(s.start+s.end)/2;
    box(root,w,s.top-s.bottom,d,x,(s.bottom+s.top)/2,z,plaster);
    if(s.bottom<1.4&&s.top>.15)block(x,z,w,d);
    if(s.bottom===0)box(root,horizontal?w:.16,.085,horizontal?.16:d,x,.07,z,0xe3ded1);
  }
  // Front glazing: a real opening at x [-.6,.6] connects to the balcony.
  function window(axis,fixed,start,end,bottom,top){
    const horizontal=axis==='x',mid=(start+end)/2,w=end-start;
    box(root,horizontal?w:.025,top-bottom,horizontal?.025:w,horizontal?mid:fixed,(bottom+top)/2,horizontal?fixed:mid,glass);
    for(const q of [start,end])box(root,horizontal?.045:.065,top-bottom,horizontal?.065:.045,horizontal?q:fixed,(bottom+top)/2,horizontal?fixed:q,graphite);
    for(const y of [bottom,top])box(root,horizontal?w:.065,.045,horizontal?.065:w,horizontal?mid:fixed,y,horizontal?fixed:mid,graphite);
    block(horizontal?mid:fixed,horizontal?fixed:mid,horizontal?w:.03,horizontal?.03:w);
  }
  window('x',5,-half+.23,-.6,.04,2.55);window('x',5,.6,half-.23,.04,2.55);
  for(const hole of walls[1].holes.filter(h=>h.bottom>.5))window('x',-7,hole.a,hole.b,hole.bottom,hole.top);
  for(const hole of walls[3].holes)window('z',half,hole.a,hole.b,hole.bottom,hole.top);
  box(root,1.1,2.3,.08,0,1.15,-7,oak);block(0,-7,1.1,.08);
  box(root,.04,.28,.06,.38,1.05,-6.94,bronze);
  for(const wall of walls.slice(4))for(const hole of wall.holes){
    for(const edge of [hole.a,hole.b])box(root,wall.axis==='x'?.045:.16,2.3,wall.axis==='x'?.16:.045,wall.axis==='x'?edge:wall.fixed,1.15,wall.axis==='x'?wall.fixed:edge,oak);
    box(root,wall.axis==='x'?hole.b-hole.a:.16,.045,wall.axis==='x'?.16:hole.b-hole.a,wall.axis==='x'?(hole.a+hole.b)/2:wall.fixed,2.3,wall.axis==='x'?wall.fixed:(hole.a+hole.b)/2,oak);
  }
  for(const x of [-half+.45,half-.45])curtain(root,x,4.85,2.7,.65);
  cylinder(root,.025,.025,unit.width-.4,0,2.76,4.88,bronze).rotation.z=Math.PI/2;
  box(ceilings,unit.width+.08,.16,12.1,0,2.98,-1,plaster);root.add(ceilings);
  // Living room: low upholstered furniture and layered materials.
  const sofaX=-half*.55,sofaW=Math.min(2.55,half-.8);
  box(root,sofaW+.7,.025,3.25,sofaX,.075,2.25,0xddd5c4,.01);
  furniture(sofaW,.4,.96,sofaX,.37,1.25,fabric(unit.sofa),.09);
  for(const dx of [-sofaW/2+.17,sofaW/2-.17])for(const dz of [-.33,.33])box(root,.07,.13,.07,sofaX+dx,.105,1.25+dz,graphite);
  box(root,sofaW,.57,.2,sofaX,.67,.84,fabric(unit.sofa),.09);
  for(const x of [sofaX-sofaW/2+.12,sofaX+sofaW/2-.12])box(root,.23,.5,.98,x,.6,1.25,fabric(unit.sofa),.08);
  for(let i=0;i<2;i++){box(root,(sofaW-.5)/2,.17,.76,sofaX+(i?1:-1)*(sofaW-.5)/4,.63,1.3,fabric(0xe5dfcf),.07);const pillow=box(root,.48,.45,.16,sofaX+(i?-.55:.5),.98,1.02,fabric(i?0xc2ae93:0xf0ebdf),.075);pillow.rotation.z=i?-.16:.1;}
  cylinder(root,.5,.53,.09,sofaX,.49,2.6,limestone,40);cylinder(root,.25,.3,.4,sofaX,.26,2.6,oak);block(sofaX,2.6,1.05,1.05);
  box(root,.28,.04,.2,sofaX-.12,.56,2.55,0xa88d74);cylinder(root,.09,.07,.12,sofaX+.15,.6,2.7,0x9b9e87);
  furniture(.45,.38,1.7,-half+.3,.28,3.4,oak,.03);
  box(root,.055,.9,1.42,-half+.09,1.37,3.4,graphite);box(root,.06,.79,1.3,-half+.055,1.37,3.4,mat(0x253c41,.18,{metalness:.3}));
  plant(root,-half+.5,4.35,1.15);
  art(root,sofaX,1.8,.10,1.3,.78);
  // Dining set keeps the central route to the balcony clear.
  if(unit.bedrooms>1){
    const tx=half*.64,tz=3.25;
    furniture(1.5,.09,1.0,tx,.81,tz,oak,.04);
    for(const dx of [-.57,.57])for(const dz of [-.35,.35])box(root,.055,.73,.055,tx+dx,.4,tz+dz,graphite);
    for(const dz of [-.82,.82])for(const dx of [-.43,.43]){
      furniture(.48,.12,.46,tx+dx,.49,tz+dz,fabric(0xcbbda3),.04);
      box(root,.48,.45,.08,tx+dx,.71,tz+dz+Math.sign(dz)*.2,oak,.025);
      for(const sx of [-.16,.16])box(root,.035,.4,.035,tx+dx+sx,.23,tz+dz,graphite);
    }
    cylinder(root,.15,.19,.28,tx,.98,tz,0xb6ad93);plant(root,half-.4,4.4,.75);
  }else{
    const tx=2.15,tz=-1.75;cylinder(root,.64,.64,.08,tx,.8,tz,oak,40);cylinder(root,.2,.25,.73,tx,.41,tz,graphite);block(tx,tz,1.28,1.28);
    for(const dz of [-.9,.9]){furniture(.48,.1,.48,tx,.47,tz+dz,0xadb49c,.04);box(root,.48,.4,.07,tx,.7,tz+dz+Math.sign(dz)*.2,oak,.02);for(const dx of [-.17,.17])for(const oz of [-.17,.17])box(root,.035,.4,.035,tx+dx,.23,tz+dz+oz,graphite);}
  }
  // Bedrooms are fitted inside their actual plan rectangles.
  for(const room of unit.rooms.filter(room=>room.id.startsWith('bedroom'))){
    const [x1,x2,z1,z2]=room.rect,main=room.id==='bedroom',bw=main?1.5:1.15,bx=(x1+x2)/2,bz=z1+1.65;
    box(root,bw+.5,.025,2.9,bx,.07,bz+.3,0xcac5b5);
    furniture(bw+.1,.29,2.1,bx,.23,bz,oak,.035);
    box(root,bw,.25,2.02,bx,.49,bz,fabric(0xede8dc),.075);
    box(root,bw,.12,1.15,bx,.66,bz+.4,fabric(main?0xc4b69f:unit.accent),.045);
    box(root,bw+.15,1.05,.14,bx,.62,bz-1.08,fabric(0xc5b9a5),.05);
    for(const dx of main?[-.38,.38]:[0])box(root,main?.62:.8,.15,.4,bx+dx,.7,bz-.7,0xf0eadf,.075);
    const nx=bx+(x2-x1>3?bw/2+.4:-(bw/2+.22));
    box(root,.35,.4,.38,nx,.25,bz-.65,oak,.015);cylinder(root,.1,.13,.2,nx,.66,bz-.65,0xe1d0ad);
    if(room.id==='bedroom3')art(root,bx,1.85,z2-.08,1.1,.7,Math.PI);
    else art(root,main?x1+.08:x2-.08,1.85,z1+1,Math.min(1.1,x2-x1-.6),.7,main?Math.PI/2:-Math.PI/2);
    if(x2-x1>3.1){const wx=main?x1+.3:x2-.3;furniture(.5,2.5,1.4,wx,1.28,z2-.95,0xd4cbbb,.018);for(const z of [z2-1.3,z2-.6])box(root,.02,.3,.02,wx+(main?.26:-.26),1.3,z,bronze);}
    if(room.id==='bedroom3')curtain(root,x2-.18,z1+.35,2.7,.45).rotation.y=-Math.PI/2;
    else curtain(root,x1+.35,z1+.2,2.7,.45);
  }
  // Kitchen, including appliances, sink, cupboards and a clear circulation path.
  const kitchen=unit.rooms.find(r=>r.id==='kitchen'),kz=kitchen?kitchen.rect[2]+.4:.5,kx=half-1.05;
  furniture(1.75,.86,.62,kx,.47,kz,0xd3c9b7,.015);box(root,1.85,.055,.7,kx,.93,kz,limestone,.01);
  for(const x of [kx-.55,kx,kx+.55]){box(root,.012,.7,.012,x,.48,kz+.32,0xb8ad98);box(root,.22,.018,.025,x+.1,.78,kz+.34,bronze);}
  box(root,1.78,.6,.32,kx,2.13,kz-.13,0xded7c9,.015);box(root,1.8,.025,.38,kx,1.8,kz-.1,mat(0xe7d9b5,.5,{emissive:0xf9dc9e,emissiveIntensity:.4}));
  box(root,.49,.02,.4,kx+.4,.97,kz,graphite,.015);for(const x of [kx+.25,kx+.54])cylinder(root,.08,.08,.005,x,.984,kz,0x687074);
  box(root,.43,.02,.35,kx-.5,.97,kz,mat(0xa4ada8,.3,{metalness:.7}),.03);
  const faucet=new THREE.Mesh(new THREE.TorusGeometry(.11,.014,8,16,Math.PI),bronze);faucet.position.set(kx-.5,1.17,kz-.13);root.add(faucet);
  if(unit.bedrooms===3){furniture(1.65,.87,.66,kx,.47,1.65,0x8b9a8f,.015);box(root,1.75,.06,.74,kx,.94,1.65,limestone,.015);}
  else{const fridgeZ=kz+1.15;furniture(.65,1.95,.65,half-.4,1.02,fridgeZ,mat(0xb7bfba,.4,{metalness:.25}),.02);box(root,.02,.6,.03,half-.61,1.32,fridgeZ+.34,graphite);}
  // Bathroom: a compact shower, a vanity and a toilet, with an open doorway.
  const bathroom=unit.rooms.find(r=>r.id==='bath'),[b1,b2,t1,t2]=bathroom.rect;
  furniture(.65,.7,1,b1+.4,.48,-.65,oak,.02);box(root,.7,.06,1.06,b1+.4,.86,-.65,limestone,.015);
  cylinder(root,.22,.17,.11,b1+.4,.94,-.65,0xeae9e2);box(root,.035,.22,.035,b1+.15,1.07,-.65,bronze);
  box(root,.04,1,1,b1+.07,1.65,-.65,mat(0xbacbcb,.08,{metalness:.85}));
  const showerX=(b1+b2)/2;box(root,.9,.04,.7,showerX,.06,-1.55,0xe0dfd6);box(root,.9,2.05,.02,showerX,1.07,-1.17,glass);block(showerX,-1.45,.9,.72);
  cylinder(root,.22,.18,.38,b2-.35,.25,-.38,0xf2eee4);sphere(root,.23,b2-.35,.46,-.38,0xf2eee4,1,.2,1.25);block(b2-.35,-.38,.47,.5);
  // Balcony edge and furniture: bounded walkable deck, city below.
  for(const x of [-half+.06,half-.06]){
    box(root,.045,1.1,1.6,x,.6,5.8,graphite);box(root,.025,.9,1.55,x,.56,5.8,glass);
    block(x,5.8,.08,1.6);
  }
  box(root,unit.width,.045,.05,0,1.15,6.57,graphite);box(root,unit.width,.9,.025,0,.65,6.57,glass);block(0,6.57,unit.width,.07);
  for(let x=-half+.1;x<half;x+=1.2)box(root,.025,1.1,.04,x,.6,6.57,graphite);
  const chairX=half-1;
  furniture(.65,.09,.65,chairX,.47,5.78,oak,.04);box(root,.65,.45,.07,chairX,.73,6.05,0x939f87,.035);
  for(const dx of [-.24,.24])for(const dz of [-.24,.24])box(root,.04,.4,.04,chairX+dx,.23,5.78+dz,graphite);
  cylinder(root,.3,.3,.055,chairX-.85,.57,5.9,limestone);cylinder(root,.08,.12,.5,chairX-.85,.29,5.9,graphite);block(chairX-.85,5.9,.6,.6);
  plant(root,-half+.4,5.85,1);
  const lamps=[];
  for(const [x,z] of [[sofaX,2],[half*.6,3],[-half*.55,-4.5],[half*.6,-5],[0,-1]]){
    cylinder(root,.07,.07,.18,x,2.72,z,bronze);const disk=cylinder(root,.055,.055,.012,x,2.62,z,mat(0xffffe5,.3,{emissive:0xffefcc,emissiveIntensity:1.5}));disk.castShadow=false;
    const light=new THREE.PointLight(0xffe7c5,2.5,6,2);light.position.set(x,2.45,z);root.add(light);lamps.push(light);
  }
  // Only nearby light sources are enabled by the controller while walking.
  const hit=new THREE.Mesh(new THREE.PlaneGeometry(unit.width,13.6),new THREE.MeshBasicMaterial({visible:false}));hit.rotation.x=-Math.PI/2;hit.position.set(0,.09,-.2);hit.userData.unit=unit.id;root.add(hit);
  return {root,ceilings,obstacles,lamps,hit,walkBounds:[unit.offset-half+.22,unit.offset+half-.22,-6.75,6.34],floor};
}

export function createBuilding(units){
  const root=new THREE.Group(),lower=new THREE.Group(),common=new THREE.Group();root.add(lower,common);
  const total=25.3,front=6.7,back=-9.5;
  const facade=mat(0xd8d4c9,.8),cladding=mat(0x696e65,.85);
  for(let level=0;level<9;level++){
    const y=-27+level*3;
    box(lower,total,.22,16.2,0,y,-1.4,facade);
    box(lower,total-.3,2.8,.18,0,y+1.5,-7.12,facade);
    for(const unit of units){
      box(lower,unit.width-.2,2.65,.03,unit.offset,y+1.45,5.02,mat(0x96b0b5,.2,{metalness:.3}));
      for(const dx of [-unit.width/2+.15,0,unit.width/2-.15])box(lower,.08,2.8,.08,unit.offset+dx,y+1.5,5.05,graphite);
      box(lower,unit.width,.06,.06,unit.offset,y+1.2,front,graphite);
      box(lower,unit.width,.95,.02,unit.offset,y+.65,front,glass);
      box(lower,.22,2.8,12,unit.offset-unit.width/2,y+1.5,-1,facade);
      if(level%2===0)box(lower,.55,.35,.5,unit.offset+unit.width/2-.6,y+.3,6.1,0x778064);
    }
  }
  for(const x of [-12.65,12.65])box(lower,.25,27.2,16.2,x,-13.5,-1.4,facade);
  box(lower,6,27,2.8,0,-13.5,-9.4,cladding);
  box(common,total,.2,2.25,0,-.1,-8.2,limestone);
  box(common,total,.055,.05,0,1.12,-9.3,graphite);box(common,total,.9,.025,0,.6,-9.3,glass);
  for(const x of [-3.3,3.3])box(common,.18,2.85,2.8,x,1.425,-9.4,plaster);
  box(common,6.6,2.85,.18,0,1.425,-10.8,plaster);
  box(common,6.7,.18,3,0,2.94,-9.4,facade);
  for(const x of [-1.4,1.4]){
    box(common,1.45,2.3,.05,x,1.15,-10.68,mat(0x9baba9,.35,{metalness:.7}));box(common,.02,2.3,.07,x,1.15,-10.64,graphite);
    box(common,.1,.22,.03,x+.85,1.2,-10.6,bronze);
  }
  box(common,total,.065,.085,0,-.02,6.7,mat(0xa4bb8d,.4,{emissive:0x76926a,emissiveIntensity:.5}));
  return {root,lower,common};
}
