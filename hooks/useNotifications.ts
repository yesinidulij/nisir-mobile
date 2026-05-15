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
      if (!Device.isDevice) {
        console.log('📱 Push notifications require a physical device');
        return;
      }

      // Check/request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('📱 Push notification permission not granted');
        return;
      }

      // Get the Expo push token
      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        if (!projectId) {
          console.warn(
            '📱 No project ID found. Set extra.eas.projectId in app.json or configure EAS.'
          );
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const token = tokenData.data;
        console.log('📱 Expo push token:', token);

        // Register with backend if authenticated
        if (isAuthenticated) {
          try {
            await registerDeviceToken(
              token,
              Device.modelName ?? undefined,
              Platform.OS
            );
            console.log('📱 Device token registered with backend');
          } catch (err) {
            console.error('📱 Failed to register device token:', err);
          }
        }
      } catch (err) {
        console.error('📱 Failed to get Expo push token:', err);
      }

      // Set up Android notification channel
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
