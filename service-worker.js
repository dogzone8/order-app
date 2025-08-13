const CACHE_NAME = 'order-app-v1';

// 상대경로 → 로컬/서브폴더에서도 정상 동작
const FILES_TO_CACHE = [
  './',
  './index.html',
  './styles.css',   // 있으면 포함, 없으면 제거
  './app.js',       // 있으면 포함, 없으면 제거
  './manifest.json',
  './icon.png',
  './offline.html'
];

// 설치 단계: 캐시 저장
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 활성화 단계: 이전 캐시 정리
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// fetch 단계: 캐시 우선, 없으면 네트워크 → 실패 시 offline.html
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() => caches.match('./offline.html'))
      );
    })
  );
});