// sw.js بدون کش و پاک کننده SW قبلی
self.addEventListener('install', (event) => {
    self.skipWaiting(); // فورس نصب SW جدید
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .then(() => self.clients.claim())
    );
  });
  
  // همه request ها مستقیم به شبکه
  self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
  });
  