// Service Worker для кэширования и оффлайн работы
const CACHE_NAME = 'd3buff-portfolio-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/optimize.js',
  '/manifest.json',
  '/images/logo.png',
  '/images/Cursor.png',
  '/images/Pointer.png',
  '/images/Xorek.png',
  '/images/Xorek_panic.png',
  '/images/gif.gif',
  '/images/gifB.gif',
  '/Font/AppleColorEmoji-Windows.ttf'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Стратегия кэширования: Cache First, затем Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если ресурс есть в кэше, возвращаем его
        if (response) {
          return response;
        }

        // Иначе загружаем из сети
        return fetch(event.request).then(response => {
          // Проверяем, валидный ли ответ
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Клонируем ответ, так как он может быть использован только один раз
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Fallback для оффлайн режима
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// Обработка push-уведомлений
self.addEventListener('push', event => {
  const title = 'D3buff Portfolio';
  const options = {
    body: event.data?.text() || 'Новое обновление на сайте!',
    icon: 'images/logo.png',
    badge: 'images/logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});