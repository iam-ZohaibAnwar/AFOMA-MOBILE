import { useCallback, useEffect, useState } from 'react';

import { AppState, type AppStateStatus } from 'react-native';



import {

  getNotificationPreferences,

  setNotificationPreferences,

  type NotificationPreferences,

} from '../../../services/push/notificationPreferencesStorage';

import {

  getNotificationPermissionStatus,

  openNotificationSettings,

  requestExpoPushPermissions,

  syncDevicePushRegistration,

  type NotificationPermissionStatus,

} from '../../../services/push/pushNotifications';



interface UseNotificationPreferencesOptions {

  userId?: string;

  enabled?: boolean;

}



interface UseNotificationPreferencesResult {

  preferences: NotificationPreferences;

  permissionStatus: NotificationPermissionStatus;

  isUpdating: boolean;

  error: string | null;

  refresh: () => Promise<void>;

  setChatMessagesEnabled: (enabled: boolean) => Promise<void>;

  setMarketplaceOffersEnabled: (enabled: boolean) => Promise<void>;

  openSystemSettings: () => Promise<void>;

  requestSystemPermission: () => Promise<void>;

}



export function useNotificationPreferences({

  userId,

  enabled = true,

}: UseNotificationPreferencesOptions): UseNotificationPreferencesResult {

  const [preferences, setPreferencesState] = useState<NotificationPreferences>({

    chatMessages: true,

    marketplaceOffers: true,

  });

  const [permissionStatus, setPermissionStatus] =

    useState<NotificationPermissionStatus>('undetermined');

  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState<string | null>(null);



  const refresh = useCallback(async () => {

    if (!enabled) {

      return;

    }



    const [nextPreferences, nextPermissionStatus] = await Promise.all([

      getNotificationPreferences(),

      getNotificationPermissionStatus(),

    ]);



    setPreferencesState(nextPreferences);

    setPermissionStatus(nextPermissionStatus);

  }, [enabled]);



  useEffect(() => {

    void refresh();

  }, [refresh]);



  useEffect(() => {

    if (!enabled) {

      return;

    }



    const handleAppStateChange = (nextState: AppStateStatus) => {

      if (nextState === 'active') {

        void refresh();

      }

    };



    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {

      subscription.remove();

    };

  }, [enabled, refresh]);



  const updatePreference = useCallback(

    async (patch: Partial<NotificationPreferences>, requiresPermissionMessage: string) => {

      if (!userId) {

        return;

      }



      setIsUpdating(true);

      setError(null);



      try {

        const nextPreferences = await setNotificationPreferences(patch);

        const willEnableAny =

          nextPreferences.chatMessages || nextPreferences.marketplaceOffers;



        if (willEnableAny) {

          const granted = await requestExpoPushPermissions();

          const nextPermissionStatus = await getNotificationPermissionStatus();

          setPermissionStatus(nextPermissionStatus);



          if (!granted) {

            setError(requiresPermissionMessage);

            return;

          }

        }



        setPreferencesState(nextPreferences);

        await syncDevicePushRegistration(userId);

      } catch (caught) {

        setError(

          caught instanceof Error ? caught.message : 'Could not update notification settings',

        );

      } finally {

        setIsUpdating(false);

      }

    },

    [userId],

  );



  const setChatMessagesEnabled = useCallback(

    async (enabledValue: boolean) => {

      await updatePreference(

        { chatMessages: enabledValue },

        'Notification permission is required to receive chat alerts.',

      );

    },

    [updatePreference],

  );



  const setMarketplaceOffersEnabled = useCallback(

    async (enabledValue: boolean) => {

      await updatePreference(

        { marketplaceOffers: enabledValue },

        'Notification permission is required to receive offer alerts.',

      );

    },

    [updatePreference],

  );



  const openSystemSettings = useCallback(async () => {

    await openNotificationSettings();

  }, []);



  const requestSystemPermission = useCallback(async () => {

    setError(null);

    const granted = await requestExpoPushPermissions();

    const nextPermissionStatus = await getNotificationPermissionStatus();

    setPermissionStatus(nextPermissionStatus);



    if (!granted && nextPermissionStatus !== 'granted') {

      setError('Notification permission was not granted. You can enable it in device settings.');

    }



    if (userId && granted) {

      await syncDevicePushRegistration(userId);

    }

  }, [userId]);



  return {

    preferences,

    permissionStatus,

    isUpdating,

    error,

    refresh,

    setChatMessagesEnabled,

    setMarketplaceOffersEnabled,

    openSystemSettings,

    requestSystemPermission,

  };

}

