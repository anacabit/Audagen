// ── Service Worker — Agenda Ejecutiva PWA v2.5.1 ──
const CACHE = 'agenda-ejecutiva-v5';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Noticias: red primero, sin cachear
  if(url.includes('rss2json.com')){
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({status:'error',message:'Sin conexión'}),
          { headers: {'Content-Type':'application/json'} })
      )
    );
    return;
  }

  // Todo lo demás: caché primero, luego red
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
