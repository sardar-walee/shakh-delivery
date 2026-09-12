importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// This file must be updated with the actual Firebase config before deployment.
// Alternatively, fetch it dynamically if supported by your setup, but typically it is hardcoded here.
// For security reasons, do not commit real config in public repos. In a real scenario, this is injected during build.
const firebaseConfig = {
  apiKey: "AIzaSyDgs3PtwYQx9tJlFCcT3OO_9QD8LlO7QIA",
  authDomain: "utopian-nebula-hcf5x.firebaseapp.com",
  projectId: "utopian-nebula-hcf5x",
  storageBucket: "utopian-nebula-hcf5x.firebasestorage.app",
  messagingSenderId: "53831451880",
  appId: "1:53831451880:web:2ead2a05e1ef350849755d"
};

// Check if all fields are populated before initializing
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

if (isConfigured) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/vite.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.warn('Firebase Messaging SW not initialized because config is missing.');
}
