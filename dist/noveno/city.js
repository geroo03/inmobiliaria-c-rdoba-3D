import * as THREE from 'three';
import { box, cylinder, mat } from './model.js';

export function createCity(){
  const root=new THREE.Group(),lights=[];
  let seed=9003;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#c7c9c4';ctx.fillRect(0,0,128,256);
  for(let row=0;row<8;row++)for(let col=0;col<4;col++){
    ctx.fillStyle=random()>.2?'#718c99':'#b0b9b6';ctx.fillRect(col*32+5,row*32+6,21,19);
    ctx.fillStyle='#d7d7cf';ctx.fillRect(col*32+14,row*32+6,2,20);ctx.fillRect(col*32+4,row*32+25,23,2);
    if(random()>.8){ctx.fillStyle='#bac4c3';ctx.fillRect(col*32+6,row*32+7,7,17);}
  }
  const facade=new THREE.CanvasTexture(canvas);facade.colorSpace=THREE.SRGBColorSpace;facade.wrapS=facade.wrapT=THREE.RepeatWrapping;facade.anisotropy=4;
  const roof=mat(0xb1b5b1,.9),pavement=mat(0xbbbcb5,.95),road=mat(0x696e70,1);
  box(root,1100,.4,1100,0,-27.5,0,0xcbd0c5);
  box(root,32,.2,22,0,-27.12,-1,0xaab3a7);
  box(root,800,.03,12,0,-27.26,18,road);
  for(const z of [10.5,25.5])box(root,800,.06,2.8,0,-27.2,z,pavement);
  for(const x of [-26,29]){box(root,10,.03,700,x,-27.25,0,road);for(const dx of [-6,6])box(root,2,.04,700,x+dx,-27.2,0,pavement);}
  for(let x=-140;x<140;x+=8)box(root,3,.01,.15,x,-27.23,18,0xdedcc7);
  for(const x of [-18,20])for(let z=13;z<23;z+=1.2)box(root,2.8,.01,.5,x,-27.22,z,0xe7e5d9);
  const tree=(x,z,size)=>{
    cylinder(root,.12,.18,2.8,x,-25.8,z,0x756957,8);
    const crown=new THREE.Mesh(new THREE.SphereGeometry(size,12,10),mat(0x728767));crown.position.set(x,-23.5,z);crown.scale.set(1,1.2,1);crown.castShadow=true;root.add(crown);
  };
  for(let x=-100;x<=100;x+=8){if(Math.abs(x+26)>5&&Math.abs(x-29)>5){tree(x,27,1.5);tree(x,8.6,1.3);}}
  // A small public square makes the downward view from the ninth floor legible.
  box(root,32,.09,25,2,-27.19,46,0x859879);
  for(let i=0;i<15;i++)tree(-11+random()*26,36+random()*20,1.2+random());
  box(root,2,.1,25,2,-27.12,46,0xc7c3b1);box(root,32,.1,2,2,-27.11,46,0xc7c3b1);
  const buildings=[];
  for(let row=-3;row<6;row++)for(let col=-5;col<=5;col++){
    const x=col*28+(random()-.5)*5,z=row*30+48;
    if(Math.abs(x)<19&&z<65&&z>-35)continue;
    if(Math.abs(x+26)<7||Math.abs(x-29)<7)continue;
    if(Math.abs(z-18)<12)continue;
    const w=10+random()*9,d=10+random()*9,h=8+random()*26;
    const tex=facade.clone();tex.repeat.set(Math.max(1,w/12),Math.max(1,h/24));tex.needsUpdate=true;
    const wall=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.12,.03+random()*.04,.65+random()*.25),map:tex,roughness:.72});
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[wall,wall,roof,roof,wall,wall]);mesh.position.set(x,-27+h/2,z);mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);buildings.push(mesh);
    box(root,w+.15,.25,d+.15,x,-27+h,z,roof);
    box(root,w*.28,1.1,d*.24,x+w*.2,-27+h+.6,z,0x999f9a);
    if(random()>.5)cylinder(root,1,1,1.5,x-w*.25,-27+h+.8,z-d*.2,0xb1b6ae,12);
  }
  for(let i=0;i<20;i++){
    const x=-110+i*11,z=i%2?15.2:21,color=[0xf0efe7,0x747b80,0xc1b29e,0x8e9ba0][i%4];
    box(root,3.3,.6,1.55,x,-26.8,z,color,.12);box(root,1.9,.5,1.42,x,-26.27,z,mat(0x7d949d,.23),.09);
    for(const dx of [-1,1])for(const dz of [-.75,.75]){const wheel=cylinder(root,.28,.28,.16,x+dx,-26.95,z+dz,0x343a3d,12);wheel.rotation.x=Math.PI/2;}
  }
  for(let x=-80;x<90;x+=18){cylinder(root,.04,.06,5,x,-24.7,24,0x5d6c68,8);const bulb=box(root,.5,.08,.3,x,-22.18,24,mat(0xe6e1c7,.5,{emissive:0xffdaa0,emissiveIntensity:.3}));lights.push(bulb);}
  // The skyline is invented; it is not a panorama of a real address.
  for(let i=0;i<18;i++){
    const hill=new THREE.Mesh(new THREE.ConeGeometry(30+random()*40,15+random()*35,6),mat(0xa2b3b1,1));hill.position.set(-400+i*48,-27,330+random()*80);hill.scale.z=.55;root.add(hill);
  }
  return {root,lights};
}
