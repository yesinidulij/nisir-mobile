import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { subscribeToPush } from '@/lib/api/notifications';
import { loadAuthState } from '@/lib/auth/storage';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Hook to manage push notifications in the mobile app.
 * - Handles permission requests
 * - Retrieves Expo Push Token
 * - Registers token with the backend when the user is authenticated
 */
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        syncTokenWithBackend(token);
      }
    });

    // Listen for incoming notifications when app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for when a user interacts with a notification (taps it)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('[Push] Notification tapped:', data);
      // TODO: Handle deep linking based on data.url or data.tenderId
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  /**
   * Send the token to our backend if the user is logged in.
   */
  async function syncTokenWithBackend(token: string) {
    try {
      const auth = await loadAuthState();
      if (!auth?.accessToken) {
        console.log('[Push] User not logged in, skipping token sync');
        return;
      }

      await subscribeToPush({
        subscription: {
          endpoint: token,
          type: 'EXPO',
        },
      });
      console.info('[Push] Successfully synced Expo Push Token with backend');
    } catch (error) {
      console.error('[Push] Failed to sync token with backend:', error);
    }
  }

  return {
    expoPushToken,
    notification,
  };
}

/**
 * Core logic to request permissions and get the Expo Push Token.
 */
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('[Push] Failed to get push token for push notification!');
      return;
    }

    // Explicitly provide projectId for newer Expo versions
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    try {
        token = (await Notifications.getExpoPushTokenAsync({
            projectId,
          })).data;
          console.info('[Push] Expo Push Token:', token);
    } catch (e) {
        console.error('[Push] Error getting push token:', e);
    }
  } else {
    console.warn('[Push] Must use physical device for Push Notifications');
  }

  return token;
}
