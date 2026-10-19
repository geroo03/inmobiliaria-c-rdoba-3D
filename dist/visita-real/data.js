import { photos } from './photos.js';
export { photos };

// Los rectángulos organizan la visita. No proceden de un plano medido.
export const rooms = [
  { id: 'living', name: 'Living', number: '01', description: 'El sofá, la cocina integrada y el ventanal al balcón, en una misma mirada.', rect: [190, 185, 195, 260], point: [288, 330] },
  { id: 'comedor', name: 'Comedor', number: '02', description: 'La vista inversa del espacio social, con la mesa y el acceso visible al dormitorio.', rect: [390, 185, 170, 260], point: [475, 330] },
  { id: 'cocina', name: 'Cocina', number: '03', description: 'Muebles blancos, barra divisoria y una conexión abierta con el living.', rect: [35, 185, 150, 260], point: [110, 330] },
  { id: 'dormitorio', name: 'Dormitorio', number: '04', description: 'Dos fotografías del mismo dormitorio: la cama, el placard con espejo y la ventana.', rect: [280, 35, 280, 145], point: [420, 135] },
  { id: 'bano', name: 'Baño', number: '05', description: 'Tres perspectivas para conocer el espacio: vista general, lavabos y ducha.', rect: [35, 35, 155, 145], point: [112, 135] },
];

export const hotspots = {
  living: [{ room: 'cocina', x: 16, y: 51 }],
  comedor: [{ room: 'dormitorio', x: 77, y: 56 }],
  cocina: [{ room: 'living', x: 78, y: 78 }],
};

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
