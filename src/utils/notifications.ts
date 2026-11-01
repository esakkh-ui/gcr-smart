import { setOneSignalExternalId, removeOneSignalExternalId } from './onesignal';

export const requestNotificationPermission = async () => {
  // OneSignal handles this during init/prompt
  return true;
};

export const initNotifications = async (userUid?: string) => {
  if (userUid) {
    setOneSignalExternalId(userUid);
  }
};

export const clearNotifications = () => {
  removeOneSignalExternalId();
};

export const sendSystemNotification = async (title: string, options: any = {}) => {
  // OneSignal handles this automatically via push
  console.log('[Notification] Local notification request (handled by OneSignal):', title, options);
};
