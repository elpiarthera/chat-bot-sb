// Service Worker Cleanup Script
// This script checks for and unregisters any existing service workers to prevent caching issues

(function() {
  console.log('🧹 Service Worker Cleanup: Script loaded');
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      console.log('🧹 Service Worker Cleanup: Found ' + registrations.length + ' service workers');
      
      for (let registration of registrations) {
        registration.unregister();
        console.log('🧹 Service Worker Cleanup: Unregistered service worker', registration.scope);
      }
      
      // Clear caches to ensure clean state
      if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
          cacheNames.forEach(function(cacheName) {
            caches.delete(cacheName);
            console.log('🧹 Service Worker Cleanup: Deleted cache', cacheName);
          });
        });
      }
    }).catch(function(error) {
      console.error('🧹 Service Worker Cleanup: Error during cleanup', error);
    });
  } else {
    console.log('🧹 Service Worker Cleanup: Service workers not supported in this browser');
  }
})(); 