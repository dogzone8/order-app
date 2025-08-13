const CACHE_NAME = "order-app-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/orders.html"
  "/manifest.json",
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// 설치 단계: 캐시 저장
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 활성화 단계: 이전 캐시 정리
self.addEventListener("activate", event => {
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
});

// 요청 가로채기: 캐시 우선, 실패 시 offline.html 제공
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 캐시된 응답이 있으면 반환
      if (response) return response;

      // 없으면 네트워크 요청 시도
      return fetch(event.request).catch(() => {
        // 실패 시 offline.html 반환 (HTML 요청일 때만)
        if (event.request.destination === "document") {
          return caches.match("/offline.html");
        }
      });
    })
  );
});