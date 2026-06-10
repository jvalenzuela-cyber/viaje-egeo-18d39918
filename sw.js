/* Service worker — offline en destino, pero siempre la última versión si hay conexión.
   Estrategia: HTML network-first (refresca al regenerar la app); imágenes/estáticos cache-first. */
const VERSION = 'v4';
const CACHE = 'viaje-egeo-' + VERSION;
const IMG_KEYS = [
  'est_hero','cap_hero','ath_hero','nax_hero',
  'act_bosforo','act_cisterna','act_mezquita','act_topkapi','act_granbazar','act_galata',
  'act_globo','act_goreme','act_valles','act_subterranea','act_uchisar',
  'act_acropolis','act_museo','act_agora','act_licabeto','act_sunion',
  'act_portara','act_playas','act_pueblos','act_chora',
  'd_kahvalti','d_balik','d_iskender','d_testi','d_manti','d_kofte','d_baklava','d_simit',
  'd_souvlaki','d_moussaka','d_tzatziki','d_saganaki','d_graviera','d_loukoumades'
];
const CORE = ['./', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable.png', './icon-180.png']
  .concat(IMG_KEYS.map(k => 'img/' + k + '.jpg'));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isHTML = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    // network-first: si hay red, trae lo último y lo cachea; si no, sirve cache
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }
  // resto (fotos, fuentes): cache-first
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => { try { c.put(req, copy); } catch (_) {} });
      return res;
    }).catch(() => undefined))
  );
});
