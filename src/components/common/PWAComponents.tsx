import React, { useEffect, useState } from 'react';
import { Download, WifiOff, Share, PlusSquare, Compass, Smartphone, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function useIOSAndPWAStatus() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSInAppBrowser, setIsIOSInAppBrowser] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
    };

    checkStandalone();

    const ua = window.navigator.userAgent || '';
    const uaLower = ua.toLowerCase();
    // Detect iPhone, iPod, iPad, AND iPadOS 13+ (reports MacIntel with multi-touch)
    const isIPadOS =
      window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
    const isIOSDevice = /iphone|ipad|ipod/.test(uaLower) || isIPadOS;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Detect WhatsApp, Instagram, Line, Facebook, TikTok in-app WebViews where Add to Home Screen is hidden
      const inApp = /whatsapp|instagram|fbav|fban|line\/|tiktok|wv/i.test(ua);
      setIsIOSInAppBrowser(inApp);
    }

    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = () => checkStandalone();
    if (displayModeQuery.addEventListener) {
      displayModeQuery.addEventListener('change', handleDisplayChange);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (displayModeQuery.removeEventListener) {
        displayModeQuery.removeEventListener('change', handleDisplayChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installChromium = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isIOSInAppBrowser,
    installChromium,
  };
}

export const IOSInstallGuideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isIOSInAppBrowser?: boolean;
}> = ({ isOpen, onClose, isIOSInAppBrowser }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    const url = window.location.origin;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch {}
      document.body.removeChild(textarea);
    }
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {/* Mobile Sheet Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-slate-300" />
        </div>

        <div className="px-5 pt-3 sm:pt-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/apple-touch-icon.png"
              alt="GCR Warga"
              className="w-11 h-11 rounded-xl shadow-sm border border-slate-200 shrink-0"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Pasang GCR di iPhone / iPad
              </h3>
              <p className="text-xs text-slate-500">
                Akses cepat layar penuh seperti aplikasi iOS asli
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Tutup panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs text-slate-700">
          {isIOSInAppBrowser && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-start gap-2 text-amber-900 font-bold">
                <Compass className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Anda membuka dari dalam aplikasi (WhatsApp/Sosmed)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Ketuk ikon <strong>Kompas / Buka di Safari</strong> di pojok kanan bawah terlebih dahulu, atau salin tautan ini lalu tempel di <strong>Safari</strong> iPhone Anda:
              </p>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="w-full py-2 px-3 bg-white border border-amber-300 rounded-lg text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {copiedUrl ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tautan Berhasil Disalin! Buka Safari</span>
                  </>
                ) : (
                  <span>Salin Tautan untuk Safari</span>
                )}
              </button>
            </div>
          )}

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div className="space-y-1 flex-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span>Ketuk tombol</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-blue-600 font-semibold">
                    <Share className="w-3.5 h-3.5" />
                    <span>Bagikan (Share)</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Terletak di bilah menu bawah Safari iPhone (atau kanan atas di iPad / Chrome iOS).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div className="space-y-1 flex-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span>Pilih</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-semibold">
                    <PlusSquare className="w-3.5 h-3.5 text-slate-700" />
                    <span>Tambah ke Layar Utama</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Geser daftar menu ke bawah hingga muncul <em>"Add to Home Screen"</em>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="font-bold text-slate-900">
                  Ketuk <span className="text-blue-600">"Tambah" (Add)</span> di pojok kanan atas
                </div>
                <p className="text-[11px] text-slate-500">
                  Ikon <strong>GCR Warga</strong> kini tersimpan di layar utama iPhone Anda!
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl bg-[#142D4E] hover:bg-[#1f4068] text-sm font-bold text-white transition cursor-pointer shadow-sm"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'drawer' | 'card' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, isIOSInAppBrowser, installChromium } =
    useIOSAndPWAStatus();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    if (variant === 'drawer' || variant === 'card') {
      return (
        <button
          type="button"
          onClick={installChromium}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Install Aplikasi GCR ke HP</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={installChromium}
        className="min-h-[38px] flex items-center gap-1.5 rounded-xl bg-blue-600 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
        title="Install Aplikasi ke Perangkat"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Install Aplikasi</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        {variant === 'card' ? (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#142D4E] text-white flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  Pengguna iPhone / iPad?
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Pasang ke Layar Utama iOS Anda
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSGuide(true)}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#142D4E] text-white text-xs font-bold shrink-0 hover:bg-[#1f4068] transition cursor-pointer"
            >
              Cara Pasang
            </button>
          </div>
        ) : variant === 'drawer' ? (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs font-bold text-blue-800 hover:bg-blue-100 transition cursor-pointer"
          >
            <Share className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Pasang di Layar Utama iPhone / iOS</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="min-h-[38px] flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Pasang ke Layar Utama iPhone / iPad"
          >
            <Share className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="hidden sm:inline">Pasang di iPhone</span>
            <span className="sm:hidden">iOS</span>
          </button>
        )}

        <IOSInstallGuideModal
          isOpen={showIOSGuide}
          onClose={() => setShowIOSGuide(false)}
          isIOSInAppBrowser={isIOSInAppBrowser}
        />
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg">
      <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
      <span>Mode Offline — Menampilkan data tersimpan di perangkat.</span>
    </div>
  );
};
