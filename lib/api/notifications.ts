import { apiFetch } from "./client";

export interface PushSubscriptionData {
  subscription: {
    endpoint: string;
    keys?: {
      p256dh: string;
      auth: string;
    };
    type: "WEB" | "EXPO";
  };
}

/**
 * Subscribe to push notifications by sending the Expo Push Token to the backend.
 */
export async function subscribeToPush(data: PushSubscriptionData): Promise<void> {
  return apiFetch("/push/subscribe", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Unsubscribe from push notifications.
 */
export async function unsubscribeFromPush(endpoint: string): Promise<void> {
  return apiFetch("/push/unsubscribe", {
    method: "POST",
    body: JSON.stringify({ endpoint }),
  });
}
