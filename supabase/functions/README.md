# Push Notifications with Supabase & Firebase Cloud Messaging (FCM)

This directory contains the Edge Function used to send push notifications when an order status changes in the database.

## 1. Firebase Setup
1. Create a Firebase Project in the [Firebase Console](https://console.firebase.google.com/).
2. Go to **Project Settings > Cloud Messaging**.
3. Generate a **Web Push certificate (VAPID key)**.
4. Get your Server Key (Legacy) or configure the HTTP v1 API.

## 2. Frontend Configuration
Add your Firebase Web Configuration to `.env` in the root of the React app:
```env
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
VITE_FIREBASE_VAPID_KEY="..." # The Web Push certificate
```
Update `public/firebase-messaging-sw.js` with your exact Firebase config values so the service worker can receive background notifications.

## 3. Supabase Edge Function Deployment
Deploy the function using the Supabase CLI:

```bash
supabase functions deploy send-fcm-notification
```

Set the required secrets for the function:
```bash
supabase secrets set FIREBASE_SERVER_KEY="your-firebase-server-key"
```

## 4. Database Webhook
In your Supabase Dashboard:
1. Go to **Database > Webhooks**.
2. Create a new webhook on the `orders` table.
3. Trigger on `UPDATE`.
4. Set the HTTP Request destination to your deployed Edge Function URL.
5. Add an HTTP header: `Authorization: Bearer [YOUR_ANON_KEY]`.
