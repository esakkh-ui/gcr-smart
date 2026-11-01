import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCircle,
  PhoneCall,
  MapPin,
  Clock,
  User,
  Maximize2,
  X,
} from 'lucide-react';
import { formatDateTime, formatHouseLabel } from '../../utils/formatters';

// Shared unlocked AudioContext for iOS Safari / WebKit compatibility
let sharedAudioContext: AudioContext | null = null;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioCtx();
  }
  return sharedAudioContext;
}

// Synthesize police/emergency siren sound using browser Web Audio API (with iOS WebKit unlock support)
class SirenAudioSynthesizer {
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  public isPlaying = false;

  start(): boolean {
    try {
      const ctx = getOrCreateAudioContext();
      if (!ctx) return false;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!this.isPlaying) {
        this.osc = ctx.createOscillator();
        this.gain = ctx.createGain();

        this.osc.type = 'sawtooth';
        this.osc.frequency.setValueAtTime(750, ctx.currentTime);
        this.gain.gain.setValueAtTime(0.2, ctx.currentTime);

        this.osc.connect(this.gain);
        this.gain.connect(ctx.destination);
        this.osc.start();
        this.isPlaying = true;

        let high = false;
        this.interval = setInterval(() => {
          const activeCtx = sharedAudioContext;
          if (!activeCtx || !this.osc || activeCtx.state !== 'running') return;
          try {
            const targetFreq = high ? 600 : 1200;
            this.osc.frequency.exponentialRampToValueAtTime(
              targetFreq,
              activeCtx.currentTime + 0.35
            );
            high = !high;
          } catch {}
        }, 380);
      }

      // Trigger haptic vibration on devices that support it (safely guarded for iOS Safari where vibrate is undefined)
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate([400, 200, 400]);
        } catch {}
      }

      return ctx.state === 'running';
    } catch (e) {
      console.warn('AudioContext failed to start (autoplay policy):', e);
      return false;
    }
  }

  resumeIfSuspended(): boolean {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!this.isPlaying) {
      return this.start();
    }
    return ctx.state === 'running';
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {}
      this.osc = null;
    }
    if (this.gain) {
      try {
        this.gain.disconnect();
      } catch {}
      this.gain = null;
    }
    this.isPlaying = false;
  }
}

export const EmergencyAlertModal: React.FC = () => {
  const { activePanicAlert, resolvePanicAlert, settings, houses } = useData();
  const { currentUser } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [needsIOSAudioUnlock, setNeedsIOSAudioUnlock] = useState(false);
  const [isPhotoZoomOpen, setIsPhotoZoomOpen] = useState(false);
  const sirenRef = useRef<SirenAudioSynthesizer | null>(null);

  // Unlock iOS WebKit AudioContext silently on the user's first touch/click anywhere in the app
  useEffect(() => {
    const unlockIOSAudio = () => {
      try {
        const ctx = getOrCreateAudioContext();
        if (ctx && ctx.state === 'suspended') {
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
          ctx.resume().catch(() => {});
        }
      } catch {}
    };

    window.addEventListener('touchstart', unlockIOSAudio, { once: true, passive: true });
    window.addEventListener('click', unlockIOSAudio, { once: true, passive: true });

    return () => {
      window.removeEventListener('touchstart', unlockIOSAudio);
      window.removeEventListener('click', unlockIOSAudio);
    };
  }, []);

  useEffect(() => {
    if (activePanicAlert && !isMuted) {
      if (!sirenRef.current) {
        sirenRef.current = new SirenAudioSynthesizer();
      }
      const running = sirenRef.current.start();
      const ctx = getOrCreateAudioContext();
      if (!running && ctx && ctx.state === 'suspended') {
        setNeedsIOSAudioUnlock(true);
        const resumeOnTouch = () => {
          sirenRef.current?.resumeIfSuspended();
          setNeedsIOSAudioUnlock(false);
        };
        window.addEventListener('touchstart', resumeOnTouch, { once: true, passive: true });
        window.addEventListener('click', resumeOnTouch, { once: true, passive: true });
        return () => {
          window.removeEventListener('touchstart', resumeOnTouch);
          window.removeEventListener('click', resumeOnTouch);
          sirenRef.current?.stop();
        };
      } else {
        setNeedsIOSAudioUnlock(false);
      }
    } else {
      if (sirenRef.current) {
        sirenRef.current.stop();
      }
      setNeedsIOSAudioUnlock(false);
    }

    return () => {
      if (sirenRef.current) {
        sirenRef.current.stop();
      }
    };
  }, [activePanicAlert, isMuted]);

  if (!activePanicAlert) return null;

  const matchedHouse = houses.find(h => h.houseId === activePanicAlert.houseId);
  const displayHouseLabel = formatHouseLabel(matchedHouse, activePanicAlert.houseLabel);

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (sirenRef.current) {
        sirenRef.current.start();
        sirenRef.current.resumeIfSuspended();
      }
      setNeedsIOSAudioUnlock(false);
    } else {
      setIsMuted(true);
      if (sirenRef.current) sirenRef.current.stop();
    }
  };

  const handleManualUnlockAudio = () => {
    if (!sirenRef.current) {
      sirenRef.current = new SirenAudioSynthesizer();
    }
    sirenRef.current.resumeIfSuspended();
    setNeedsIOSAudioUnlock(false);
  };

  const handleResolve = () => {
    if (sirenRef.current) sirenRef.current.stop();
    setIsPhotoZoomOpen(false);
    const resolverName = currentUser
      ? `${currentUser.fullName} (${currentUser.role === 'ADMINISTRATOR' ? 'Admin RT' : 'Warga'})`
      : 'Warga / Satpam';
    resolvePanicAlert(activePanicAlert.alertId, resolverName);
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-4 border-rose-600 my-auto max-h-[92dvh] flex flex-col">
          {/* Top Pulsing Emergency Banner */}
          <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 p-4 sm:p-5 text-white text-center relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-rose-500/20 animate-pulse pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse" />
              </div>
              <span className="text-rose-100 text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
                Peringatan Darurat Warga
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                SINYAL PANIK AKTIF!
              </h2>
              <p className="text-[11px] sm:text-xs text-rose-100 font-medium">
                Notifikasi darurat aktif di seluruh akun warga & pengurus RT
              </p>
            </div>
          </div>

          {/* Content Details */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {needsIOSAudioUnlock && !isMuted && (
              <button
                type="button"
                onClick={handleManualUnlockAudio}
                className="w-full min-h-[44px] py-2.5 px-3 bg-amber-100 border-2 border-amber-400 text-amber-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Volume2 className="w-4 h-4 text-amber-700 animate-bounce shrink-0" />
                <span>Ketuk di Sini untuk Bunyikan Suara Sirine (iPhone/iOS)</span>
              </button>
            )}

            {/* Alert Main Info Card */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl sm:rounded-2xl p-3.5 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-rose-700">Lokasi Kejadian</div>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {displayHouseLabel}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-rose-200/80 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Pelapor: <strong>{activePanicAlert.residentName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-mono tabular-nums">
                    {formatDateTime(activePanicAlert.timestamp)}
                  </span>
                </div>
              </div>

              {activePanicAlert.notes && (
                <div className="p-2.5 bg-white border border-rose-200 rounded-xl text-xs text-slate-800 space-y-0.5">
                  <span className="font-semibold text-rose-700 block">
                    Pesan / Catatan Darurat:
                  </span>
                  <p className="text-slate-900 font-medium">{activePanicAlert.notes}</p>
                </div>
              )}

              {activePanicAlert.imageUrl && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-700">Foto Lampiran Kejadian:</span>
                    <button
                      type="button"
                      onClick={() => setIsPhotoZoomOpen(true)}
                      className="text-rose-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Perbesar Foto</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhotoZoomOpen(true)}
                    className="relative block w-full rounded-xl overflow-hidden border border-rose-200 bg-white group cursor-pointer"
                  >
                    <img
                      src={activePanicAlert.imageUrl}
                      alt={`Foto darurat ${displayHouseLabel}`}
                      referrerPolicy="no-referrer"
                      className="w-full max-h-52 object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-3 py-2 flex items-center justify-end">
                      <span className="text-[11px] font-semibold text-white flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Ketuk untuk memperbesar
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions & Emergency Contacts */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-600">Tindakan Cepat</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={`tel:${(settings.adminContactPhone || '081234567890').replace(/\s+/g, '')}`}
                  className="min-h-[44px] flex items-center justify-center gap-2 p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hubungi Pos Satpam/RT</span>
                </a>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`min-h-[44px] flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition border cursor-pointer whitespace-nowrap ${
                    isMuted
                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <Volume2 className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Nyalakan Suara Siren</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Matikan Suara Siren</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Resolve / Clear Emergency Button */}
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResolve}
                className="w-full min-h-[48px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              >
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>Selesaikan & Matikan Alarm</span>
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-1.5">
                Tekan tombol ini jika keadaan darurat telah tertangani secara aman.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox for SOS Image */}
      {isPhotoZoomOpen && activePanicAlert.imageUrl && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setIsPhotoZoomOpen(false)}
        >
          <div
            className="w-full max-w-3xl flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white">
              <div className="text-sm font-bold truncate">
                Foto SOS — {displayHouseLabel} ({activePanicAlert.residentName})
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoZoomOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                aria-label="Tutup Foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={activePanicAlert.imageUrl}
              alt={`Foto penuh darurat ${displayHouseLabel}`}
              referrerPolicy="no-referrer"
              className="max-h-[78dvh] w-auto max-w-full rounded-2xl object-contain border border-white/20"
            />
          </div>
        </div>
      )}
    </>
  );
};
