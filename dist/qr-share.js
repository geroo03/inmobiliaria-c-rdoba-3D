// Botón «Abrir en el celular»: muestra un código QR con la dirección de la vista actual,
// para que quien mira una presentación la abra en su teléfono. Usa vendor/qrcode.js (MIT).
const header = document.querySelector('.header');

function qrMarkup(url) {
  const qr = window.qrcode(0, 'M'); qr.addData(url); qr.make();
  const size = qr.getModuleCount(), quiet = 4, total = size + quiet * 2;
  let path = '';
  for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) if (qr.isDark(row, col)) path += `M${col + quiet} ${row + quiet}h1v1h-1z`;
  return `<svg viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${total}" height="${total}" fill="#fff"/><path d="${path}" fill="#1f3a2f"/></svg>`;
}

if (header) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'qr-button'; button.title = 'Abrir en el celular';
  button.setAttribute('aria-label', 'Abrir en el celular con un código QR'); button.setAttribute('aria-haspopup', 'dialog');
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.5v2.5H14zM20.5 14v.5M14 20.5h.5M17.5 20.5h3v-3"/></svg><span>Abrir en el celular</span>';
  header.append(button);

  const dialog = document.createElement('dialog');
  dialog.className = 'qr-dialog'; dialog.setAttribute('aria-labelledby', 'qr-title');
  dialog.innerHTML = '<button type="button" class="qr-close" aria-label="Cerrar">×</button><p class="qr-kicker">ABRIR EN EL CELULAR</p><h2 id="qr-title">Escaneá con la cámara</h2><div class="qr-code" role="img"></div><p class="qr-url"></p>';
  document.body.append(dialog);
  const code = dialog.querySelector('.qr-code'), address = dialog.querySelector('.qr-url');

  button.addEventListener('click', () => {
    const url = location.href;
    try { code.innerHTML = qrMarkup(url); code.setAttribute('aria-label', `Código QR de ${url}`); }
    catch { code.textContent = 'No se pudo generar el código. Abrí la dirección de abajo.'; code.removeAttribute('aria-label'); }
    address.textContent = url.replace(/^https?:\/\//, '');
    dialog.showModal();
  });
  dialog.querySelector('.qr-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return; const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  // Las teclas no deben llegar a los controles de la demo (caminar, salir del recorrido) mientras el diálogo está abierto.
  dialog.addEventListener('keydown', event => event.stopPropagation());
}
