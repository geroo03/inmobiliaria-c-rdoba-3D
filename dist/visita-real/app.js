import { rooms, photos, hotspots, photosFor, readView, viewURL, nextRoom, clampPan } from './data.js';

const $ = selector => document.querySelector(selector);
const stage = $('#stage'), plane = $('#photo-plane'), photoImage = $('#photo');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let state = readView(location.search), loadVersion = 0, zoom = 1, pan = { x: 0, y: 0 };
let fitted = { width: 1, height: 1 }, toastTimer, dragging = false, previousPointer;
const visited = new Set(), pointers = new Map();
let pinchDistance = 0;

// Mobiliario simbólico. El esquema no representa dimensiones certificadas.
const furniture = {
  living: '<rect x="220" y="235" width="125" height="43" rx="9"/><path d="M220 250h125M261 237v40M303 237v40"/><rect x="251" y="290" width="65" height="24" rx="5"/>',
  comedor: '<rect x="427" y="224" width="90" height="57" rx="4"/><path d="M440 215h20m25 0h20m-65 74h20m25 0h20"/>',
  cocina: '<path d="M49 205h116v29H79v50H49Z"/><circle cx="103" cy="219" r="8"/><circle cx="129" cy="219" r="8"/><rect x="50" y="376" width="114" height="27"/>',
  dormitorio: '<rect x="351" y="48" width="129" height="70" rx="3"/><rect x="357" y="52" width="52" height="20" rx="3"/><rect x="422" y="52" width="52" height="20" rx="3"/><path d="M352 79h128"/><rect x="292" y="48" width="23" height="68"/>',
  bano: '<rect x="48" y="48" width="53" height="57" rx="3"/><path d="M48 48l53 57M48 105l53-57"/><rect x="116" y="48" width="59" height="27" rx="3"/><circle cx="133" cy="61" r="7"/><circle cx="158" cy="61" r="7"/>',
};

function mapMarkup() {
  return `<svg class="floor-map" viewBox="0 0 660 490" role="group" aria-label="Plano orientativo. Seleccioná un ambiente para ver sus fotos.">
    <rect x="31" y="31" width="533" height="418" rx="3" fill="#b5bca9"/>
    <rect x="195" y="35" width="80" height="145" fill="#f4f2e7"/><text class="secondary-label" x="235" y="102">PASO</text>
    <rect x="575" y="185" width="54" height="260" fill="#e1e7d7" stroke="#b9c4a9" stroke-width="2"/>
    <text class="secondary-label" transform="translate(605 315) rotate(-90)">BALCÓN · VISIBLE DESDE EL LIVING</text>
    ${rooms.map(room => `<g class="room-zone" role="button" tabindex="0" data-room="${room.id}" aria-label="Ver ${room.name}">
      <rect class="room-shape" x="${room.rect[0]}" y="${room.rect[1]}" width="${room.rect[2]}" height="${room.rect[3]}"/>
      <g class="furniture">${furniture[room.id]}</g><text class="map-label" x="${room.point[0]}" y="${room.point[1]}">${room.name}</text>
      <text class="map-number" x="${room.point[0]}" y="${room.point[1] + 24}">${room.number}</text>
    </g>`).join('')}
    <circle class="map-dot" r="7" cx="288" cy="371"/>
    <path d="M35 455h525" stroke="#b6bfa9" stroke-width="1"/><text class="secondary-label" x="300" y="478">ESQUEMA DE NAVEGACIÓN · NO ESTÁ A ESCALA</text>
  </svg>`;
}

$('#room-list').innerHTML = rooms.map(room => `<button class="room-button" data-room="${room.id}" aria-pressed="false"><span class="number">${room.number}</span><span class="name">${room.name}</span><span class="count">${photosFor(room.id).length} ${photosFor(room.id).length === 1 ? 'foto' : 'fotos'}</span></button>`).join('');
$('#filmstrip').innerHTML = photos.map((photo, index) => `<button class="thumbnail" data-photo="${photo.id}" aria-label="Ver ${photo.label}" aria-pressed="false"><img src="${photo.src}" alt="" loading="lazy" width="91" height="63"><span>${String(index + 1).padStart(2, '0')}</span></button>`).join('');
$('#mini-map').innerHTML = mapMarkup(); $('#large-map').innerHTML = mapMarkup();
$('#credits-list').innerHTML = photos.map(photo => `<div class="credit"><img src="${photo.src}" alt="" loading="lazy"><div><strong>${photo.label}</strong><a href="${photo.source}" target="_blank" rel="noopener">Fuente original ↗</a><span>${photo.author} · ${photo.license}</span></div></div>`).join('');

function writeURL(push = true) {
  const url = viewURL(location.href, state.room, state.photo, state.mode);
  if (url.href !== location.href) history[push ? 'pushState' : 'replaceState']({}, '', url);
}

function renderUI() {
  stage.dataset.room = state.room.id; stage.dataset.photo = state.photo.id; stage.dataset.mode = state.mode;
  document.title = `${state.room.name} · Visita con fotos reales — Habita`;
  $('#room-title').textContent = state.room.name;
  $('#detail-name').textContent = state.room.name;
  $('#room-description').textContent = state.room.description;
  $('#room-number').textContent = `AMBIENTE ${state.room.number}`;
  $('#photo-label').textContent = state.photo.label;
  const roomPhotos = photosFor(state.room.id), roomPhotoIndex = roomPhotos.indexOf(state.photo) + 1;
  $('#photo-caption').textContent = roomPhotos.length > 1 ? `Vista ${roomPhotoIndex} de ${roomPhotos.length} de este ambiente · Fotografía real` : 'Fotografía real · Ampliá para ver detalles';
  $('#photo-position').textContent = `${String(photos.indexOf(state.photo) + 1).padStart(2, '0')} / 08`;
  $('#next-room').innerHTML = `Seguir: ${nextRoom(state.room.id).name} <span aria-hidden="true">→</span>`;
  $('#progress').textContent = `${visited.size} de 5 espacios`;
  $('#progress-bar').style.width = `${visited.size / rooms.length * 100}%`;
  document.querySelectorAll('.room-button, .room-zone').forEach(element => {
    const active = element.dataset.room === state.room.id;
    element.classList.toggle('active', active); element.classList.toggle('visited', visited.has(element.dataset.room));
    element.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('.thumbnail').forEach(element => {
    const active = element.dataset.photo === state.photo.id;
    element.classList.toggle('active', active); element.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('.map-dot').forEach(dot => {
    dot.setAttribute('cx', state.room.point[0]); dot.setAttribute('cy', state.room.point[1] + 42);
  });
  document.querySelectorAll('.mode-tabs [data-mode]').forEach(button => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
  });
  $('#photo-surface').hidden = state.mode !== 'fotos'; $('#plan-surface').hidden = state.mode !== 'plano';
}

function renderHotspots() {
  $('#hotspots').innerHTML = (hotspots[state.photo.id] || []).map(point => {
    const room = rooms.find(item => item.id === point.room);
    return `<button class="hotspot" data-room="${room.id}" style="left:${point.x}%;top:${point.y}%" aria-label="Ir a ${room.name}"><span aria-hidden="true">↗</span>${room.name}</button>`;
  }).join('');
}

function updateTransform() {
  pan = clampPan(pan.x, pan.y, fitted.width, fitted.height, stage.clientWidth, stage.clientHeight, zoom);
  plane.style.transform = `translate(-50%,-50%) translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
  plane.style.setProperty('--hotspot-scale', 1 / zoom);
  stage.dataset.zoom = zoom.toFixed(2); stage.dataset.zoomed = String(zoom > 1.01);
  $('#zoom-out').disabled = zoom <= 1; $('#zoom-in').disabled = zoom >= 3;
  $('#gesture-hint').textContent = zoom > 1.01 ? 'Arrastrá para explorar los detalles' : 'Tocá los puntos para cambiar de espacio';
}
function fitPhoto() {
  const ratio = (photoImage.naturalWidth || 1280) / (photoImage.naturalHeight || 960);
  fitted.width = Math.min(stage.clientWidth, stage.clientHeight * ratio); fitted.height = fitted.width / ratio;
  plane.style.width = `${fitted.width}px`; plane.style.height = `${fitted.height}px`; updateTransform();
}
function setZoom(value) { zoom = Math.max(1, Math.min(3, value)); updateTransform(); }
function resetPhoto() { zoom = 1; pan = { x: 0, y: 0 }; updateTransform(); }

async function showPhoto({ push = true, scroll = false } = {}) {
  const version = ++loadVersion, currentPhoto = state.photo;
  stage.dataset.ready = 'false'; $('#photo-error').hidden = true; $('#loading').hidden = false; plane.style.visibility = 'hidden';
  pointers.clear(); dragging = false; stage.dataset.dragging = 'false'; resetPhoto(); renderUI();
  if (push) writeURL();
  if (scroll && matchMedia('(max-width: 760px)').matches && !document.fullscreenElement && !stage.classList.contains('expanded')) stage.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
  try {
    const loaded = new Image(); loaded.src = currentPhoto.src; await loaded.decode();
    if (version !== loadVersion) return;
    photoImage.src = loaded.src; photoImage.alt = `${currentPhoto.label}. Fotografía real del departamento de Brisbane, de Chris Olszewski.`;
    await photoImage.decode();
    if (version !== loadVersion) return;
    fitPhoto(); renderHotspots(); plane.style.visibility = 'visible'; $('#loading').hidden = true;
    visited.add(state.room.id); renderUI(); stage.dataset.ready = 'true';
    $('#announcement').textContent = `${currentPhoto.label}. Fotografía ${photos.indexOf(currentPhoto) + 1} de ${photos.length}.`;
    const activeThumb = $(`.thumbnail[data-photo="${currentPhoto.id}"]`), strip = $('#filmstrip');
    const targetLeft = activeThumb.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + activeThumb.clientWidth / 2;
    strip.scrollTo({ left: targetLeft, behavior: reducedMotion ? 'instant' : 'smooth' });
  } catch {
    if (version !== loadVersion) return;
    $('#loading').hidden = true; $('#photo-error').hidden = false; stage.dataset.ready = 'error';
  }
}

function selectRoom(id, scroll = false) {
  const room = rooms.find(item => item.id === id); if (!room) return;
  state = { room, photo: photosFor(id)[0], mode: 'fotos' }; showPhoto({ scroll });
}
function selectPhoto(id) {
  const photo = photos.find(item => item.id === id); if (!photo) return;
  state = { room: rooms.find(room => room.id === photo.room), photo, mode: 'fotos' }; showPhoto();
}
function stepPhoto(direction) { selectPhoto(photos[(photos.indexOf(state.photo) + direction + photos.length) % photos.length].id); }
function setMode(mode, scroll = false) {
  state.mode = mode; renderUI(); writeURL();
  if (scroll && matchMedia('(max-width: 760px)').matches) stage.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
}

document.addEventListener('click', event => {
  const roomTarget = event.target.closest('[data-room]');
  if (roomTarget && roomTarget !== stage) selectRoom(roomTarget.dataset.room, !roomTarget.closest('#stage'));
  const photoTarget = event.target.closest('.thumbnail'); if (photoTarget) selectPhoto(photoTarget.dataset.photo);
  const modeTarget = event.target.closest('.mode-tabs [data-mode]'); if (modeTarget) setMode(modeTarget.dataset.mode);
});
document.querySelectorAll('.room-zone').forEach(zone => zone.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectRoom(zone.dataset.room, !zone.closest('#stage')); }
}));
$('#next-photo').onclick = () => stepPhoto(1); $('#previous-photo').onclick = () => stepPhoto(-1);
$('#next-room').onclick = () => selectRoom(nextRoom(state.room.id).id, true);
$('#expand-map').onclick = () => setMode('plano', true);
$('#zoom-in').onclick = () => setZoom(zoom + .35); $('#zoom-out').onclick = () => setZoom(zoom - .35);
$('#reset').onclick = resetPhoto; $('#retry').onclick = () => showPhoto({ push: false });

plane.addEventListener('pointerdown', event => {
  if (event.target.closest('button') || (event.pointerType === 'mouse' && event.button !== 0)) return;
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 2) {
    const points = [...pointers.values()]; pinchDistance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  }
  if (zoom <= 1 && pointers.size === 1) return;
  plane.setPointerCapture(event.pointerId); dragging = true; stage.dataset.dragging = 'true';
  previousPointer = { x: event.clientX, y: event.clientY };
});
plane.addEventListener('pointermove', event => {
  if (!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 2) {
    const points = [...pointers.values()], distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    if (pinchDistance > 0) setZoom(zoom * distance / pinchDistance); pinchDistance = distance; return;
  }
  if (!dragging || zoom <= 1) return;
  pan.x += event.clientX - previousPointer.x; pan.y += event.clientY - previousPointer.y;
  previousPointer = { x: event.clientX, y: event.clientY }; updateTransform();
});
function endPointer(event) {
  pointers.delete(event.pointerId); pinchDistance = 0; dragging = false; stage.dataset.dragging = 'false';
  if (plane.hasPointerCapture(event.pointerId)) plane.releasePointerCapture(event.pointerId);
}
plane.addEventListener('pointerup', endPointer); plane.addEventListener('pointercancel', endPointer);
plane.addEventListener('lostpointercapture', endPointer);
plane.addEventListener('dblclick', event => { if (!event.target.closest('button')) setZoom(zoom > 1 ? 1 : 2); });
plane.addEventListener('wheel', event => {
  if (document.fullscreenElement || stage.classList.contains('expanded') || event.ctrlKey) { event.preventDefault(); setZoom(zoom + (event.deltaY < 0 ? .15 : -.15)); }
}, { passive: false });
window.addEventListener('blur', () => { pointers.clear(); dragging = false; stage.dataset.dragging = 'false'; });

function updateFullscreen() {
  const expanded = Boolean(document.fullscreenElement || stage.classList.contains('expanded'));
  $('#fullscreen').setAttribute('aria-label', expanded ? 'Salir de pantalla completa' : 'Abrir pantalla completa');
  $('#fullscreen').textContent = expanded ? '×' : '⛶'; fitPhoto();
}
async function exitFullscreen() {
  if (document.fullscreenElement) await document.exitFullscreen();
  stage.classList.remove('expanded'); document.body.classList.remove('has-expanded'); updateFullscreen();
}
$('#fullscreen').onclick = async () => {
  if (document.fullscreenElement || stage.classList.contains('expanded')) { await exitFullscreen(); return; }
  try { if (!stage.requestFullscreen) throw new Error('Fullscreen unavailable'); await stage.requestFullscreen(); }
  catch { stage.classList.add('expanded'); document.body.classList.add('has-expanded'); }
  updateFullscreen(); stage.focus({ preventScroll: true });
};
document.addEventListener('fullscreenchange', updateFullscreen);
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.key === 'Escape') { exitFullscreen(); resetPhoto(); return; }
  if (!event.target.closest('.viewer')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); stepPhoto(event.key === 'ArrowRight' ? 1 : -1); }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(zoom + .35); }
  if (event.key === '-') { event.preventDefault(); setZoom(zoom - .35); }
});
new ResizeObserver(fitPhoto).observe(stage);
window.addEventListener('popstate', () => { state = readView(location.search); showPhoto({ push: false }); });

function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500); }
async function openCredits() { await exitFullscreen(); $('#credits-dialog').showModal(); }
$('#credits').onclick = openCredits; $('#all-credits').onclick = openCredits;
document.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => button.closest('dialog').close(); });
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return; const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}));
async function share() {
  const url = viewURL(location.href, state.room, state.photo, state.mode).href;
  $('#share-url').value = url;
  try { await navigator.clipboard.writeText(url); toast('Enlace público copiado. Incluye este ambiente y esta foto.'); if ($('#share-dialog').open) $('#share-dialog').close(); }
  catch { if (!$('#share-dialog').open) $('#share-dialog').showModal(); $('#share-url').focus(); $('#share-url').select(); }
}
$('#share').onclick = share; $('#copy-again').onclick = share;
showPhoto({ push: false });
