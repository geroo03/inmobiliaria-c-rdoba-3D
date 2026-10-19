// Recorrido 360° de ejemplo: tres panoramas de un mismo lugar (Lythwood), de Greg Zaal en Poly Haven, con licencia CC0.
// Ángulos en grados: yaw 0 es el centro del panorama y crece hacia la derecha; pitch crece hacia arriba.
export const property = {
  name: 'Casa de campo Lythwood',
  place: 'Panoramas 360° de ejemplo · Poly Haven',
};

export const credit = {
  author: 'Greg Zaal',
  authorUrl: 'https://polyhaven.com/all?a=Greg%20Zaal',
  license: 'CC0 1.0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
};

// Las conexiones entre ambientes son orientativas: no proceden de un plano de la casa.
export const scenes = [
  { id: 'terraza', name: 'Terraza', number: '01', description: 'La casa y el jardín desde la terraza de piedra, bajo los árboles.',
    src: './panoramas/terraza.jpg', preview: './panoramas/terraza-preview.jpg', source: 'https://polyhaven.com/a/lythwood_terrace',
    start: { yaw: 25, pitch: 0 }, hotspots: [{ scene: 'living', label: 'Ir al living', yaw: 26, pitch: 2 }] },
  { id: 'living', name: 'Living', number: '02', description: 'Dos salas de estar unidas por un arco, con ventanales al jardín y estufa a leña.',
    src: './panoramas/living.jpg', preview: './panoramas/living-preview.jpg', source: 'https://polyhaven.com/a/lythwood_lounge',
    start: { yaw: 30, pitch: -5 }, hotspots: [{ scene: 'terraza', label: 'Salir a la terraza', yaw: 55, pitch: -2 }, { scene: 'dormitorio', label: 'Ir al dormitorio', yaw: -42, pitch: 0 }] },
  { id: 'dormitorio', name: 'Dormitorio', number: '03', description: 'Dormitorio con estar, chimenea, placard y una ventana al jardín.',
    src: './panoramas/dormitorio.jpg', preview: './panoramas/dormitorio-preview.jpg', source: 'https://polyhaven.com/a/lythwood_room',
    start: { yaw: 20, pitch: -8 }, hotspots: [{ scene: 'living', label: 'Volver al living', yaw: -113, pitch: 2 }] },
];

export function readScene(search) {
  const id = new URLSearchParams(search).get('escena');
  return scenes.find(scene => scene.id === id) || scenes[0];
}
export function sceneURL(base, scene) {
  const url = new URL(base);
  url.search = ''; url.hash = '';
  url.searchParams.set('escena', scene.id);
  return url;
}
// Dirección en la esfera para un yaw y un pitch, tal como Three.js ubica el panorama en una esfera invertida.
export function direction(yaw, pitch) {
  const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180;
  return [-Math.cos(y) * Math.cos(p), Math.sin(p), -Math.sin(y) * Math.cos(p)];
}
export const clampPitch = pitch => Math.max(-85, Math.min(85, pitch));
export const clampFov = fov => Math.max(35, Math.min(90, fov));
export const normalizeYaw = yaw => ((yaw % 360) + 540) % 360 - 180;
