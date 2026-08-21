const CACHE = 'agenda-v2.7.0';
const ARCHIVOS = [
  './agenda-ejecutiva.html',
  './manifest.json',
];

// Instalar — guardar archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

// Activar — limpiar cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — servir desde caché si está disponible, si no buscar en red
self.addEventListener('fetch', e => {
  // No cachear peticiones a APIs externas (noticias, proxy, traducción)
  if(
    e.request.url.includes('script.google.com') ||
    e.request.url.includes('allorigins') ||
    e.request.url.includes('corsproxy') ||
    e.request.url.includes('translate.googleapis') ||
    e.request.url.includes('rss')
  ){
    e.respondWith(fetch(e.request).catch(() => new Response('Sin conexión')));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
