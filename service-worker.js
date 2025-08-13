const CACHE_NAME = 'order-app-v1';
const FILES_TO_CACHE = [
  './index.html',
  './orders.html',
  './manifest.json',
  './offline.html',
  './icon.png'
];

// 설치 단계: 캐시 저장
self.addEventListener('install', event => {
  self.skipWaiting(); // 즉시 활성화
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 활성화 단계: 이전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // 즉시 컨트롤
});

// 요청 처리: 캐시 우선 + 오프라인 대응
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