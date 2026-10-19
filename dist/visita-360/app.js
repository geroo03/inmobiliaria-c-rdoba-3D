import * as THREE from 'three';
import { property, credit, scenes, readScene, sceneURL, direction, clampPitch, clampFov, normalizeYaw } from './data.js';
import { whatsappLink } from '../contact.js';

const $ = selector => document.querySelector(selector);
const stage = $('#stage'), canvas = $('#scene');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); }
catch { $('#loading').hidden = true; $('#webgl-error').hidden = false; throw new Error('WebGL no disponible'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene3d = new THREE.Scene(), camera = new THREE.PerspectiveCamera(75, 1, .1, 1100);
const geometry = new THREE.SphereGeometry(500, 64, 40); geometry.scale(-1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
scene3d.add(new THREE.Mesh(geometry, material));
const loader = new THREE.TextureLoader(), previews = new Map();
let current = readScene(location.search), view = { yaw: current.start.yaw, pitch: current.start.pitch, fov: 75 };
let velocity = { yaw: 0, pitch: 0 }, autoRotate = !reducedMotion, loadVersion = 0, fullTexture = null, toastTimer;
let dragging = null, pinchDistance = 0, hoveringSpot = false;
const pointers = new Map(), hotspotButtons = new Map(), visited = new Set();

function loadTexture(url) {
  return new Promise((resolve, reject) => loader.load(url, texture => {
    texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); resolve(texture);
  }, undefined, reject));
}
// Las vistas previas quedan en memoria; la versión en alta se libera al cambiar de ambiente para no saturar la GPU del celular.
function loadPreview(scene) { if (!previews.has(scene.id)) previews.set(scene.id, loadTexture(scene.preview)); return previews.get(scene.id); }
function setMap(texture) { material.map = texture; material.needsUpdate = true; }

$('#property-name').textContent = property.name; $('#property-place').textContent = property.place;
$('#scene-list').innerHTML = scenes.map(scene => `<button class="scene-card" data-scene="${scene.id}" aria-pressed="false"><img src="${scene.preview}" alt="" width="160" height="80" loading="lazy"><span><b>${scene.number}</b> ${scene.name}</span></button>`).join('');
$('#credits-list').innerHTML = scenes.map(scene => `<li><strong>${scene.name}</strong> · <a href="${scene.source}" target="_blank" rel="noopener">Fuente original ↗</a></li>`).join('');
$('#credit-author').textContent = credit.author; $('#credit-author').href = credit.authorUrl;
$('#credit-license').textContent = credit.license; $('#credit-license').href = credit.licenseUrl;

function renderUI() {
  stage.dataset.scene = current.id;
  document.title = `${current.name} · Recorrido 360° — Habita`;
  $('#scene-title').textContent = current.name; $('#detail-name').textContent = current.name;
  $('#scene-number').textContent = `AMBIENTE ${current.number}`; $('#scene-description').textContent = current.description;
  $('#scene-position').textContent = `${current.number} / ${String(scenes.length).padStart(2, '0')}`;
  $('#progress').textContent = `${visited.size} de ${scenes.length} ambientes`;
  document.querySelectorAll('.scene-card').forEach(card => {
    const active = card.dataset.scene === current.id;
    card.classList.toggle('active', active); card.classList.toggle('visited', visited.has(card.dataset.scene)); card.setAttribute('aria-pressed', String(active));
  });
  $('#whatsapp').href = whatsappLink(`Hola, vi el recorrido 360° de «${property.name}» y quiero hacer una consulta. Estaba viendo: ${current.name}. ${sceneURL(location.href, current).href}`);
  $('#auto').setAttribute('aria-pressed', String(autoRotate)); $('#auto').textContent = autoRotate ? '❚❚' : '▶';
  $('#auto').setAttribute('aria-label', autoRotate ? 'Detener el giro automático' : 'Girar automáticamente');
  hotspotButtons.clear(); hoveringSpot = false;
  $('#hotspots').innerHTML = '';
  for (const spot of current.hotspots) {
    const button = document.createElement('button');
    button.className = 'hotspot'; button.dataset.scene = spot.scene; button.hidden = true; button.innerHTML = `<span aria-hidden="true">↗</span>${spot.label}`;
    button.addEventListener('click', () => go(spot.scene)); $('#hotspots').append(button); hotspotButtons.set(button, spot);
    // Con el mouse encima, el giro automático se pausa para que el punto quede quieto y sea fácil de tocar.
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hoveringSpot = true; });
    button.addEventListener('pointerleave', () => { hoveringSpot = false; });
  }
}

async function showScene(next, push = true) {
  const version = ++loadVersion;
  current = next; view.yaw = next.start.yaw; view.pitch = next.start.pitch; velocity = { yaw: 0, pitch: 0 };
  if (push) { const url = sceneURL(location.href, next); if (url.href !== location.href) history.pushState({}, '', url); }
  renderUI(); $('#error').hidden = true; $('#loading').hidden = false; stage.dataset.ready = 'false';
  try {
    const preview = await loadPreview(next); if (version !== loadVersion) return;
    setMap(preview); $('#loading').hidden = true; stage.dataset.ready = 'preview'; visited.add(next.id); renderUI();
    const full = await loadTexture(next.src);
    if (version !== loadVersion) { full.dispose(); return; }
    setMap(full); if (fullTexture) fullTexture.dispose(); fullTexture = full; stage.dataset.ready = 'true';
    $('#announcement').textContent = `${next.name}. Ambiente ${Number(next.number)} de ${scenes.length}.`;
    for (const scene of scenes) if (scene !== next) loadPreview(scene);
  } catch {
    if (version !== loadVersion) return;
    $('#loading').hidden = true; $('#error').hidden = false; stage.dataset.ready = 'error';
  }
}
function go(id) { const scene = scenes.find(item => item.id === id); if (scene) { stopAuto(); showScene(scene); } }
function stopAuto() { if (autoRotate) { autoRotate = false; renderUI(); } }

canvas.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  try { canvas.setPointerCapture(event.pointerId); } catch { /* Algunos navegadores rechazan la captura; el arrastre sigue funcionando. */ }
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); stopAuto();
  if (pointers.size === 1) dragging = { x: event.clientX, y: event.clientY };
  if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchDistance = Math.hypot(a.x - b.x, a.y - b.y); dragging = null; }
  stage.dataset.dragging = 'true';
});
canvas.addEventListener('pointermove', event => {
  if (!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()], distance = Math.hypot(a.x - b.x, a.y - b.y);
    if (pinchDistance) view.fov = clampFov(view.fov * pinchDistance / distance); pinchDistance = distance; return;
  }
  if (!dragging) return;
  const degrees = view.fov / stage.clientHeight, dx = event.clientX - dragging.x, dy = event.clientY - dragging.y;
  dragging = { x: event.clientX, y: event.clientY };
  view.yaw -= dx * degrees; view.pitch = clampPitch(view.pitch + dy * degrees);
  velocity = { yaw: -dx * degrees * .35, pitch: dy * degrees * .35 };
});
function release(event) {
  pointers.delete(event.pointerId); if (pointers.size < 2) pinchDistance = 0;
  if (pointers.size === 1) { const [rest] = pointers.values(); dragging = { ...rest }; }
  if (!pointers.size) { dragging = null; stage.dataset.dragging = 'false'; }
}
canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release); canvas.addEventListener('lostpointercapture', release);
// La rueda acerca solo en pantalla completa o con Ctrl (pellizco del trackpad), para no trabar el desplazamiento de la página.
stage.addEventListener('wheel', event => {
  if (!(document.fullscreenElement || stage.classList.contains('expanded') || event.ctrlKey)) return;
  event.preventDefault(); stopAuto(); view.fov = clampFov(view.fov + event.deltaY * .05);
}, { passive: false });
stage.addEventListener('keydown', event => {
  const turn = { ArrowLeft: [-6, 0], ArrowRight: [6, 0], ArrowUp: [0, 6], ArrowDown: [0, -6] }[event.key];
  if (turn) { event.preventDefault(); stopAuto(); view.yaw += turn[0]; view.pitch = clampPitch(view.pitch + turn[1]); }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); view.fov = clampFov(view.fov - 8); }
  if (event.key === '-') { event.preventDefault(); view.fov = clampFov(view.fov + 8); }
});
$('#zoom-in').onclick = () => { stopAuto(); view.fov = clampFov(view.fov - 10); };
$('#zoom-out').onclick = () => { stopAuto(); view.fov = clampFov(view.fov + 10); };
$('#auto').onclick = () => { autoRotate = !autoRotate && !reducedMotion; renderUI(); };
$('#retry').onclick = () => showScene(current, false);
$('#scene-list').addEventListener('click', event => { const card = event.target.closest('.scene-card'); if (card) go(card.dataset.scene); });
window.addEventListener('popstate', () => showScene(readScene(location.search), false));

function updateFullscreen() {
  const expanded = Boolean(document.fullscreenElement || stage.classList.contains('expanded'));
  $('#fullscreen').textContent = expanded ? '×' : '⛶'; $('#fullscreen').setAttribute('aria-label', expanded ? 'Salir de pantalla completa' : 'Pantalla completa');
}
async function exitFullscreen() {
  if (document.fullscreenElement) await document.exitFullscreen();
  stage.classList.remove('expanded'); document.body.classList.remove('has-expanded'); updateFullscreen();
}
$('#fullscreen').onclick = async () => {
  if (document.fullscreenElement || stage.classList.contains('expanded')) { await exitFullscreen(); return; }
  try { if (!stage.requestFullscreen) throw new Error('Sin pantalla completa'); await stage.requestFullscreen(); }
  catch { stage.classList.add('expanded'); document.body.classList.add('has-expanded'); }
  updateFullscreen(); stage.focus({ preventScroll: true });
};
document.addEventListener('fullscreenchange', updateFullscreen);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && stage.classList.contains('expanded') && !document.querySelector('dialog[open]')) exitFullscreen(); });

function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500); }
async function share() {
  const url = sceneURL(location.href, current).href; $('#share-url').value = url;
  try { await navigator.clipboard.writeText(url); toast('Enlace público copiado. Abre este mismo ambiente.'); if ($('#share-dialog').open) $('#share-dialog').close(); }
  catch { if (!$('#share-dialog').open) $('#share-dialog').showModal(); $('#share-url').select(); }
}
$('#share').onclick = share; $('#copy-again').onclick = share;
async function openCredits() { await exitFullscreen(); $('#credits-dialog').showModal(); }
$('#credits').onclick = openCredits; $('#all-credits').onclick = openCredits;
document.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => button.closest('dialog').close(); });

const target = new THREE.Vector3(), point = new THREE.Vector3();
function resize() { const { width, height } = stage.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(stage); resize();
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame); const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now; // el primer cuadro puede traer una marca anterior a «last» if (document.hidden) return;
  if (!dragging) { view.yaw += velocity.yaw; view.pitch = clampPitch(view.pitch + velocity.pitch); velocity.yaw *= .9; velocity.pitch *= .9; }
  if (autoRotate && !dragging && !hoveringSpot) view.yaw += dt * 4;
  view.yaw = normalizeYaw(view.yaw);
  camera.fov = view.fov; camera.updateProjectionMatrix(); camera.lookAt(target.set(...direction(view.yaw, view.pitch)));
  renderer.render(scene3d, camera);
  const width = stage.clientWidth, height = stage.clientHeight;
  for (const [button, spot] of hotspotButtons) {
    point.set(...direction(spot.yaw, spot.pitch)).multiplyScalar(100).project(camera);
    const visible = point.z < 1 && Math.abs(point.x) < 1.05 && Math.abs(point.y) < 1.05;
    button.hidden = !visible;
    if (visible) button.style.transform = `translate(${(point.x * .5 + .5) * width}px, ${(-point.y * .5 + .5) * height}px) translate(-50%, -50%)`;
  }
  stage.dataset.yaw = view.yaw.toFixed(1); stage.dataset.fov = view.fov.toFixed(0);
}
showScene(current, false); requestAnimationFrame(frame);
