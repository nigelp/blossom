// File: src/services/notificationService.ts

let registration: ServiceWorkerRegistration | null = null;

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  // Register service worker for background notifications
  if ('serviceWorker' in navigator) {
    try {
      registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  }

  if (Notification.permission === "granted") {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const showNotification = async (title: string, options?: NotificationOptions) => {
  const audioUrl = '/notification.mp3';
  const audio = new Audio(audioUrl);

  if (Notification.permission === "granted") {
    try {
      // Play notification sound
      await audio.play().catch(err => {
        console.warn('Audio playback failed:', err);
      });

      // Show notification using service worker if available
      if (registration) {
        const notificationOptions = {
          ...options,
          icon: '/icon-192x192.png', // PWA icon
          badge: '/icon-192x192.png',
          vibrate: [200, 100, 200],
          tag: 'ride-notification',
          renotify: true,
          requireInteraction: true,
          ...options
        };

        await registration.showNotification(title, notificationOptions);
      } else {
        // Fallback to regular notification if service worker is not available
        new Notification(title, options);
      }
    } catch (err) {
      console.error('Error showing notification:', err);
      // Fallback to regular notification
      new Notification(title, options);
    }
  }
};

// Initialize notifications when the service is imported
requestNotificationPermission().catch(err => {
  console.error('Error initializing notifications:', err);
});