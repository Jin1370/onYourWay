"use client";

import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { useEffect } from "react";

export default function ChatNotificationConsent() {
    useEffect(() => {
        async function setupChatNotifications() {
            try {
                const messaging = await getFirebaseMessaging();
                if (!messaging) return;
                if (!("serviceWorker" in navigator)) return;

                const permission =
                    Notification.permission === "granted"
                        ? "granted"
                        : await Notification.requestPermission();
                if (permission !== "granted") return;

                const serviceWorkerRegistration =
                    await navigator.serviceWorker.register(
                        "/firebase-messaging-sw.js",
                    );

                const token = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration,
                });

                if (token) {
                    await fetch("/api/fcm-token", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token }),
                    });
                }
            } catch (error) {
                console.error("Failed to initialize chat notifications:", error);
            }
        }

        setupChatNotifications();
    }, []);

    return null;
}
