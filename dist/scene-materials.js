import * as THREE from 'three';

// Deterministic, local textures: the demo needs no image service or CDN.
export function createSurfaceMaterial(color, kind, roughness = .85) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  let seed = 173;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.fillStyle = '#b8b8b8'; ctx.fillRect(0, 0, 256, 256);
  const pixels = ctx.getImageData(0, 0, 256, 256);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const level = 205 + random() * (kind === 'plaster' ? 7 : kind === 'wood' ? 14 : 30);
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = level;
  }
  ctx.putImageData(pixels, 0, 0);
  if (kind === 'wood') {
    for (let i = 0; i < 150; i++) {
      ctx.strokeStyle = `rgba(50,40,25,${random() * .10})`; ctx.lineWidth = .4 + random();
      const x = random() * 256; ctx.beginPath(); ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + random() * 12, 80, x - random() * 12, 180, x + random() * 3, 256); ctx.stroke();
    }
  }
  const map = new THREE.CanvasTexture(canvas); map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
  return new THREE.MeshStandardMaterial({ color, roughness, map, bumpMap:map, bumpScale:kind === 'wood' ? .004 : kind === 'plaster' ? .0025 : .009 });
}

export function setWorldUVs(geometry, width, height, depth) {
  const uv = geometry.attributes.uv;
  const sizes = [[depth,height],[depth,height],[width,depth],[width,depth],[width,height],[width,height]];
  for (let face = 0; face < 6; face++) for (let corner = 0; corner < 4; corner++) {
    const index = face * 4 + corner;
    uv.setXY(index, uv.getX(index) * sizes[face][0], uv.getY(index) * sizes[face][1]);
  }
}
