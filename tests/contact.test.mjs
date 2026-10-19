import test from 'node:test';
import assert from 'node:assert/strict';
import { whatsappNumber, whatsappLink } from '../dist/contact.js';

test('the configured WhatsApp number contains digits only or is empty', () => {
  assert.match(whatsappNumber, /^\d*$/);
});
test('a configured number keeps only its digits', () => {
  assert.equal(whatsappLink('Hola', '+54 9 351 123-4567'), 'https://wa.me/5493511234567?text=Hola');
});
test('without a number, WhatsApp opens with the message ready to choose a contact', () => {
  assert.equal(whatsappLink('Hola', ''), 'https://wa.me/?text=Hola');
});
test('the message is encoded, including accents and the link it carries', () => {
  const link = new URL(whatsappLink('Unidad 9B, 108,8 m² · https://example.com/noveno/?unidad=9b&vista=unidad', ''));
  assert.equal(link.searchParams.get('text'), 'Unidad 9B, 108,8 m² · https://example.com/noveno/?unidad=9b&vista=unidad');
  assert.deepEqual([...link.searchParams.keys()], ['text']);
});
