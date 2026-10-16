"use client";
import { useCallback, useEffect, useState } from "react";
export type PushState =
    | "loading"
    | "unsupported"
    | "blocked"
    | "enabled"
    | "disabled";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(b64);
    const buffer = new ArrayBuffer(raw.length);
    const out = new Uint8Array(buffer);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
}


export function usePushNotifications() {
    const [state, setState] = useState<PushState>("loading");
    const [busy, setBusy] = useState(false);

    const detect = useCallback(async () => {
        if (typeof window === "undefined") return;

        if (
            !("Notification" in window) ||
            !("serviceWorker" in navigator) ||
            !("PushManager" in window)
        ) {
            setState("unsupported");
            return;
        }

        if (Notification.permission === "denied") {
            setState("blocked");
            return;
        }

        if (Notification.permission === "granted") {
            try {
                const reg = await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.getSubscription();
                setState(sub ? "enabled" : "disabled");
            } catch {
                setState("disabled");
            }
            return;
        }

        setState("disabled");
    }, []);

    useEffect(() => {
        detect();
    }, [detect]);

    const subscribe = useCallback(async () => {
        if (busy) return;
        setBusy(true);

        try {
            await navigator.serviceWorker.register("/sw.js");
            const reg = await navigator.serviceWorker.ready;

            const permission = await Notification.requestPermission();

            if (permission === "denied") {
                setState("blocked");
                return;
            }
            if (permission !== "granted") {
                setState("disabled");
                return;
            }

            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            console.log(vapidKey);
            if (!vapidKey) throw new Error("VAPID public key missing");

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });

            const json = sub.toJSON();
            const res = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    endpoint: json.endpoint,
                    keys: json.keys,
                    userAgent: navigator.userAgent,
                }),
            });

            if (!res.ok) {
                await sub.unsubscribe();
                throw new Error("Failed to save subscription");
            }

            setState("enabled");
        } catch (err) {
            console.error("[push] subscribe failed:", err);
            await detect();
        } finally {
            setBusy(false);
        }
    }, [busy, detect]);

    const unsubscribe = useCallback(async () => {
        if (busy) return;
        setBusy(true);

        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();

            if (sub) {
                await fetch("/api/push/unsubscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }

            setState("disabled");
        } catch (err) {
            console.error("[push] unsubscribe failed:", err);
            await detect();
        } finally {
            setBusy(false);
        }
    }, [busy, detect]);

    return { state, busy, subscribe, unsubscribe, refresh: detect };
}

export function getUnblockUrl(): string {
    if (typeof navigator === "undefined")
        return "https://support.google.com/chrome/answer/3220216";

    const ua = navigator.userAgent;
    if (/Firefox/.test(ua))
        return "https://support.mozilla.org/en-US/kb/push-notifications-firefox";
    if (/Edg/.test(ua))
        return "https://support.microsoft.com/en-us/microsoft-edge/manage-website-notifications";
    if (/Safari/.test(ua) && !/Chrome/.test(ua))
        return "https://support.apple.com/guide/safari/customize-website-notifications-sfri40734/mac";
    return "https://support.google.com/chrome/answer/3220216";
}
