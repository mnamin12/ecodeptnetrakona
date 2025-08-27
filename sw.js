const CACHE_NAME = 'college-app-cache-v1';
const urlsToCache = [
    '/',
    'Index.html',
    // আপনি চাইলে এখানে CSS বা অন্যান্য জরুরি ফাইল যোগ করতে পারেন
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // শুধুমাত্র Supabase Storage থেকে আসা ছবির রিকোয়েস্ট ক্যাশ করা হবে
  if (event.request.url.includes('supabase.co') && event.request.url.includes('/storage/v1/object/public/college-assets/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
  } else { // অন্যান্য রিকোয়েস্টের জন্য নেটওয়ার্ক প্রথমে চেষ্টা করা হবে
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});