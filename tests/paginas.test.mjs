import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const BASE = 'https://geroo03.github.io/inmobiliaria-c-rdoba-3D/';
const pages = [['', 'Casa Patio'], ['noveno/', 'Noveno'], ['visita-real/', 'Visita real']];
const dist = path => new URL(`../dist/${path}`, import.meta.url);
const html = path => readFileSync(dist(`${path}index.html`), 'utf8');
const meta = (source, key) => source.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];

test('every page shares the header, its menu and the QR button module', () => {
  for (const [path, name] of pages) {
    const source = html(path);
    for (const asset of ['shared.css', 'qr-share.js', 'vendor/qrcode.js']) assert.ok(source.includes(`${path ? '../' : './'}${asset}"`), `${name}: ${asset}`);
    assert.match(source, new RegExp(`<a href="[^"]*" aria-current="page">${name}</a>`), name);
    assert.equal(source.match(/class="demo-nav"/g).length, 1, name);
  }
});
test('every page has a link preview with an existing, light JPEG image', () => {
  for (const [path, name] of pages) {
    const source = html(path);
    for (const key of ['og:title', 'og:description', 'og:image:alt', 'twitter:card']) assert.ok(meta(source, key), `${name}: ${key}`);
    assert.equal(meta(source, 'og:url'), BASE + path, name);
    const image = meta(source, 'og:image');
    assert.ok(image.startsWith(`${BASE}og/`), name);
    const file = dist(image.slice(BASE.length)), bytes = readFileSync(file);
    assert.equal(bytes[0], 0xff); assert.equal(bytes[1], 0xd8);
    assert.ok(statSync(file).size < 300 * 1024, `${name}: la imagen supera 300 KB`);
  }
});
