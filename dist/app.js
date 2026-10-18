import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const $ = id => document.getElementById(id);
const stage = $('stage');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rooms = [
  { id:'living', name:'Living', area:42, bounds:[-6,1,-1,5], center:[-2.5,2], eye:[-1.0,1.7,3.9], look:[-4,1.25,1.0], description:'Un espacio abierto para bajar el ritmo, conversar y compartir.', color:0xcbbca5 },
  { id:'kitchen', name:'Cocina', area:15, bounds:[1,6,-1,2], center:[3.5,.5], eye:[1.85,1.7,1.55], look:[4.9,1.3,-.35], description:'Una cocina integrada, con isla y luz natural para el día a día.', color:0xd9d3bd },
  { id:'dining', name:'Comedor', area:15, bounds:[1,6,2,5], center:[3.5,3.5], eye:[1.65,1.7,4.35], look:[4.6,1.1,3.1], description:'La mesa como punto de encuentro, junto a la salida al patio.', color:0xcbbca5 },
  { id:'bedroom', name:'Dormitorio principal', area:16, bounds:[-6,-2,-5,-1], center:[-4,-3], eye:[-2.8,1.7,-1.65], look:[-4.2,1.1,-4.4], description:'Texturas cálidas y un rincón tranquilo para descansar.', color:0xd4c5b2 },
  { id:'studio', name:'Segundo dormitorio', area:16, bounds:[-2,2,-5,-1], center:[0,-3], eye:[1.1,1.7,-1.65], look:[-.6,1.1,-4.3], description:'Un dormitorio flexible, con escritorio y lugar para tus ideas.', color:0xd4c5b2 },
  { id:'bath', name:'Baño', area:16, bounds:[2,6,-5,-1], center:[4,-3], eye:[2.85,1.7,-1.6], look:[4.7,1.15,-4.2], description:'Piedra clara, detalles simples y una amplia ducha.', color:0xc4c7bb },
  { id:'patio', name:'Patio y terraza', area:36, bounds:[-6,6,5,8], center:[0,6.5], eye:[3.9,1.7,7.25], look:[-2,1.3,5.9], description:'Un poco de verde y un lugar al aire libre para quedarse.', color:0xbba58b },
];
const phases = ['Cimientos y base','Muros y estructura','Aberturas y vidrios','Cubierta y terminaciones','Interiores y mobiliario','Jardín y detalles'];
const phaseStarts = [0,.16,.40,.55,.70,.88,1];
const state = { mode:'explore', view:'overview', room:null, roof:false, evening:false, progress:1, playing:false, hovered:null };
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(43, 1, .035, 160);
camera.position.set(17,17,22);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas:$('scene'), antialias:true, alpha:true, powerPreference:'high-performance'});
} catch (error) {
  $('loading').hidden=true;
  $('error-message').hidden=false;
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.22;
const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=.075;
controls.target.set(0,.4,1);
controls.minDistance=10;
controls.maxDistance=40;
controls.maxPolarAngle=Math.PI*.47;
controls.enablePan=false;
controls.rotateSpeed=.55;

const hemisphere=new THREE.HemisphereLight(0xf7f6e6,0x767d61,2.8);
scene.add(hemisphere);
const sun=new THREE.DirectionalLight(0xfff3da,3.5);
sun.position.set(-9,20,12);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:.5,far:60});
sun.shadow.bias=-.0004;
sun.shadow.normalBias=.025;
sun.shadow.radius=4;
scene.add(sun);
const fill=new THREE.DirectionalLight(0xdfe8f0,1.0);
fill.position.set(10,8,-10);
scene.add(fill);
const warmLights=[];

const groups=phases.map(()=>{const g=new THREE.Group();scene.add(g);return g;});
const materials={};
function material(color,roughness=.8, extra={}) {
  const key=JSON.stringify([color,roughness,extra]);
  return materials[key] ||= new THREE.MeshStandardMaterial({color,roughness,...extra});
}
const wallMat=material(0xf5efe2);
const stoneMat=material(0xd8d4c7);
const woodMat=material(0x9a7953);
const darkMat=material(0x364638);
const glassMat=material(0xc1d8d4,.16,{transparent:true,opacity:.24,depthWrite:false,side:THREE.DoubleSide});
function box(parent,w,h,d,x,y,z,mat) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof mat==='number'?material(mat):mat);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function cylinder(parent,r1,r2,h,x,y,z,mat,segments=20) {
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),typeof mat==='number'?material(mat):mat);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function sphere(parent,r,x,y,z,mat,sx=1,sy=1,sz=1) {
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),typeof mat==='number'?material(mat):mat);
  mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function rug(x,z,w,d,color) {return box(groups[4],w,.024,d,x,.205,z,material(color));}

// One shared model supplies the plan, the construction sequence and every interior.
const land = new THREE.Group();scene.add(land);
box(land,17.8,.34,18,0,-.38,1.25,0xb7bf9f);
box(land,17.9,.12,18.1,0,-.58,1.25,0xc4c6b2);
box(land,18,.08,18.2,0,-.68,1.25,0xdbd9c8);
const shadowGround=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.12}));
shadowGround.rotation.x=-Math.PI/2;shadowGround.position.y=-.725;shadowGround.receiveShadow=true;scene.add(shadowGround);
const blueprint=new THREE.Group();scene.add(blueprint);
for(const r of rooms.slice(0,6)){
  const [x1,x2,z1,z2]=r.bounds;
  const points=[[x1,-.19,z1],[x2,-.19,z1],[x2,-.19,z2],[x1,-.19,z2],[x1,-.19,z1]].map(p=>new THREE.Vector3(...p));
  blueprint.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x6c8265,transparent:true,opacity:.7})));
}
for(let i=-8;i<=8;i++){
  const mat=new THREE.LineBasicMaterial({color:0x8c9f7a,transparent:true,opacity:.13});
  blueprint.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,-.2,-7),new THREE.Vector3(i,-.2,9)]),mat));
  blueprint.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-8,-.2,i),new THREE.Vector3(8,-.2,i)]),mat));
}
box(groups[0],12.5,.25,10.5,0,-.05,0,0xd7d2bf);
box(groups[0],12.05,.13,10.05,0,.13,0,0xbfb49e);
box(groups[0],12.4,.19,3.35,0,.03,6.6,0xa88b67);

const hitPlanes=[];
for(const r of rooms){
  const [x1,x2,z1,z2]=r.bounds;
  box(groups[0],x2-x1-.06,.035,z2-z1-.06,(x1+x2)/2,.2,(z1+z2)/2,r.color);
  const hit=new THREE.Mesh(new THREE.PlaneGeometry(x2-x1-.1,z2-z1-.1),new THREE.MeshBasicMaterial({visible:false}));
  hit.rotation.x=-Math.PI/2;hit.position.set(...[r.center[0],.25,r.center[1]]);hit.userData.room=r;scene.add(hit);hitPlanes.push(hit);
}
// Fine floor joints bring scale to the architectural model.
for(let x=-5.8;x<6;x+=.32)box(groups[0],.009,.008,5.83,x,.224,2,0xb29d80);
for(let z=-4;z<0;z+=1)box(groups[0],3.85,.008,.012,4,.224,z,0xa6aca2);
for(let x=3;x<6;x+=1)box(groups[0],.012,.008,3.85,x,.224,-3,0xa6aca2);
for(let z=5.15;z<8.1;z+=.18)box(groups[0],12.1,.01,.01,0,.224,z,0x977958);

const outerWalls=new THREE.Group();groups[1].add(outerWalls);
const innerWalls=new THREE.Group();groups[1].add(innerWalls);
const glazing=new THREE.Group();groups[2].add(glazing);
const roof=new THREE.Group();groups[3].add(roof);
const trim=new THREE.Group();groups[3].add(trim);
const height=2.8, floor=.225;
function wall(parent,axis,fixed,start,end,holes=[]){
  const th=.16;
  function part(a,b,bottom,top){
    if(b-a<.001||top-bottom<.001)return;
    box(parent,axis==='x'?b-a:th,top-bottom,axis==='x'?th:b-a,axis==='x'?(a+b)/2:fixed,floor+(bottom+top)/2,axis==='x'?fixed:(a+b)/2,wallMat);
  }
  let cursor=start;
  for(const hole of holes){part(cursor,hole.a,0,height);part(hole.a,hole.b,0,hole.bottom);part(hole.a,hole.b,hole.top,height);cursor=hole.b;}
  part(cursor,end,0,height);
}
function windowOn(axis,fixed,start,end,bottom=.9,top=2.45){
  const middle=(start+end)/2;const w=end-start;const h=top-bottom;
  box(glazing,axis==='x'?w:.035,h,axis==='x'?.035:w,axis==='x'?middle:fixed,floor+(bottom+top)/2,axis==='x'?fixed:middle,glassMat);
  for(const pos of [start,middle,end])box(glazing,axis==='x'?.045:.07,h,axis==='x'?.07:.045,axis==='x'?pos:fixed,floor+(bottom+top)/2,axis==='x'?fixed:pos,darkMat);
  for(const y of [bottom,top])box(glazing,axis==='x'?w:.07,.045,axis==='x'?.07:w,axis==='x'?middle:fixed,floor+y,axis==='x'?fixed:middle,darkMat);
}
const rearWindows=[{a:-5.25,b:-2.75,bottom:.95,top:2.4},{a:-1.25,b:1.25,bottom:.95,top:2.4},{a:3.1,b:4.9,bottom:1.6,top:2.4}];
wall(outerWalls,'x',-5,-6,6,rearWindows);
rearWindows.forEach(w=>windowOn('x',-5,w.a,w.b,w.bottom,w.top));
wall(outerWalls,'z',-6,-5,5,[{a:.3,b:3.8,bottom:.55,top:2.5}]);
windowOn('z',-6,.3,3.8,.55,2.5);
wall(outerWalls,'z',6,-5,5,[{a:-.4,b:1.5,bottom:1.15,top:2.5},{a:2.5,b:4.4,bottom:.4,top:2.5}]);
windowOn('z',6,-.4,1.5,1.15,2.5);windowOn('z',6,2.5,4.4,.4,2.5);
wall(outerWalls,'x',5,-6,6,[{a:-5.3,b:5.3,bottom:0,top:2.5}]);
windowOn('x',5,-5.3,5.3,0,2.5);
for(let x=-3.5;x<=3.6;x+=1.8)box(glazing,.045,2.5,.07,x,1.475,5,darkMat);
wall(innerWalls,'x',-1,-6,6,[{a:-4.45,b:-3.45,bottom:0,top:2.25},{a:-.5,b:.5,bottom:0,top:2.25},{a:3.45,b:4.45,bottom:0,top:2.25}]);
wall(innerWalls,'z',-2,-5,-1);wall(innerWalls,'z',2,-5,-1);
// Door frames retain real openings in the same floor plan.
for(const x of [-3.95,0,3.95]){
  for(const dx of [-.52,.52])box(glazing,.055,2.28,.2,x+dx,floor+1.14,-1,woodMat);
  box(glazing,1.1,.055,.2,x,floor+2.28,-1,woodMat);
}
box(roof,12.5,.22,10.5,0,3.16,0,0xf2eddf);
box(roof,12.08,.04,10.08,0,3.29,0,0xd7d8cb);
for(const x of [-6.2,6.2])box(roof,.12,.15,10.55,x,3.34,0,wallMat);
for(const z of [-5.2,5.2])box(roof,12.5,.15,.12,0,3.34,z,wallMat);
for(const x of [-6.08,6.08])box(trim,.05,.1,10.1,x,3.04,0,0xc7beaa);
for(const z of [-5.08,5.08])box(trim,12.2,.1,.05,0,3.04,z,0xc7beaa);

// Living: sofa, armchair, textiles, media unit and a coffee table.
rug(-2.7,2.1,4.5,3.4,0xe3d9c5);
for(let z=.6;z<3.5;z+=.15)box(groups[4],4.28,.003,.018,-2.7,.225,z,0xd2c3ac);
box(groups[4],3.45,.37,1.05,-2.85,.47,.1,0xa4aa8b);
box(groups[4],3.6,.64,.24,-2.85,.75,-.39,0x8b9675);
for(const x of [-4.58,-1.12])box(groups[4],.22,.53,1.1,x,.67,.1,0x8b9675);
for(const x of [-3.95,-2.85,-1.75])box(groups[4],1.03,.16,.83,x,.73,.15,0xb8bea2);
for(const x of [-3.8,-2.1]){const pillow=box(groups[4],.5,.42,.14,x,.99,-.1,0xe0d8bf);pillow.rotation.z=x<-3?-.16:.2;}
const coffee=cylinder(groups[4],.7,.73,.09,-2.8,.68,2.1,woodMat,40);
cylinder(groups[4],.25,.32,.4,-2.8,.44,2.1,woodMat);
cylinder(groups[4],.18,.13,.12,-2.65,.79,2.1,0xb59a70);
box(groups[4],.38,.045,.27,-3.03,.76,2.07,0xece7d7);
box(groups[4],.87,.35,.95,-4.8,.48,2.8,0xc0ad8b);
box(groups[4],.9,.48,.18,-4.8,.8,3.25,0xb7a47e);
box(groups[4],.95,.22,2.9,.37,.34,2.1,woodMat);
box(groups[4],.09,1.3,2.15,.48,1.35,2.1,0x2e3730);
box(groups[4],.095,1.15,1.98,.42,1.35,2.1,0x425048);

// Kitchen: the island, worktops, appliances and stools.
box(groups[4],.67,.86,2.65,5.52,.66,.46,0xdad5c3);
box(groups[4],.76,.09,2.76,5.48,1.13,.46,stoneMat);
box(groups[4],3.35,.86,.65,3.95,.66,-.58,0xdad5c3);
box(groups[4],3.45,.09,.75,3.95,1.13,-.58,stoneMat);
for(const x of [2.55,3.65,4.75])box(groups[4],.012,.7,.02,x,.66,-.24,0xb0ad9b);
box(groups[4],2.0,.86,.8,3.4,.66,1.0,0x829174);
box(groups[4],2.14,.09,.94,3.4,1.13,1,stoneMat);
box(groups[4],.65,.035,.48,3.95,1.19,-.58,0x6b756c);
const faucet=new THREE.Mesh(new THREE.TorusGeometry(.14,.023,8,16,Math.PI),material(0x7b857b,.3));
faucet.position.set(3.95,1.4,-.77);groups[4].add(faucet);
box(groups[4],.61,.035,.5,5.48,1.19,.65,0x3b423a);
for(const z of [.52,.78])for(const x of [5.31,5.61])cylinder(groups[4],.095,.095,.008,x,1.214,z,0x747b6f);
box(groups[4],.8,1.9,.7,1.55,1.18,-.55,0xa4ada3);
box(groups[4],.012,1.85,.015,1.55,1.18,-.19,0x7d8b7f);
for(const x of [2.85,3.95]){cylinder(groups[4],.25,.25,.08,x,.8,1.9,woodMat);for(const dx of [-.16,.16])box(groups[4],.045,.55,.045,x+dx,.5,1.9,darkMat);}

// Dining table and six chairs.
box(groups[4],2.6,.11,1.3,3.65,1.02,3.6,woodMat);
for(const x of [2.55,4.75])for(const z of [3.1,4.1])box(groups[4],.08,.75,.08,x,.61,z,woodMat);
for(const x of [2.8,3.65,4.5])for(const z of [2.65,4.55]){
  box(groups[4],.6,.1,.55,x,.68,z,0xc8b68e);
  box(groups[4],.6,.5,.08,x,.93,z+(z<3?-.22:.22),0xa89972);
  for(const dx of [-.22,.22])for(const dz of [-.18,.18])box(groups[4],.04,.4,.04,x+dx,.43,z+dz,darkMat);
}
cylinder(groups[4],.15,.2,.32,3.65,1.23,3.6,0xe9e0cd);
for(const dx of [-.14,.12,0])sphere(groups[4],.15,3.65+dx,1.59,3.6+dx,0x849566,1,.6,1);

function bed(x,z,single=false){
  const width=single?1.2:1.85;
  rug(x,z+.2,width+.7,3.05,0xc3b9a0);
  box(groups[4],width+.12,.31,2.2,x,.4,z,woodMat);
  box(groups[4],width,.27,2.12,x,.68,z,0xf2eddf);
  box(groups[4],width,.09,1.2,x,.86,z+.43,single?0x9da78b:0xb8a58c);
  box(groups[4],width+.18,1.0,.13,x,.74,z-1.11,0xb29d7d);
  const count=single?1:2;
  for(let i=0;i<count;i++)box(groups[4],single?.85:.76,.13,.48,x+(count===1?0:(i===0?-.45:.45)),.88,z-.73,0xe7e2d2);
  for(const dx of single?[.92]:[-1.32,1.32]){
    box(groups[4],.53,.43,.52,x+dx,.43,z-.75,woodMat);
    cylinder(groups[4],.04,.08,.22,x+dx,.78,z-.75,0x9a8d70);
    cylinder(groups[4],.2,.25,.27,x+dx,1.01,z-.75,0xe4d3ac);
  }
}
bed(-4,-3.45);bed(-.6,-3.48,true);
box(groups[4],1.6,2.4,.52,-5.7,1.43,-2.1,0xc5b89c).rotation.y=Math.PI/2;
box(groups[4],1.5,.08,.65,.95,1.02,-2.15,woodMat);
for(const x of [.35,1.55])box(groups[4],.055,.77,.055,x,.6,-2.15,darkMat);
box(groups[4],.68,.04,.44,.9,1.1,-2.2,0x7b8878);
box(groups[4],.48,.48,.08,.9,1.33,-2.48,0x3c4940);
box(groups[4],.55,.09,.55,.9,.66,-1.45,0xa9b093);
box(groups[4],.55,.45,.08,.9,.9,-1.2,0xa9b093);
// Artwork hangs on solid side walls, clear of the bedroom windows.
for(const [x,rotation] of [[-5.88,Math.PI/2],[1.88,-Math.PI/2]]){
  const frame=new THREE.Group();frame.position.set(x,0,-3.25);frame.rotation.y=rotation;groups[4].add(frame);
  box(frame,.85,.95,.055,0,1.95,0,woodMat);
  box(frame,.72,.82,.06,0,1.95,.035,0xe5ddc8);
  const art=cylinder(frame,.23,.23,.012,0,1.96,.08,0xaab193,32);art.rotation.x=Math.PI/2;
}

// Bathroom: vanity, mirror, toilet and a glazed shower.
box(groups[4],1.6,.7,.7,3.13,.72,-4.48,woodMat);
box(groups[4],1.7,.07,.78,3.13,1.1,-4.48,stoneMat);
cylinder(groups[4],.3,.24,.12,3.13,1.2,-4.45,0xf3f1e6);
box(groups[4],.07,.32,.07,3.13,1.35,-4.73,0x7b8579);
box(groups[4],1.3,1.12,.05,3.13,1.95,-4.86,0x66796f);
box(groups[4],1.18,1.0,.055,3.13,1.95,-4.82,material(0xb6c9c5,.12,{metalness:.7}));
box(groups[4],1.5,.065,1.7,5.12,.27,-3.95,0xe5e4d9);
box(groups[4],.035,2.25,1.7,4.35,1.39,-3.95,glassMat);
box(groups[4],1.5,2.25,.035,5.12,1.39,-3.12,glassMat);
box(groups[4],.04,2.25,.04,4.35,1.39,-3.12,0x758479);
box(groups[4],.05,1.8,.05,5.4,1.48,-4.8,0x718174);
box(groups[4],.38,.04,.34,5.4,2.4,-4.58,0x718174);
cylinder(groups[4],.32,.23,.43,5.1,.46,-1.75,0xf2efe3);
sphere(groups[4],.33,5.1,.71,-1.75,0xf2efe3,1,.15,1.25);
box(groups[4],.61,.7,.21,5.1,.7,-2.15,0xf2efe3);

// Patio, landscaping and the freestanding pergola.
for(const x of [-5.7,5.7])for(const z of [5.4,7.8])box(groups[5],.11,2.9,.11,x,1.65,z,woodMat);
for(let x=-5.7;x<=5.71;x+=.7)box(groups[5],.08,.13,2.7,x,3.11,6.6,woodMat);
for(const z of [5.35,7.85])box(groups[5],11.55,.16,.12,0,3.03,z,woodMat);
box(groups[5],2.9,.36,.85,-2.6,.45,6.9,0xb9b498);
box(groups[5],3,.53,.15,-2.6,.75,7.28,0xa8ad8b);
for(const x of [-3.45,-2.5,-1.55])box(groups[5],.86,.12,.71,x,.7,6.85,0xd3cfb4);
cylinder(groups[5],.7,.7,.08,-2.5,.63,5.8,woodMat,36);
cylinder(groups[5],.16,.22,.34,-2.5,.42,5.8,woodMat);
for(const z of [6.0,7.1]){box(groups[5],1.4,.09,.65,2.8,.62,z,0xc4b28d);box(groups[5],1.4,.33,.08,2.8,.8,z+.29,woodMat);}

function plant(parent,x,z,scale=1,pot=true){
  if(pot)cylinder(parent,.22*scale,.16*scale,.4*scale,x,.23+.2*scale,z,0xa38b68);
  cylinder(parent,.025*scale,.035*scale,.65*scale,x,.25+.55*scale,z,0x7a7850,8);
  for(let i=0;i<7;i++){
    const a=i*2.4;const leaf=sphere(parent,.18*scale,x+Math.sin(a)*.19*scale,.55+(i%3)*.16*scale,z+Math.cos(a)*.19*scale,i%2?0x7f905a:0x607d50,.65,1.8,.65);
    leaf.rotation.z=Math.sin(a)*.55;leaf.rotation.x=Math.cos(a)*.55;
  }
}
plant(groups[4],-5.25,4.2,1.4);plant(groups[4],1.7,4.55,.8);plant(groups[4],5.2,-2.6,.65);plant(groups[4],-5.3,-1.6,.65);
plant(groups[5],-5.1,7.2,1.45);plant(groups[5],5.2,7.35,1.4);
for(const x of [-7.6,7.6]){
  box(groups[5],.8,.22,10,x,-.04,1,0x839460);
  for(let z=-3.7;z<6;z+=.7)sphere(groups[5],.4,x,.28,z,0x819458,1,.9,1);
}
function tree(x,z,scale=1){
  cylinder(groups[5],.11*scale,.16*scale,1.8*scale,x,.9*scale-.15,z,0x8e8360,10);
  for(let i=0;i<5;i++)sphere(groups[5],.75*scale,x+Math.sin(i*2.4)*.35*scale,(1.85+(i%2)*.35)*scale,z+Math.cos(i*2.4)*.35*scale,i%2?0x8b9e66:0x7b915a,1,1.15,1);
}
tree(-7.25,-5.5,1.15);tree(7.3,7.8,.95);
for(let z=-4.5;z<5;z+=1.25)box(groups[5],.6,.035,.8,6.8,-.18,z,0xd9d4bc);
for(const [x,z] of [[-4,1.5],[3.5,.5],[3.6,3.6],[-4,-3],[0,-3],[4,-3]]){
  const light=new THREE.PointLight(0xffdba3,0,7,2);light.position.set(x,2.5,z);scene.add(light);warmLights.push(light);
  cylinder(groups[4],.19,.27,.16,x,2.65,z,material(0xd4ba82,.65,{emissive:0x8c6e2f,emissiveIntensity:.25}));
}

const hoverMesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x8cac68,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide}));
hoverMesh.rotation.x=-Math.PI/2;hoverMesh.visible=false;scene.add(hoverMesh);
const labels=new Map();
for(const [index,r] of rooms.entries()){
  const button=document.createElement('button');button.className='room-item';button.dataset.room=r.id;button.setAttribute('aria-pressed','false');
  button.innerHTML=`<span class="room-number">${String(index+1).padStart(2,'0')}</span><span class="room-name">${r.name}</span><span class="room-area">${r.area} m²</span><span class="room-arrow" aria-hidden="true">↗</span>`;
  button.addEventListener('click',()=>enterRoom(r));$('room-list').append(button);
  const pin=document.createElement('button');pin.className='room-pin';pin.textContent=r.id==='bedroom'?'Dorm. principal':r.id==='studio'?'Dormitorio 2':r.name;pin.setAttribute('aria-label',`Entrar a ${r.name}`);pin.addEventListener('click',()=>enterRoom(r));
  pin.addEventListener('pointerenter',()=>highlight(r));pin.addEventListener('pointerleave',()=>highlight(null));$('room-labels').append(pin);labels.set(r.id,pin);
}
for(const [index,name] of phases.entries()){
  const li=document.createElement('li');const button=document.createElement('button');button.className='phase-button';button.innerHTML=`<span class="phase-number">${String(index+1).padStart(2,'0')}</span><span>${name}</span>`;
  button.addEventListener('click',()=>{stopPlayback();setBuildProgress(phaseStarts[index+1]);});li.append(button);$('phase-list').append(li);
}

let transition=null;
const eye=new THREE.Vector3(), look=new THREE.Vector3(), projected=new THREE.Vector3();
function flyTo(position,target,duration=1000,onDone=null){
  controls.enabled=false;
  transition={start:performance.now(),duration:reducedMotion?1:duration,from:camera.position.clone(),to:new THREE.Vector3(...position),targetFrom:controls.target.clone(),targetTo:new THREE.Vector3(...target),onDone};
}
function updateViewButtons(){
  for(const [id,active] of [['overview-button',state.view==='overview'],['plan-button',state.view==='plan'],['roof-button',state.roof]]){
    $(id).classList.toggle('active',active);$(id).setAttribute('aria-pressed',String(active));
  }
  $('roof-button').disabled=state.view==='interior'||state.view==='plan';
  stage.dataset.view=state.view;
}
function setView(view,instant=false){
  const wasInterior=state.view==='interior';
  state.view=view;state.room=null;delete stage.dataset.room;highlight(null);$('room-card').hidden=true;$('return-button').hidden=true;
  for(const item of $('room-list').children){item.classList.remove('active');item.setAttribute('aria-pressed','false');}
  controls.enableRotate=view!=='plan';controls.enableZoom=true;controls.minDistance=10;controls.maxDistance=42;controls.minPolarAngle=0;controls.maxPolarAngle=Math.PI*.47;controls.rotateSpeed=.55;
  controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;controls.touches.ONE=THREE.TOUCH.ROTATE;
  const mobile=stage.clientWidth<550;
  const pos=view==='plan'?[0,mobile?40:29,1.001]:mobile?[21,24,29]:[17,17,22];
  const done=()=>{controls.enabled=true;};
  if(wasInterior){outerWalls.visible=false;innerWalls.visible=false;glazing.visible=false;}
  const reveal=()=>{outerWalls.visible=true;innerWalls.visible=true;glazing.visible=true;done();};
  flyTo(pos,[0,.4,1],instant?1:1100,reveal);
  $('view-caption').textContent=view==='plan'?'PLANO DE LA PROPIEDAD':state.mode==='construction'?'CONSTRUCCIÓN POR ETAPAS':'MAQUETA INTERACTIVA';
  $('gesture-hint').innerHTML=view==='plan'?'<span aria-hidden="true">↗</span> Tocá un ambiente para entrar':'<span aria-hidden="true">↔</span> Arrastrá para girar · Acercá con la rueda';
  updateViewButtons();applyBuild();
}
function enterRoom(r){
  if(state.mode!=='explore')setMode('explore',false);
  stopPlayback();state.progress=1;state.room=r;state.view='interior';state.roof=false;highlight(null);
  // Hide walls during the flight; restore them after the camera reaches the room.
  outerWalls.visible=false;innerWalls.visible=false;glazing.visible=false;
  controls.enableRotate=true;controls.enableZoom=false;controls.minDistance=.01;controls.maxDistance=100;controls.minPolarAngle=.2;controls.maxPolarAngle=Math.PI-.2;controls.rotateSpeed=-.35;
  controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;controls.touches.ONE=THREE.TOUCH.ROTATE;
  const target=new THREE.Vector3(...r.look);const position=new THREE.Vector3(...r.eye);const gaze=target.sub(position).normalize().multiplyScalar(.015).add(position);
  flyTo(r.eye,gaze.toArray(),1200,()=>{outerWalls.visible=true;innerWalls.visible=true;glazing.visible=true;controls.enabled=true;applyBuild();});
  $('room-card-name').textContent=r.name;$('room-card-description').textContent=r.description;$('room-card-area').textContent=`${r.area} m² ${r.id==='patio'?'al aire libre':'de superficie ilustrativa'}`;
  $('room-card').hidden=false;$('return-button').hidden=false;$('view-caption').textContent='RECORRIDO INTERIOR';$('gesture-hint').innerHTML='<span aria-hidden="true">↔</span> Arrastrá para mirar a tu alrededor';
  for(const item of $('room-list').children){const active=item.dataset.room===r.id;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));}
  stage.dataset.room=r.id;updateViewButtons();applyBuild();
}
function setMode(mode,animate=true){
  stopPlayback();state.mode=mode;stage.dataset.mode=mode;
  for(const key of ['construction','explore']){const active=key===mode;$(`${key}-mode`).classList.toggle('active',active);$(`${key}-mode`).setAttribute('aria-pressed',String(active));}
  $('construction-panel').hidden=mode!=='construction';$('explore-panel').hidden=mode!=='explore';$('timeline').hidden=mode!=='construction';$('explore-footer').hidden=mode!=='explore';
  if(mode==='construction'){
    state.roof=true;setView('overview');setBuildProgress(0);if(animate&&!reducedMotion)startPlayback();
  }else{state.roof=false;state.progress=1;setView('overview');applyBuild();}
}
function phaseIndex(p){for(let i=0;i<6;i++)if(p<phaseStarts[i+1]-.000001)return i;return 5;}
function setBuildProgress(p){state.progress=Math.max(0,Math.min(1,p));applyBuild();}
function applyBuild(){
  const p=state.mode==='explore'?1:state.progress;
  for(let i=0;i<groups.length;i++){
    const amount=THREE.MathUtils.clamp((p-phaseStarts[i])/(phaseStarts[i+1]-phaseStarts[i]),0,1);
    const eased=1-Math.pow(1-amount,3);
    groups[i].visible=amount>.001;
    groups[i].scale.y=Math.max(.001,eased);
    groups[i].position.y=i===3?(1-eased)*2:0;
  }
  roof.visible=(state.view==='interior'&&!transition)||(state.roof&&state.view==='overview');
  blueprint.visible=p<.22;
  $('build-progress').value=String(Math.round(p*1000));$('progress-text').textContent=`${Math.round(p*100)}%`;
  $('phase-title').textContent=p>=1?'Casa terminada':p<=0?'Todo empieza con una idea':phases[phaseIndex(p)];
  for(const [i,button] of [...$('phase-list').querySelectorAll('button')].entries()){
    button.classList.toggle('active',i===phaseIndex(p));button.classList.toggle('done',p>=phaseStarts[i+1]-.000001);
    button.setAttribute('aria-pressed',String(i===phaseIndex(p)));button.querySelector('.phase-number').textContent=p>=phaseStarts[i+1]-.000001?'✓':String(i+1).padStart(2,'0');
  }
  stage.dataset.progress=String(Math.round(p*100));
}
function stopPlayback(){state.playing=false;$('play-button').textContent='▶';$('play-button').setAttribute('aria-label','Reproducir construcción');}
function startPlayback(){if(state.progress>=1)setBuildProgress(0);state.playing=true;$('play-button').textContent='Ⅱ';$('play-button').setAttribute('aria-label','Pausar construcción');}
function highlight(r){
  state.hovered=r;
  hoverMesh.visible=!!r&&state.mode==='explore'&&state.view!=='interior'&&!state.roof;
  if(r){const [x1,x2,z1,z2]=r.bounds;hoverMesh.scale.set(x2-x1-.15,z2-z1-.15,1);hoverMesh.position.set(r.center[0],.24,r.center[1]);}
  for(const [id,pin] of labels)pin.classList.toggle('hovered',r?.id===id);
  $('scene').style.cursor=hoverMesh.visible?'pointer':state.view==='plan'?'default':'grab';
}
function roomAt(event){
  if(state.mode!=='explore'||state.view==='interior'||state.roof||transition)return null;
  const rect=renderer.domElement.getBoundingClientRect();pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
  raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(hitPlanes,false)[0]?.object.userData.room||null;
}
let pointerStart=null;
renderer.domElement.addEventListener('pointerdown',e=>{pointerStart=[e.clientX,e.clientY];});
renderer.domElement.addEventListener('pointermove',e=>highlight(roomAt(e)));
renderer.domElement.addEventListener('pointerleave',()=>highlight(null));
renderer.domElement.addEventListener('pointerup',e=>{if(pointerStart&&Math.hypot(e.clientX-pointerStart[0],e.clientY-pointerStart[1])<6){const r=roomAt(e);if(r)enterRoom(r);}pointerStart=null;});
controls.addEventListener('start',()=>{if(transition){transition=null;controls.enabled=true;outerWalls.visible=true;innerWalls.visible=true;glazing.visible=true;}highlight(null);});

$('construction-mode').addEventListener('click',()=>setMode('construction'));
$('explore-mode').addEventListener('click',()=>setMode('explore'));
$('explore-cta').addEventListener('click',()=>setMode('explore'));
$('overview-button').addEventListener('click',()=>setView('overview'));
$('plan-button').addEventListener('click',()=>{state.roof=false;setView('plan');});
$('roof-button').addEventListener('click',()=>{state.roof=!state.roof;highlight(null);updateViewButtons();applyBuild();});
$('return-button').addEventListener('click',()=>setView('plan'));
$('reset-button').addEventListener('click',()=>{if(state.view==='interior'&&state.room)enterRoom(state.room);else setView(state.view);});
$('play-button').addEventListener('click',()=>state.playing?stopPlayback():startPlayback());
$('restart-button').addEventListener('click',()=>{setBuildProgress(0);startPlayback();});
$('build-progress').addEventListener('input',e=>{stopPlayback();setBuildProgress(Number(e.target.value)/1000);});
$('light-toggle').addEventListener('click',()=>{
  state.evening=!state.evening;stage.classList.toggle('evening',state.evening);$('light-toggle').setAttribute('aria-pressed',String(state.evening));$('light-label').textContent=state.evening?'Al atardecer':'Luz de día';
  hemisphere.intensity=state.evening?1.05:2.8;sun.intensity=state.evening?1.65:3.5;sun.color.set(state.evening?0xffb56c:0xfff3da);sun.position.set(state.evening?-18:-9,state.evening?8:20,12);fill.intensity=state.evening?.35:1;
  warmLights.forEach(light=>{light.intensity=state.evening?9:0;});renderer.toneMappingExposure=state.evening?1.0:1.22;
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.view==='interior'){$('return-button').click();$('plan-button').focus();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();stopPlayback();$('error-message').hidden=false;});
function resize(){const {width,height}=stage.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(stage);resize();

let last=performance.now();let ready=false;
function render(now){
  requestAnimationFrame(render);
  const dt=Math.min((now-last)/1000,.1);last=now;
  if(document.hidden)return;
  if(state.playing){setBuildProgress(state.progress+dt/22);if(state.progress>=1)stopPlayback();}
  if(transition){
    const t=Math.min((now-transition.start)/transition.duration,1);const smooth=t*t*(3-2*t);
    camera.position.lerpVectors(transition.from,transition.to,smooth);controls.target.lerpVectors(transition.targetFrom,transition.targetTo,smooth);camera.lookAt(controls.target);
    if(t>=1){const done=transition.onDone;transition=null;done?.();}
  }
  controls.update();
  if(state.view==='interior'&&state.room&&!transition){
    // Orbit a target a few millimeters from the eye: rotate the view in place.
    eye.set(...state.room.eye);const offset=camera.position.clone().sub(controls.target).normalize().multiplyScalar(.015);
    camera.position.copy(eye);controls.target.copy(eye).sub(offset);camera.lookAt(controls.target);
  }
  scene.updateMatrixWorld();camera.updateMatrixWorld();
  for(const r of rooms){
    const pin=labels.get(r.id);const show=state.mode==='explore'&&state.view!=='interior'&&!state.roof&&!transition;
    pin.hidden=!show;
    if(show){projected.set(r.center[0],.38,r.center[1]).project(camera);pin.style.left=`${(projected.x*.5+.5)*stage.clientWidth}px`;pin.style.top=`${(-projected.y*.5+.5)*stage.clientHeight}px`;pin.hidden=projected.z>1||projected.z< -1||Math.abs(projected.x)>.97||Math.abs(projected.y)>.95;}
  }
  const direction=new THREE.Vector3();camera.getWorldDirection(direction);$('compass').querySelector('svg').style.transform=`rotate(${Math.atan2(direction.x,-direction.z)*180/Math.PI}deg)`;
  renderer.render(scene,camera);
  if(!ready){ready=true;$('loading').hidden=true;stage.dataset.ready='true';}
}
setMode('explore',false);setView('overview',true);requestAnimationFrame(render);
