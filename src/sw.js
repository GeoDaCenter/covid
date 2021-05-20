if ('function' === typeof importScripts) {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');
  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded');
    self.skipWaiting();

    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);  

    const handler = workbox.precaching.createHandlerBoundToURL('/index.html');
    const navigationRoute = new workbox.routing.NavigationRoute(handler, {
      blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
    });
    workbox.routing.registerRoute(navigationRoute);

    workbox.routing.registerRoute(
      /\.(?:png|gif|jpg|jpeg)$/,
      new workbox.strategies.CacheFirst({
        cacheName: 'images',
        plugins: [
          new workbox.expiration.ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          }),
        ],
      })
    );
    
    workbox.routing.registerRoute(
      /\.(?:geojson)$/,
      new workbox.strategies.CacheFirst({
        cacheName: 'geodata',
        plugins: [
          new workbox.expiration.ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 30 Days
          }),
        ],
      })
    );
  } else {
    console.log('Workbox could not be loaded. No Offline support');
  }
}