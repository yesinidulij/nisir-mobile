import { apiFetch } from './client';

/**
 * Register an Expo push token with the backend.
 */
export async function registerDeviceToken(
  expoPushToken: string,
  deviceName?: string,
  platform?: string
) {
  return apiFetch('/mobile-push/register-device', {
    method: 'POST',
    body: JSON.stringify({ expoPushToken, deviceName, platform }),
  });
}

/**
 * Unregister an Expo push token from the backend.
 */
export async function unregisterDeviceToken(expoPushToken: string) {
  return apiFetch('/mobile-push/unregister-device', {
    method: 'POST',
    body: JSON.stringify({ expoPushToken }),
  });
}
