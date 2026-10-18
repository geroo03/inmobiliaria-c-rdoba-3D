import * as THREE from 'three';
import { moveWithCollisions } from './movement.js';

export function createWalkNavigation({ camera, canvas, pad, obstacles, onMove }) {
  let enabled = false, yaw = 0, pitch = 0, drag = null;
  const keys = new Set(), heldButtons = new Map();
  const keyDirections = { KeyW:'forward', ArrowUp:'forward', KeyS:'back', ArrowDown:'back', KeyA:'left', ArrowLeft:'left', KeyD:'right', ArrowRight:'right' };
  const direction = new THREE.Vector3();
  const applyLook = () => { camera.rotation.set(pitch, yaw, 0, 'YXZ'); };
  const clear = () => {
    keys.clear(); heldButtons.clear(); drag = null;
    pad.querySelectorAll('button').forEach(b => b.classList.remove('held'));
  };
  document.addEventListener('keydown', event => {
    if (!enabled || !keyDirections[event.code] || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable || event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault(); keys.add(event.code);
  });
  document.addEventListener('keyup', event => keys.delete(event.code));
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  canvas.addEventListener('pointerdown', event => {
    if (!enabled || event.button !== 0 || drag) return;
    canvas.focus({ preventScroll:true });
    canvas.setPointerCapture(event.pointerId);
    drag = { id:event.pointerId, x:event.clientX, y:event.clientY };
  });
  canvas.addEventListener('pointermove', event => {
    if (!enabled || !drag || event.pointerId !== drag.id) return;
    yaw -= (event.clientX - drag.x) * .004;
    pitch = THREE.MathUtils.clamp(pitch - (event.clientY - drag.y) * .004, -1.15, 1.15);
    drag.x = event.clientX; drag.y = event.clientY;
    applyLook();
  });
  for (const name of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(name, event => { if (drag?.id === event.pointerId) drag = null; });
  for (const button of pad.querySelectorAll('[data-move]')) {
    button.addEventListener('pointerdown', event => {
      if (!enabled) return;
      event.preventDefault(); button.setPointerCapture(event.pointerId);
      heldButtons.set(event.pointerId, button.dataset.move); button.classList.add('held');
    });
    for (const name of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(name, event => {
      heldButtons.delete(event.pointerId); button.classList.remove('held');
    });
  }
  return {
    activate() {
      clear(); enabled = true;
      camera.getWorldDirection(direction);
      yaw = Math.atan2(-direction.x, -direction.z);
      pitch = Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1));
      applyLook(); canvas.focus({ preventScroll:true }); onMove(camera.position, yaw);
    },
    deactivate() { enabled = false; clear(); },
    update(dt) {
      if (!enabled) return;
      const active = new Set([...keys].map(key => keyDirections[key]).concat([...heldButtons.values()]));
      let forward = Number(active.has('forward')) - Number(active.has('back'));
      let right = Number(active.has('right')) - Number(active.has('left'));
      const length = Math.hypot(forward, right);
      if (length) {
        forward /= length; right /= length;
        const distance = Math.min(dt, .1) * 1.65;
        const moved = moveWithCollisions(camera.position, (-Math.sin(yaw) * forward + Math.cos(yaw) * right) * distance, (-Math.cos(yaw) * forward - Math.sin(yaw) * right) * distance, obstacles);
        camera.position.set(moved.x, 1.7, moved.z);
      }
      applyLook(); onMove(camera.position, yaw);
    }
  };
}
