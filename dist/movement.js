// Circle/AABB collision in metres. Substeps prevent crossing a wall at low FPS.
export function canStand(x, z, obstacles, radius = .17, bounds = [-5.75, 5.75, -4.75, 7.8]) {
  if (x < bounds[0] || x > bounds[1] || z < bounds[2] || z > bounds[3]) return false;
  return !obstacles.some(([x1, x2, z1, z2]) => {
    const dx = x - Math.max(x1, Math.min(x2, x));
    const dz = z - Math.max(z1, Math.min(z2, z));
    return dx * dx + dz * dz < radius * radius;
  });
}

export function moveWithCollisions(position, dx, dz, obstacles, radius = .17, bounds) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (radius * .5)));
  let { x, z } = position;
  for (let i = 0; i < steps; i++) {
    if (canStand(x + dx / steps, z, obstacles, radius, bounds)) x += dx / steps;
    if (canStand(x, z + dz / steps, obstacles, radius, bounds)) z += dz / steps;
  }
  return { x, z };
}
