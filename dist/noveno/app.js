import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { createWalkNavigation } from '../walk-navigation.js';
import { units, readView } from './units.js';
import { createApartment, createBuilding } from './model.js';
import { createCity } from './city.js';

const $=id=>document.getElementById(id),stage=$('stage'),canvas=$('scene');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const initial=readView(location.search);
const state={unit:initial.unit,view:initial.view,top:false,evening:false,room:null};
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(43,1,.035,950);camera.position.set(25,27,32);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
const pmrem=new THREE.PMREMGenerator(renderer),roomEnvironment=new RoomEnvironment();
const environment=pmrem.fromScene(roomEnvironment,.04);scene.environment=environment.texture;scene.environmentIntensity=.3;roomEnvironment.dispose();pmrem.dispose();
const hemi=new THREE.HemisphereLight(0xf3f7f5,0xb9b5ad,1.35);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,2.7);sun.position.set(-25,45,35);sun.castShadow=true;
sun.shadow.mapSize.set(stage.clientWidth<600?1024:2048,stage.clientWidth<600?1024:2048);
Object.assign(sun.shadow.camera,{left:-32,right:32,top:28,bottom:-40,near:1,far:140});sun.shadow.normalBias=.025;sun.shadow.bias=-.00025;sun.shadow.radius=3;scene.add(sun);
const fill=new THREE.DirectionalLight(0xd7e7ef,.8);fill.position.set(15,20,-25);scene.add(fill);
const sky=new THREE.Mesh(new THREE.SphereGeometry(700,32,16),new THREE.ShaderMaterial({
  side:THREE.BackSide,depthWrite:false,
  uniforms:{top:{value:new THREE.Color(0x83a6bd)},bottom:{value:new THREE.Color(0xe9ebe4)}},
  vertexShader:'varying vec3 vPosition; void main(){vPosition=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 top; uniform vec3 bottom; varying vec3 vPosition; void main(){float h=clamp(normalize(vPosition).y+.06,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.5)),1.);}'
}));scene.add(sky);
const city=createCity();scene.add(city.root);
const building=createBuilding(units);scene.add(building.root);
const models=new Map(units.map(unit=>{const model=createApartment(unit);scene.add(model.root);return [unit.id,model];}));
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.08;controls.target.set(0,0,-1);controls.enablePan=true;controls.screenSpacePanning=false;controls.maxPolarAngle=Math.PI*.47;
const obstacles=[],bounds=[-1,1,-1,1];let transition=null,ready=false;
const walker=createWalkNavigation({camera,canvas,pad:$('walk-pad'),obstacles,bounds,onMove:(position,yaw)=>{
  const x=position.x-state.unit.offset,z=position.z;
  stage.dataset.walkX=x.toFixed(3);stage.dataset.walkZ=z.toFixed(3);
  $('map-position').setAttribute('transform',`translate(${x} ${z}) rotate(${-yaw*180/Math.PI})`);
  const room=state.unit.rooms.find(r=>x>=r.rect[0]&&x<=r.rect[1]&&z>=r.rect[2]&&z<=r.rect[3]);
  if((room?.id||'hall')!==state.room)updateRoom(room);
}});
const pins=new Map();
const format=value=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:1}).format(value);

$('units').replaceChildren();
for(const unit of units){
  const card=document.createElement('button');card.className='unit-card';card.dataset.unit=unit.id;card.style.setProperty('--unit-color',unit.color);
  card.innerHTML=`<span class="unit-letter">${unit.label}</span><span class="unit-card-info"><strong>${unit.bedrooms} ${unit.bedrooms===1?'dormitorio':'dormitorios'}</strong><span>${format(unit.covered+unit.balcony)} m² · Piso 9</span><span class="status">Disponible · demo</span></span>`;
  card.addEventListener('click',()=>selectUnit(unit,state.view==='recorrido'?'recorrido':'unidad'));$('units').append(card);
  const pin=document.createElement('button');pin.className='unit-pin';pin.innerHTML=`<strong>${unit.label}</strong><span>${unit.bedrooms} dorm. · ${format(unit.covered+unit.balcony)} m²</span>`;
  pin.setAttribute('aria-label',`Ver departamento ${unit.label}`);pin.addEventListener('click',()=>selectUnit(unit,'unidad'));$('pins').append(pin);pins.set(unit.id,pin);
}

function updateUnit(){
  const unit=state.unit;stage.dataset.unit=unit.id;
  for(const button of $('units').children){const active=button.dataset.unit===unit.id;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));}
  for(const [id,pin] of pins)pin.classList.toggle('active',id===unit.id);
  $('unit-label').textContent=`UNIDAD ${unit.label}`;$('unit-name').textContent=unit.name;$('unit-description').textContent=unit.description;
  $('total-area').innerHTML=`${format(unit.covered+unit.balcony)} <small>m²</small>`;$('bedrooms').textContent=String(unit.bedrooms).padStart(2,'0');$('balcony-area').innerHTML=`${format(unit.balcony)} <small>m²</small>`;
  $('enter-unit').innerHTML=`Entrar al departamento ${unit.label} <span>↗</span>`;
  $('rooms').replaceChildren();$('map-rooms').replaceChildren();
  $('mini-map').setAttribute('viewBox',`${-unit.width/2-.25} -7.3 ${unit.width+.5} 14.2`);
  for(const room of unit.rooms){
    const button=document.createElement('button');button.textContent=room.name;button.dataset.room=room.id;button.addEventListener('click',()=>setView('recorrido',false,room));$('rooms').append(button);
    const rect=document.createElementNS('http://www.w3.org/2000/svg','rect'),[x1,x2,z1,z2]=room.rect;
    for(const [key,value] of Object.entries({x:x1+.04,y:z1+.04,width:x2-x1-.08,height:z2-z1-.08,rx:.1,tabindex:0,role:'button','aria-label':`Ir a ${room.name}`}))rect.setAttribute(key,String(value));
    rect.dataset.room=room.id;rect.addEventListener('click',()=>setView('recorrido',false,room));rect.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setView('recorrido',false,room);}});$('map-rooms').append(rect);
  }
}
function updateRoom(room){
  state.room=room?.id||'hall';stage.dataset.room=state.room;
  $('room-unit').textContent=`UNIDAD ${state.unit.label} / PISO 09`;$('room-name').textContent=room?.name||'Circulación';
  for(const el of [...$('rooms').children,...$('map-rooms').children]){const active=el.dataset.room===state.room;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));}
}
function selectUnit(unit,view){state.unit=unit;updateUnit();setView(view);}
function fly(position,target,done,instant=false){
  controls.enabled=false;
  const fromTarget=new THREE.Vector3();camera.getWorldDirection(fromTarget);fromTarget.multiplyScalar(state.view==='recorrido'?4:10).add(camera.position);
  transition={start:performance.now(),duration:instant||reduced?1:1100,from:camera.position.clone(),to:new THREE.Vector3(...position),targetFrom:fromTarget,targetTo:new THREE.Vector3(...target),done};
}
function applyVisibility(){
  const exterior=state.view==='edificio'||state.view==='recorrido';
  sky.visible=exterior;city.root.visible=exterior;building.lower.visible=exterior;
  building.common.visible=state.view!=='unidad';
  scene.fog=exterior?new THREE.Fog(state.evening?0xb8afb0:0xdbe4e3,100,450):null;
  for(const [id,model] of models){
    model.root.visible=state.view!=='unidad'||id===state.unit.id;
    model.ceilings.visible=state.view==='recorrido'&&!transition;
    model.lamps.forEach(light=>{light.intensity=state.view==='recorrido'&&id===state.unit.id?(state.evening?5:2.5):0;});
  }
}
// Aleja la cámara lo justo para que la maqueta entre completa, sea cual sea la proporción del visor.
const fitCamera=new THREE.PerspectiveCamera(),fitBox=new THREE.Box3(),fitPoint=new THREE.Vector3();
function framed(position,target,subjects){
  fitBox.makeEmpty();for(const subject of subjects)fitBox.expandByObject(subject);
  const to=new THREE.Vector3(...target),arm=new THREE.Vector3(...position).sub(to);fitCamera.copy(camera,false);let scale=1;
  for(let pass=0;pass<4;pass++){
    fitCamera.position.copy(arm).multiplyScalar(scale).add(to);fitCamera.lookAt(to);fitCamera.updateMatrixWorld();
    let extent=0;for(let corner=0;corner<8;corner++){fitPoint.set(corner&1?fitBox.max.x:fitBox.min.x,corner&2?fitBox.max.y:fitBox.min.y,corner&4?fitBox.max.z:fitBox.min.z).project(fitCamera);extent=Math.max(extent,Math.abs(fitPoint.x),Math.abs(fitPoint.y));}
    if(extent<=.9)break;scale*=extent/.9;
  }
  return fitCamera.position.toArray();
}
function setView(view,top=false,room=null,instant=false){
  walker.deactivate();$('walk-ui').hidden=true;$('room-info').hidden=view!=='recorrido';
  state.view=view;state.top=top;state.room=null;delete stage.dataset.walkX;delete stage.dataset.walkZ;delete stage.dataset.room;
  stage.dataset.view=view;stage.dataset.top=String(top);
  camera.fov=view==='recorrido'?62:43;camera.updateProjectionMatrix();
  controls.minDistance=view==='edificio'?23:view==='piso'?14:7;controls.maxDistance=view==='edificio'?135:65;controls.minPolarAngle=0;controls.maxPolarAngle=Math.PI*.47;
  controls.enableRotate=!top;controls.enableZoom=true;controls.mouseButtons.LEFT=top?THREE.MOUSE.PAN:THREE.MOUSE.ROTATE;controls.touches.ONE=top?THREE.TOUCH.PAN:THREE.TOUCH.ROTATE;
  document.querySelectorAll('[data-view]').forEach(button=>{if(button.tagName!=='BUTTON')return;const active=button.dataset.view===view;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  const narrow=stage.clientWidth<600,offset=state.unit.offset;
  let position,target,done=()=>{controls.enabled=true;applyVisibility();};
  if(view==='edificio'){position=narrow?[63,30,85]:[44,21,62];target=[0,-11,-1];}
  else if(view==='piso'){position=top?[0,narrow?60:35,-.999]:narrow?[20,32,41]:[14,20,25];target=[0,0,-1];}
  else if(view==='unidad'){position=top?[offset,narrow?31:23,-.999]:narrow?[offset+14,18,23]:[offset+11,12,17];target=[offset,.4,-.8];}
  else{
    room=room||state.unit.rooms.find(r=>r.id==='living');
    const model=models.get(state.unit.id);obstacles.splice(0,obstacles.length,...model.obstacles);bounds.splice(0,4,...model.walkBounds);
    position=[offset+room.eye[0],1.7,room.eye[1]];target=[offset+room.look[0],room.id==='balcony'?-6:1.15,room.look[1]];
    updateRoom(room);done=()=>{controls.enabled=false;walker.activate();$('walk-ui').hidden=false;applyVisibility();};
  }
  if(view!=='recorrido'){const subjects=view==='unidad'?[models.get(state.unit.id).root]:[...(view==='edificio'?[building.root]:[]),...[...models.values()].map(model=>model.root)];position=framed(position,target,subjects);controls.maxDistance=Math.max(controls.maxDistance,Math.hypot(position[0]-target[0],position[1]-target[1],position[2]-target[2])*1.2);}
  const captions={edificio:'NOVENO / EDIFICIO Y ENTORNO',piso:'PLANTA COMPLETA / PISO 09',unidad:`DEPARTAMENTO ${state.unit.label} / ${top?'PLANO SUPERIOR':'VISTA 3D'}`,recorrido:'RECORRIDO A PIE / PISO 09'};
  $('caption').textContent=captions[view];
  $('hint').textContent=view==='recorrido'?(matchMedia('(pointer:coarse)').matches?'Arrastrá para mirar · Flechas para caminar':'Arrastrá para mirar · WASD / flechas para caminar · Esc: plano'):top?'Arrastrá para mover el plano · Rueda o dos dedos para acercar':matchMedia('(pointer:coarse)').matches?'Un dedo: girar · Dos dedos: mover y acercar':'Arrastrá: girar · Botón derecho: mover · Rueda: acercar';
  const descriptions={edificio:['Tu próxima casa, en contexto.','El piso 9 está arriba. Elegí Piso 9 para ver sus tres unidades.'],piso:['Un piso completo, a tu alcance.','Seleccioná 9A, 9B o 9C sobre la maqueta o en la lista.'],unidad:[`${state.unit.label}: ${state.unit.name}.`,'Explorá la distribución o entrá a recorrer sus ambientes.'],recorrido:['Hacé tu propio recorrido.','Pasá por las puertas, salí al balcón y mirá la ciudad desde arriba.']};
  $('view-description').replaceChildren();const strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=descriptions[view][0];span.textContent=descriptions[view][1];$('view-description').append(strong,span);
  for(const button of $('rooms').children)if(view!=='recorrido'){button.classList.remove('active');button.setAttribute('aria-pressed','false');}
  history.replaceState(null,'',`?unidad=${state.unit.id}&vista=${view}`);
  fly(position,target,done,instant);applyVisibility();
  if(narrow&&!instant)stage.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});
}
for(const button of document.querySelectorAll('button[data-view]'))button.addEventListener('click',()=>setView(button.dataset.view));
$('enter-unit').addEventListener('click',()=>setView('recorrido'));
$('top-view').addEventListener('click',()=>setView(state.view==='piso'?'piso':'unidad',true));
$('exit-walk').addEventListener('click',()=>setView('unidad',true));
$('reset').addEventListener('click',()=>setView(state.view,state.top));
$('fullscreen').hidden=!document.fullscreenEnabled;
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen();}catch{$('fullscreen').hidden=true;}});
document.addEventListener('fullscreenchange',()=>$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Salir de pantalla completa':'Pantalla completa'));
$('light').addEventListener('click',()=>{
  state.evening=!state.evening;$('light').textContent=state.evening?'☾':'☼';$('light').setAttribute('aria-pressed',String(state.evening));$('light').setAttribute('aria-label',state.evening?'Ver de día':'Ver al atardecer');
  sun.color.set(state.evening?0xffbd85:0xfff0d8);sun.intensity=state.evening?1.8:2.7;sun.position.set(-25,state.evening?12:45,35);hemi.intensity=state.evening?.9:1.35;
  sky.material.uniforms.top.value.set(state.evening?0x879ba9:0x83a6bd);sky.material.uniforms.bottom.value.set(state.evening?0xe1c2ad:0xe9ebe4);applyVisibility();
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.view==='recorrido')setView('unidad',true);});
let toastTimer;
$('share').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(location.href);$('share-message').textContent=`Enlace público del ${state.unit.label} copiado`;$('share-message').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('share-message').hidden=true,3500);}
  catch{$('share-url').value=location.href;$('share-fallback').hidden=false;$('share-url').focus();$('share-url').select();}
});
$('close-share').addEventListener('click',()=>{$('share-fallback').hidden=true;$('share').focus();});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pointerStart=null;
canvas.addEventListener('pointerdown',event=>{pointerStart=event.button===0?[event.clientX,event.clientY,event.pointerId]:null;});
canvas.addEventListener('pointercancel',()=>pointerStart=null);
canvas.addEventListener('pointerup',event=>{
  if(state.view==='piso'&&!transition&&pointerStart&&event.pointerId===pointerStart[2]&&Math.hypot(event.clientX-pointerStart[0],event.clientY-pointerStart[1])<5){
    const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects([...models.values()].map(model=>model.hit),false)[0];if(hit)selectUnit(units.find(unit=>unit.id===hit.object.userData.unit),'unidad');
  }
  pointerStart=null;
});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();walker.deactivate();$('error').hidden=false;});
function resize(){const {width,height}=stage.getBoundingClientRect();stage.classList.toggle('compact',width<600);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(stage);resize();
const projected=new THREE.Vector3();let last=performance.now();
function render(now){
  requestAnimationFrame(render);const dt=Math.min(.1,(now-last)/1000);last=now;if(document.hidden)return;
  if(transition){const t=Math.min(1,(now-transition.start)/transition.duration),smooth=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,smooth);controls.target.lerpVectors(transition.targetFrom,transition.targetTo,smooth);camera.lookAt(controls.target);if(t>=1){const done=transition.done;transition=null;done();}}
  if(!transition){if(state.view==='recorrido')walker.update(dt);else controls.update();}
  scene.updateMatrixWorld();camera.updateMatrixWorld();
  for(const unit of units){const pin=pins.get(unit.id);pin.hidden=state.view!=='piso'||!!transition;if(!pin.hidden){projected.set(unit.offset,.3,1.7).project(camera);pin.style.left=`${(projected.x*.5+.5)*stage.clientWidth}px`;pin.style.top=`${(-projected.y*.5+.5)*stage.clientHeight}px`;pin.hidden=projected.z>1||Math.abs(projected.x)>.95||Math.abs(projected.y)>.93;}}
  renderer.render(scene,camera);if(!ready){ready=true;$('loading').hidden=true;stage.dataset.ready='true';}
}
updateUnit();setView(initial.view,false,null,true);requestAnimationFrame(render);
