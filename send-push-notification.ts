// Deno Deploy Push Notification Server

import webpush from "npm:web-push@3.5.0";

// Access VAPID keys from environment variables
const vapidKeys = {
  publicKey: Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
  privateKey: Deno.env.get("VAPID_PRIVATE_KEY") ?? ""
};

// Set your VAPID details
webpush.setVapidDetails(
  "mailto: sourabhsuneja021@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Common headers for CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://sourabhsuneja.github.io",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

// Deno server to handle requests
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow only POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Parse the JSON body
    const { subscription, message } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return new Response("Invalid subscription object", {
        status: 400,
        headers: corsHeaders
      });
    }

    // Send push notification
    await webpush.sendNotification(subscription, message || "Hello from Deno Push Server!");

    console.log("Notification sent to:", subscription.endpoint);

    return new Response("Notification sent successfully!", {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.error("Error sending notification:", err);
    return new Response("Failed: " + err.message, {
      status: 500,
      headers: corsHeaders
    });
  }
});