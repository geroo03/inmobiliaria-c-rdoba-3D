// Contacto por WhatsApp de las demos.
// Número de la inmobiliaria con código de país y de área, sin espacios ni signos. Ejemplo para Córdoba: 5493511234567.
// Si queda vacío, el botón abre WhatsApp con el mensaje escrito para que la persona elija a quién enviarlo.
export const whatsappNumber = '';

export function whatsappLink(message, number = whatsappNumber) {
  const digits = String(number).replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
