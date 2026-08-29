import AsyncStorage from '@react-native-async-storage/async-storage';



export interface NotificationPreferences {

  chatMessages: boolean;

  marketplaceOffers: boolean;

}



const STORAGE_KEY = 'afoma.notification.preferences';



const DEFAULT_PREFERENCES: NotificationPreferences = {

  chatMessages: true,

  marketplaceOffers: true,

};



export async function getNotificationPreferences(): Promise<NotificationPreferences> {

  try {

    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {

      return DEFAULT_PREFERENCES;

    }



    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;

    return {

      chatMessages: parsed.chatMessages !== false,

      marketplaceOffers: parsed.marketplaceOffers !== false,

    };

  } catch {

    return DEFAULT_PREFERENCES;

  }

}



export async function setNotificationPreferences(

  patch: Partial<NotificationPreferences>,

): Promise<NotificationPreferences> {

  const current = await getNotificationPreferences();

  const next = { ...current, ...patch };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  return next;

}



export async function areChatNotificationsEnabled(): Promise<boolean> {

  const preferences = await getNotificationPreferences();

  return preferences.chatMessages;

}



export async function areMarketplaceOffersEnabled(): Promise<boolean> {

  const preferences = await getNotificationPreferences();

  return preferences.marketplaceOffers;

}



export async function areAnyPushNotificationsEnabled(): Promise<boolean> {

  const preferences = await getNotificationPreferences();

  return preferences.chatMessages || preferences.marketplaceOffers;

}

