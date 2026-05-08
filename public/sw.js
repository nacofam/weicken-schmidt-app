// Weicken & Schmidt Service Worker
// Handles push notifications and basic offline caching

const CACHE_NAME = 'ws-cache-v1'
const OFFLINE_URLS = ['/', '/dashboard', '/manifest.json']

// Install: cache key pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

// Push notification received
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Weicken & Schmidt', body: event.data.text() }
  }

  const title = data.title || 'Weicken & Schmidt'
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192',
    badge: '/icons/icon-192',
    tag: data.tag || 'ws-notification',
    renotify: true,
    vibrate: [100, 50, 100],
    data: { url: data.url || '/dashboard' },
    actions: data.actions || [],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus()
            client.navigate(targetUrl)
            return
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})
