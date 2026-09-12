import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FIREBASE_SERVER_KEY = Deno.env.get("FIREBASE_SERVER_KEY");

serve(async (req) => {
  try {
    const { record, old_record } = await req.json();

    // Only send notification if status changed
    if (old_record && record.status === old_record.status) {
      return new Response("Status unchanged", { status: 200 });
    }

    // Get the customer's FCM token from the profiles table
    // Normally you'd query the DB here using Supabase JS client
    // For this example, we assume you fetch it via another function or it's passed in
    // Since this is triggered by a database webhook, we'll need to fetch the profile
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${record.customer_id}&select=fcm_token`, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY!,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    
    const profiles = await profileRes.json();
    const fcmToken = profiles[0]?.fcm_token;

    if (!fcmToken) {
      return new Response("No FCM token found for user", { status: 200 });
    }

    // Prepare message
    const message = {
      to: fcmToken,
      notification: {
        title: `Order Update: #${record.order_number.substring(0, 8)}`,
        body: `Your order status is now: ${record.status.replace(/_/g, ' ')}`,
        icon: "/vite.svg"
      }
    };

    // Send using legacy HTTP API (or HTTP v1 if configured)
    const fcmRes = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `key=${FIREBASE_SERVER_KEY}`
      },
      body: JSON.stringify(message)
    });

    const fcmData = await fcmRes.json();

    return new Response(JSON.stringify(fcmData), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});
