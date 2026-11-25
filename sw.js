// Service worker: hace que la app se pueda instalar con ícono y abra rápido.
// Los datos (ventas, inventario) siempre van al servidor; aquí solo se guardan los archivos de la app.
const VERSION = 'papeleria-v2';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // la API nunca se guarda en caché
  // Primero la red (para recibir actualizaciones); si no hay internet, la copia guardada
  e.respondWith(fetch(e.request).then(r => {
    const copia = r.clone();
    caches.open(VERSION).then(c => c.put(e.request, copia));
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
