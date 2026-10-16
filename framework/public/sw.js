/* =========================================================
   SERVICE WORKER — receives push events, shows notifications

   This file runs in the browser. It is NOT part of your
   Next.js bundle. It is served at /sw.js and the browser
   registers it once, then keeps it alive in the background.

   Rule: this file must be plain JavaScript. No imports,
   no TypeScript, no JSX. The browser doesn't compile.
   ========================================================= */

/* ── push event ──────────────────────────────────────────
   Fires when the Push Service delivers a message to this
   specific browser. The payload is already decrypted at
   this point — the browser handles all crypto for us.
   ========================================================= */
self.addEventListener("push", (event) => {
    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch {
        // Payload wasn't JSON — treat as plain text
        data = { title: "ShonenBuilds", body: event.data?.text() ?? "" };
    }

    const title = data.title || "ShonenBuilds";
    const options = {
        body: data.body || "",
        icon: data.icon || "/icon-192.png",
        badge: "/badge.png",
        // Custom data we can read back when the user clicks
        data: {
            url: data.url || "/realm",
        },
        // Don't collapse with other notifications from us
        tag: data.tag,
        // Show even if the tab is in the foreground
        requireInteraction: false,
    };

    // waitUntil keeps the service worker alive until the
    // notification actually shows. Without it, the SW could
    // be killed before the browser renders the notification.
    event.waitUntil(self.registration.showNotification(title, options));
});

/* ── notificationclick event ─────────────────────────────
   Fires when the user taps the notification. We close the
   notification and open the target URL in a new tab (or
   focus an existing one).
   ========================================================= */
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || "/realm";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // If a tab is already open on our origin, focus it
            for (const client of clientList) {
                if ("focus" in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // Otherwise open a new tab
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        }),
    );
});

/* ── pushsubscriptionchange event ────────────────────────
   The browser sometimes rotates the subscription silently
   (rare, but happens after certain OS updates). When it
   does, we need to re-subscribe and send the new one to our
   server. For now, we just log — v2 will handle re-subscribe.
   ========================================================= */
self.addEventListener("pushsubscriptionchange", (event) => {
    console.warn("[sw] push subscription changed — user needs to re-subscribe");
});
