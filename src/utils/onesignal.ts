import OneSignal from 'react-onesignal';
import { Capacitor } from '@capacitor/core';

const ONESIGNAL_APP_ID = '68ee3ceb-4271-43b7-bc1d-60b12ab3223c';

export const initOneSignal = async () => {
  if (Capacitor.isNativePlatform()) {
    // Native Mobile (Android/iOS) using cordova-plugin-onesignal
    const OneSignalNative = (window as any).plugins?.OneSignal;
    if (OneSignalNative) {
      OneSignalNative.setAppId(ONESIGNAL_APP_ID);
      OneSignalNative.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
        console.log('[OneSignal] Native user response:', accepted);
      });
    }
  } else {
    // Web implementation
    try {
      // Check if we are in a known environment where OneSignal might not be configured
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: 'OneSignalSDKWorker.js',
        notifyButton: {
          enable: true,
          prenotify: true,
          showCredit: false,
          text: {
            'tip.state.unsubscribed': 'Berlangganan notifikasi',
            'tip.state.subscribed': 'Anda sudah berlangganan',
            'tip.state.blocked': 'Anda memblokir notifikasi',
            'message.prenotify': 'Klik untuk berlangganan notifikasi push',
            'message.action.subscribed': 'Terima kasih sudah berlangganan!',
            'message.action.resubscribed': 'Anda berlangganan kembali',
            'message.action.unsubscribed': 'Anda berhenti berlangganan',
            'dialog.main.title': 'Kelola Notifikasi',
            'dialog.main.button.subscribe': 'BERLANGGANAN',
            'dialog.main.button.unsubscribe': 'BERHENTI BERLANGGANAN',
            'dialog.blocked.title': 'Buka Blokir Notifikasi',
            'dialog.blocked.message': 'Ikuti instruksi ini untuk mengizinkan notifikasi:'
          } as any
        },
      });
      console.log('[OneSignal] Web SDK initialized');
    } catch (e: any) {
      // Catch specific configuration errors silently in dev
      if (e?.message?.includes('App not configured for web push')) {
        console.warn('[OneSignal] Web Push is not configured for this App ID or Domain. Push notifications will be disabled in Web.');
      } else {
        console.error('[OneSignal] Web Init Error:', e);
      }
    }
  }
};

export const setOneSignalExternalId = (id: string) => {
  try {
    if (Capacitor.isNativePlatform()) {
      (window as any).plugins?.OneSignal?.setExternalUserId(id);
    } else {
      (OneSignal as any).setExternalUserId(id);
    }
  } catch (e) {
    console.warn('[OneSignal] Failed to set external ID:', e);
  }
};

export const removeOneSignalExternalId = () => {
  try {
    if (Capacitor.isNativePlatform()) {
      (window as any).plugins?.OneSignal?.removeExternalUserId();
    } else {
      (OneSignal as any).removeExternalUserId();
    }
  } catch (e) {
    console.warn('[OneSignal] Failed to remove external ID:', e);
  }
};
