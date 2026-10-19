import { photos } from './photos.js';
export { photos };

// Datos de la propiedad que muestra la página. Para otra propiedad, cambiar estos datos, photos.js y las fotos.
export const property = {
  name: 'Departamento Brisbane',
  place: 'Australia · Serie fotográfica de junio de 2025',
  photoDescription: 'Fotografía real del departamento de Brisbane',
};

// Esquema del plano en un lienzo de 660 × 490: contorno, paso y balcón de esta distribución.
export const plan = {
  backdrop: '<rect x="31" y="31" width="533" height="418" rx="3" fill="#b5bca9"/><rect x="195" y="35" width="80" height="145" fill="#f4f2e7"/><text class="secondary-label" x="235" y="102">PASO</text><rect x="575" y="185" width="54" height="260" fill="#e1e7d7" stroke="#b9c4a9" stroke-width="2"/><text class="secondary-label" transform="translate(605 315) rotate(-90)">BALCÓN · VISIBLE DESDE EL LIVING</text>',
};

// Los rectángulos organizan la visita. No proceden de un plano medido. El mobiliario es simbólico.
export const rooms = [
  { id: 'living', name: 'Living', number: '01', description: 'El sofá, la cocina integrada y el ventanal al balcón, en una misma mirada.', rect: [190, 185, 195, 260], point: [288, 330],
    furniture: '<rect x="220" y="235" width="125" height="43" rx="9"/><path d="M220 250h125M261 237v40M303 237v40"/><rect x="251" y="290" width="65" height="24" rx="5"/>' },
  { id: 'comedor', name: 'Comedor', number: '02', description: 'La vista inversa del espacio social, con la mesa y el acceso visible al dormitorio.', rect: [390, 185, 170, 260], point: [475, 330],
    furniture: '<rect x="427" y="224" width="90" height="57" rx="4"/><path d="M440 215h20m25 0h20m-65 74h20m25 0h20"/>' },
  { id: 'cocina', name: 'Cocina', number: '03', description: 'Muebles blancos, barra divisoria y una conexión abierta con el living.', rect: [35, 185, 150, 260], point: [110, 330],
    furniture: '<path d="M49 205h116v29H79v50H49Z"/><circle cx="103" cy="219" r="8"/><circle cx="129" cy="219" r="8"/><rect x="50" y="376" width="114" height="27"/>' },
  { id: 'dormitorio', name: 'Dormitorio', number: '04', description: 'Dos fotografías del mismo dormitorio: la cama, el placard con espejo y la ventana.', rect: [280, 35, 280, 145], point: [420, 135],
    furniture: '<rect x="351" y="48" width="129" height="70" rx="3"/><rect x="357" y="52" width="52" height="20" rx="3"/><rect x="422" y="52" width="52" height="20" rx="3"/><path d="M352 79h128"/><rect x="292" y="48" width="23" height="68"/>' },
  { id: 'bano', name: 'Baño', number: '05', description: 'Tres perspectivas para conocer el espacio: vista general, lavabos y ducha.', rect: [35, 35, 155, 145], point: [112, 135],
    furniture: '<rect x="48" y="48" width="53" height="57" rx="3"/><path d="M48 48l53 57M48 105l53-57"/><rect x="116" y="48" width="59" height="27" rx="3"/><circle cx="133" cy="61" r="7"/><circle cx="158" cy="61" r="7"/>' },
];

export const hotspots = {
  living: [{ room: 'cocina', x: 16, y: 51 }],
  comedor: [{ room: 'dormitorio', x: 77, y: 56 }],
  cocina: [{ room: 'living', x: 78, y: 78 }],
};

export function tourSummary() { return `${rooms.length} espacios · ${photos.length} fotografías`; }
export function photosFor(room) { return photos.filter(photo => photo.room === room); }
export function readView(search) {
  const params = new URLSearchParams(search);
  const room = rooms.find(item => item.id === params.get('ambiente')) || rooms[0];
  const photo = photosFor(room.id).find(item => item.id === params.get('foto')) || photosFor(room.id)[0];
  return { room, photo, mode: params.get('vista') === 'plano' ? 'plano' : 'fotos' };
}
export function viewURL(base, room, photo, mode) {
  const url = new URL(base);
  url.search = ''; url.hash = '';
  url.searchParams.set('ambiente', room.id);
  url.searchParams.set('foto', photo.id);
  if (mode === 'plano') url.searchParams.set('vista', mode);
  return url;
}
export function nextRoom(id, direction = 1) {
  return rooms[(rooms.findIndex(room => room.id === id) + direction + rooms.length) % rooms.length];
}
export function clampPan(x, y, width, height, stageWidth, stageHeight, zoom) {
  const maxX = Math.max(0, (width * zoom - stageWidth) / 2);
  const maxY = Math.max(0, (height * zoom - stageHeight) / 2);
  return { x: maxX ? Math.max(-maxX, Math.min(maxX, x)) : 0, y: maxY ? Math.max(-maxY, Math.min(maxY, y)) : 0 };
}
