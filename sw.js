/* Service worker — cachea la app y las fotos para uso offline en destino. */
const CACHE = 'viaje-egeo-v1';
const IMG_KEYS = [
  'est_hero','cap_hero','ath_hero','nax_hero',
  'act_bosforo','act_cisterna','act_mezquita','act_topkapi','act_granbazar','act_galata',
  'act_globo','act_goreme','act_valles','act_subterranea','act_uchisar',
  'act_acropolis','act_museo','act_agora','act_licabeto','act_sunion',
  'act_portara','act_playas','act_pueblos','act_chora',
  'd_kahvalti','d_balik','d_iskender','d_testi','d_manti','d_kofte','d_baklava','d_simit',
  'd_souvlaki','d_moussaka','d_tzatziki','d_saganaki','d_graviera','d_loukoumades'
];
const CORE = ['./', './index.html'].concat(IMG_KEYS.map(k => 'img/' + k + '.jpg'));

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
  if (e.request.method !== 'GET') return;
  // cache-first para todo (app estática + fotos); fuentes de Google se cachean al vuelo
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => { try { c.put(e.request, copy); } catch (_) {} });
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
