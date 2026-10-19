// Fictional apartments. Areas are schematic gross areas, not a survey.
export const units = [
  { id:'9a', label:'9A', name:'Un lugar para vos', bedrooms:1, width:6.4, offset:-9.3, covered:76.8, balcony:10.2, color:'#a0ad91', accent:0x8c9c81, sofa:0xc8c2ad, description:'Un dormitorio, cocina independiente y un living que se abre a un balcón corrido.', rooms:[
    { id:'bedroom', name:'Dormitorio', rect:[-3.2,-.75,-7,-2], eye:[-1.35,-2.65], look:[-2,-5] },
    { id:'bath', name:'Baño', rect:[-3.2,-.75,-2,0], eye:[-1.35,-.8], look:[-2.7,-1.1] },
    { id:'kitchen', name:'Cocina', rect:[.75,3.2,-7,-3.5], eye:[1.3,-4.3], look:[2.65,-6.2] },
    { id:'dining', name:'Comedor', rect:[.75,3.2,-3.5,0], eye:[1,-.7], look:[2.3,-2.2] },
    { id:'living', name:'Living', rect:[-3.2,3.2,0,5], eye:[0,3.7], look:[-2,1] },
    { id:'balcony', name:'Balcón', rect:[-3.2,3.2,5,6.6], eye:[0,5.8], look:[1,35] }
  ] },
  { id:'9b', label:'9B', name:'Espacio para compartir', bedrooms:2, width:8, offset:-1.8, covered:96, balcony:12.8, color:'#bfa387', accent:0xaf9071, sofa:0xadae9c, description:'Dos dormitorios, cocina integrada y un estar amplio para vivir y recibir.', rooms:[
    { id:'bedroom', name:'Dormitorio principal', rect:[-4,-.75,-7,-2], eye:[-1.4,-2.65], look:[-2.5,-5.4] },
    { id:'bedroom2', name:'Segundo dormitorio', rect:[.75,4,-7,-3], eye:[1.35,-3.65], look:[2.6,-5.5] },
    { id:'bath', name:'Baño', rect:[-4,-.75,-2,0], eye:[-1.4,-.8], look:[-3.3,-1] },
    { id:'kitchen', name:'Cocina', rect:[.75,4,-3,0], eye:[1.35,-.6], look:[3.3,-2] },
    { id:'living', name:'Living y comedor', rect:[-4,4,0,5], eye:[0,3.7], look:[-2,1] },
    { id:'balcony', name:'Balcón', rect:[-4,4,5,6.6], eye:[0,5.8], look:[1,35] }
  ] },
  { id:'9c', label:'9C', name:'Una casa en las alturas', bedrooms:3, width:10, offset:7.5, covered:120, balcony:16, color:'#8b9eaa', accent:0x7d96a6, sofa:0xb0b9be, description:'Tres dormitorios, cocina con isla y un balcón generoso con la ciudad de fondo.', rooms:[
    { id:'bedroom', name:'Dormitorio principal', rect:[-5,-.75,-7,-2], eye:[-1.45,-2.7], look:[-3,-5.5] },
    { id:'bedroom2', name:'Segundo dormitorio', rect:[.75,5,-7,-3.5], eye:[1.4,-4.1], look:[3,-5.7] },
    { id:'bedroom3', name:'Tercer dormitorio', rect:[.75,5,-3.5,0], eye:[1.4,-.65], look:[3,-2] },
    { id:'bath', name:'Baño', rect:[-5,-.75,-2,0], eye:[-1.4,-.8], look:[-3.8,-1] },
    { id:'living', name:'Living y cocina', rect:[-5,5,0,5], eye:[0,3.7], look:[-2.5,1] },
    { id:'balcony', name:'Balcón', rect:[-5,5,5,6.6], eye:[0,5.8], look:[1,35] }
  ] }
];

export const roomArea = room => (room.rect[1] - room.rect[0]) * (room.rect[3] - room.rect[2]);
export function wallLayout(unit) {
  const half=unit.width/2, walls=[];
  const wall=(axis,fixed,start,end,holes=[])=>walls.push({axis,fixed,start,end,holes});
  // Full-height open sliding doorway at the centre of the balcony facade.
  wall('x',5,-half,half,[{a:-half+.25,b:half-.25,bottom:0,top:2.55}]);
  wall('x',-7,-half,half,[{a:-half+.35,b:-1.12,bottom:.95,top:2.5},{a:-.55,b:.55,bottom:0,top:2.3},{a:1.12,b:half-.35,bottom:.95,top:2.5}]);
  wall('z',-half,-7,5);wall('z',half,-7,5,unit.bedrooms===3?[{a:-2.9,b:-.65,bottom:.95,top:2.5}]:[]);
  wall('z',-.75,-7,0,[{a:-3.4,b:-2.4,bottom:0,top:2.3},{a:-1.5,b:-.5,bottom:0,top:2.3}]);
  wall('x',-2,-half,-.75);
  wall('x',0,-half,-.75);
  if(unit.bedrooms>=2){
    const split=unit.bedrooms===2?-3:-3.5;
    const doors=[{a:split-1.25,b:split-.25,bottom:0,top:2.3}];
    if(unit.bedrooms===3)doors.push({a:-1.5,b:-.5,bottom:0,top:2.3});
    wall('z',.75,-7,unit.bedrooms===3?0:split,doors);
    wall('x',split,.75,half);
    if(unit.bedrooms===3)wall('x',0,.75,half);
  }
  return walls;
}

export function splitWall(wall,height=2.85) {
  const parts=[];
  const add=(start,end,bottom,top)=>{if(end-start>.001&&top-bottom>.001)parts.push({...wall,start,end,bottom,top});};
  let cursor=wall.start;
  for(const hole of wall.holes){add(cursor,hole.a,0,height);add(hole.a,hole.b,0,hole.bottom);add(hole.a,hole.b,hole.top,height);cursor=hole.b;}
  add(cursor,wall.end,0,height);return parts;
}

export function readView(search) {
  const params=new URLSearchParams(search);
  return { unit:units.find(unit=>unit.id===params.get('unidad'))||units[1], view:['edificio','piso','unidad','recorrido'].includes(params.get('vista'))?params.get('vista'):'piso' };
}
