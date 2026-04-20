const CACHE = 'sudoku-v9';
const ASSETS = [
  './', './index.html', './style.css', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png',
  './src/theme.js', './src/engine.js',
  './src/board.jsx', './src/controls.jsx', './src/reducer.jsx', './src/screens.jsx',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
