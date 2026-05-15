import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useAuthState } from './useAuthState';
import { registerDeviceToken } from '@/lib/api/pushNotifications';

/**
 * Hook that handles Expo push notification setup:
 * 1. Requests permissions
 * 2. Gets the Expo push token
 * 3. Registers it with the backend (when authenticated)
 * 4. Listens for notification taps and navigates accordingly
 */
export function useNotifications() {
  const { isAuthenticated } = useAuthState();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Register for push notifications
    async function setupPushNotifications() {
      console.log('📱 Starting push notification setup...');

      // 1. Check/request permissions (Always do this first)
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      console.log('📱 Current notification permission status:', existingStatus);

      if (existingStatus !== 'granted') {
        console.log('📱 Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('📱 Push notification permission NOT granted');
        return;
      }

      console.log('📱 Permission granted! Checking device type...');

      // 2. Check if physical device
      if (!Device.isDevice) {
        console.warn('📱 Note: Push notifications generally require a physical device to receive alerts, but we will try to get a token anyway.');
      }

      // 3. Get the Expo push token
      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        console.log('📱 EAS Project ID:', projectId);

        if (!projectId || projectId === "YOUR_EAS_PROJECT_ID") {
          console.error(
            '📱 ERROR: No valid EAS Project ID found in app.json. Please replace YOUR_EAS_PROJECT_ID with your actual ID from the Expo dashboard.'
          );
          return;
        }

        console.log('📱 Fetching Expo Push Token...');
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const token = tokenData.data;
        console.log('📱 SUCCESS! Expo push token:', token);

        // 4. Register with backend if authenticated
        console.log('📱 Is user authenticated?', isAuthenticated);
        if (isAuthenticated) {
          console.log('📱 Registering token with backend...');
          try {
            await registerDeviceToken(
              token,
              Device.modelName ?? undefined,
              Platform.OS
            );
            console.log('📱 Device token successfully registered with backend');
          } catch (err: any) {
            console.error('📱 Backend registration FAILED:', err?.message || err);
          }
        } else {
          console.log('📱 User not authenticated yet, skipping backend registration.');
        }
      } catch (err: any) {
        console.error('📱 Failed to get Expo push token:', err?.message || err);
      }

      // 5. Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('tenders', {
          name: 'Tenders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#16a34a',
          sound: 'default',
        });
      }
    }

    setupPushNotifications();

    // Listen for incoming notifications (foreground)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('📱 Notification received:', notification);
      });

    // Listen for notification taps
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log('📱 Notification tapped, data:', data);

        // Navigate to tender detail if tenderId is present
        if (data?.tenderId && data?.type === 'tender_approved') {
          const tenderId = String(data.tenderId);
          router.push(`/tender/${tenderId}`);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);
}
