import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PWAInstallButton, OfflineIndicator } from './PWAComponents';
import { EmergencyAlertModal } from './EmergencyAlertModal';
import { PanicButtonModal } from './PanicButtonModal';
import { requestNotificationPermission, sendSystemNotification } from '../../utils/notifications';
import {
  LayoutDashboard,
  Home,
  UserCheck,
  Receipt,
  CheckCircle2,
  Wallet,
  Megaphone,
  MessageSquareWarning,
  Calendar,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  BellRing,
  FileText,
  BarChart3,
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, users } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const navigate = useNavigate();

  // Notification sound effect
  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  };

  // State to track previous counts for real-time sound trigger (Admin only)
  const [prevPendingCounts, setPrevPendingCounts] = useState({ approvals: 0, verifications: 0, complaints: 0 });

  const {
    residents,
    paymentSubmissions,
    complaints,
    invoices,
    polls,
    announcements,
    latestAnnouncementNotice,
    dismissAnnouncementNotice,
    settings, // Destructure settings
  } = useData();

  const isAdmin = currentUser?.role === 'ADMINISTRATOR';
  const isWarga = currentUser?.role === 'WARGA';
  const isPending = currentUser?.status === 'PENDING';
  const isRejectedOrSuspended =
    currentUser?.status === 'REJECTED' || currentUser?.status === 'SUSPENDED';
  const showActiveNav = !!currentUser && !isPending && !isRejectedOrSuspended;

  const pendingUidSet = new Set<string>();
  users
    .filter(u => u.role === 'WARGA' && u.status === 'PENDING')
    .forEach(u => pendingUidSet.add(u.uid));
  residents
    .filter(r => r.residentStatus === 'PENDING')
    .forEach(r => {
      const matchedU = users.find(u => u.uid === r.userUid);
      if (!matchedU || matchedU.status === 'PENDING') {
        pendingUidSet.add(r.userUid);
      }
    });

  const pendingApprovalsCount = pendingUidSet.size;
  const pendingVerificationsCount = paymentSubmissions.filter(s => s.status === 'SUBMITTED').length;
  const pendingComplaintsCount = complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'IN_PROGRESS').length;

  const [eightAmNotice, setEightAmNotice] = useState<string | null>(null);

  // OneSignal is initialized in App.tsx root

  // Sound Effect and System Notification for Admin
  React.useEffect(() => {
    // Request permission once on mount or when user becomes admin
    if (isAdmin) {
      requestNotificationPermission();
    }

    if (isAdmin) {
      if (
        pendingApprovalsCount > prevPendingCounts.approvals ||
        pendingVerificationsCount > prevPendingCounts.verifications ||
        pendingComplaintsCount > prevPendingCounts.complaints
      ) {
        playNotificationSound();
        sendSystemNotification('GCR Smart Residence - Admin', {
          body: 'Ada pemberitahuan baru: Persetujuan, Verifikasi, atau Pengaduan.',
          tag: 'admin-alert',
        });
      }
      setPrevPendingCounts({
        approvals: pendingApprovalsCount,
        verifications: pendingVerificationsCount,
        complaints: pendingComplaintsCount,
      });
    }
  }, [isAdmin, pendingApprovalsCount, pendingVerificationsCount, pendingComplaintsCount]);

  // 8 AM Recurring Reminder
  React.useEffect(() => {
    if (!currentUser) return;

    const checkReminder = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toISOString().split('T')[0];
      const lastCheck = localStorage.getItem(`gcr_last_8am_check_${currentUser.uid}`);

      // If it's 8:00 AM or later and we haven't checked today
      if (currentHour >= 8 && lastCheck !== todayStr) {
        let reminderMsg = '';

        if (isAdmin) {
          const totalPending = pendingApprovalsCount + pendingVerificationsCount + pendingComplaintsCount;
          if (totalPending > 0) {
            reminderMsg = `Selamat pagi! Terdapat ${totalPending} pekerjaan tertunda (Persetujuan, Verifikasi, atau Pengaduan) yang perlu diselesaikan.`;
          }
        } else if (isWarga && currentUser.houseId) {
          const unpaidInvoices = invoices.filter(inv => inv.houseId === currentUser.houseId && inv.status === 'UNPAID').length;
          const activePolls = polls.filter(p => p.status === 'ACTIVE').length; // Warga should ideally only see polls they haven't voted in, but keep it simple
          
          if (unpaidInvoices > 0 || activePolls > 0) {
            reminderMsg = `Selamat pagi! Anda memiliki ${unpaidInvoices} tagihan belum dibayar dan ${activePolls} polling aktif yang menunggu partisipasi Anda.`;
          }
        }

        if (reminderMsg) {
          setEightAmNotice(reminderMsg);
          sendSystemNotification('Pengingat GCR Smart Residence', {
            body: reminderMsg,
            tag: 'daily-reminder',
            requireInteraction: true,
          });
          localStorage.setItem(`gcr_last_8am_check_${currentUser.uid}`, todayStr);
        }
      }
    };

    // Also request permission for residents
    if (isWarga) {
      requestNotificationPermission();
    }

    checkReminder();
    const interval = setInterval(checkReminder, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentUser, isAdmin, isWarga, pendingApprovalsCount, pendingVerificationsCount, pendingComplaintsCount, invoices, polls]);

  // System Notification for New Announcements
  React.useEffect(() => {
    if (isWarga && latestAnnouncementNotice) {
      const lastNotifiedId = localStorage.getItem(`gcr_last_system_notified_announcement_${currentUser?.uid}`);
      if (lastNotifiedId !== latestAnnouncementNotice.id) {
        sendSystemNotification('Pengumuman Baru - GCR', {
          body: `${latestAnnouncementNotice.title} (${latestAnnouncementNotice.category})`,
          tag: 'new-announcement',
          requireInteraction: true,
        });
        localStorage.setItem(`gcr_last_system_notified_announcement_${currentUser?.uid}`, latestAnnouncementNotice.id);
      }
    }
  }, [isWarga, latestAnnouncementNotice, currentUser]);

  // System Notification for Emergency Panic Alerts
  const { activePanicAlert } = useData();
  React.useEffect(() => {
    if (activePanicAlert && activePanicAlert.status === 'ACTIVE') {
      const lastNotifiedPanicId = localStorage.getItem(`gcr_last_system_notified_panic_${currentUser?.uid}`);
      if (lastNotifiedPanicId !== activePanicAlert.alertId) {
        sendSystemNotification('DARURAT - GCR SMART RESIDENCE', {
          body: `WARGA ${activePanicAlert.residentName.toUpperCase()} (${activePanicAlert.houseLabel}) MEMBUTUHKAN BANTUAN SEGERA!`,
          tag: 'panic-alert',
          requireInteraction: true,
          vibrate: [500, 200, 500, 200, 500],
        });
        localStorage.setItem(`gcr_last_system_notified_panic_${currentUser?.uid}`, activePanicAlert.alertId);
      }
    }
  }, [activePanicAlert, currentUser]);

  const adminNavItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, badge: 0 },
    { to: '/admin/houses', label: 'Rumah & Data Warga', icon: Home, badge: 0 },
    { to: '/admin/approvals', label: 'Persetujuan Akun', icon: UserCheck, badge: pendingApprovalsCount },
    { to: '/admin/ipl', label: 'Iuran IPL', icon: Receipt, badge: 0 },
    { to: '/admin/verifications', label: 'Verifikasi Pembayaran', icon: CheckCircle2, badge: pendingVerificationsCount },
    { to: '/admin/finance', label: 'Kas & Keuangan', icon: Wallet, badge: 0 },
    { to: '/admin/announcements', label: 'Pengumuman', icon: Megaphone, badge: 0 },
    { to: '/admin/complaints', label: 'Pengaduan', icon: MessageSquareWarning, badge: 0 },
    { to: '/admin/events', label: 'Kegiatan Warga', icon: Calendar, badge: 0 },
    { to: '/admin/reports', label: 'Laporan & Ekspor', icon: FileBarChart, badge: 0 },
    { to: '/admin/settings', label: 'Pengaturan', icon: Settings, badge: 0 },
    { to: '/admin/rules', label: 'Tata Tertib', icon: FileText, badge: 0 },
    { to: '/admin/polls', label: 'Polling Warga', icon: BarChart3, badge: 0 },
  ];

  const wargaNavItems = [
    { to: '/warga', label: 'Beranda', icon: LayoutDashboard, badge: 0 },
    { to: '/warga/house', label: 'Rumah Saya', icon: Home, badge: 0 },
    { to: '/warga/invoices', label: 'Tagihan IPL', icon: Receipt, badge: 0 },
    { to: '/warga/history', label: 'Riwayat Pembayaran', icon: CheckCircle2, badge: 0 },
    { to: '/warga/finance', label: 'Kas Transparansi', icon: Wallet, badge: 0 },
    { to: '/warga/announcements', label: 'Pengumuman', icon: Megaphone, badge: 0 },
    { to: '/warga/complaints', label: 'Pengaduan Saya', icon: MessageSquareWarning, badge: 0 },
    { to: '/warga/events', label: 'Kegiatan Warga', icon: Calendar, badge: 0 },
    { to: '/warga/profile', label: 'Profil Saya', icon: User, badge: 0 },
    { to: '/warga/rules', label: 'Tata Tertib', icon: FileText, badge: 0 },
    { to: '/warga/polls', label: 'Polling Warga', icon: BarChart3, badge: 0 },
  ];

  const navItems = isAdmin ? adminNavItems : wargaNavItems;

  // Quick bottom tab bar items for one-handed iPhone / mobile thumb navigation
  const mobileBottomTabs = isAdmin
    ? [
        { to: '/admin', shortLabel: 'Beranda', icon: LayoutDashboard, badge: 0, exact: true },
        { to: '/admin/houses', shortLabel: 'Warga', icon: Home, badge: 0, exact: false },
        { to: '/admin/approvals', shortLabel: 'Setujui', icon: UserCheck, badge: pendingApprovalsCount, exact: false },
        { to: '/admin/verifications', shortLabel: 'Verifikasi', icon: CheckCircle2, badge: pendingVerificationsCount, exact: false },
      ]
    : [
        { to: '/warga', shortLabel: 'Beranda', icon: LayoutDashboard, badge: 0, exact: true },
        { to: '/warga/invoices', shortLabel: 'Tagihan', icon: Receipt, badge: 0, exact: false },
        { to: '/warga/finance', shortLabel: 'Kas RT', icon: Wallet, badge: 0, exact: false },
        { to: '/warga/complaints', shortLabel: 'Aduan', icon: MessageSquareWarning, badge: 0, exact: false },
        { to: '/warga/profile', shortLabel: 'Profil', icon: User, badge: 0, exact: false },
      ];

  return (
    <div className="min-h-dvh bg-[#F3F6FA] text-slate-900 flex flex-col font-sans antialiased pl-safe pr-safe">
      <OfflineIndicator />

      {/* Global Ringing Emergency Alert Modal */}
      <EmergencyAlertModal />

      {/* Panic Trigger Modal */}
      <PanicButtonModal
        isOpen={isPanicModalOpen}
        onClose={() => setIsPanicModalOpen(false)}
      />

      {/* Top Header (Safe-Area Aware for iPhone Notch / Dynamic Island) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs pt-safe">
        {/* 8 AM Recurring Reminder Banner */}
        {eightAmNotice && (
          <div className="bg-amber-500 text-slate-900 px-3 sm:px-4 py-2 shadow-xs flex items-center justify-between gap-2 border-b border-amber-600">
            <div className="flex items-center gap-2 max-w-4xl min-w-0">
              <BellRing className="w-4 h-4 text-slate-900 shrink-0 animate-pulse" />
              <div className="text-xs sm:text-sm font-bold truncate">
                {eightAmNotice}
              </div>
            </div>
            <button
              onClick={() => setEightAmNotice(null)}
              className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-black/10 rounded-lg text-slate-900 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* New Announcement Notification Toast for Warga */}
        {isWarga && latestAnnouncementNotice && (
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white px-3 sm:px-4 py-2 shadow-xs flex items-center justify-between gap-2 border-b border-blue-500">
            <div className="flex items-center gap-2 max-w-4xl min-w-0">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0 animate-bounce" />
              <div className="text-xs sm:text-sm font-medium truncate">
                <span className="font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider mr-1.5">
                  BARU
                </span>
                <strong className="text-white">{latestAnnouncementNotice.title}</strong>
                <span className="hidden sm:inline text-blue-200 ml-2">
                  ({latestAnnouncementNotice.category})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  dismissAnnouncementNotice();
                  navigate('/warga/announcements');
                }}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition shadow-2xs cursor-pointer"
              >
                Baca
              </button>
              <button
                onClick={dismissAnnouncementNotice}
                className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                title="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Zone */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {showActiveNav && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden min-w-[42px] min-h-[42px] -ml-1 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer shrink-0"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white overflow-hidden shadow-sm shrink-0 border border-slate-100 flex items-center justify-center">
                <img src="/assets/aistudio/LOGO_GCR_b4e73cb9.png" alt="GCR Logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-bold tracking-tight text-[#142D4E] block leading-tight truncate">
                  GCR Smart Residence
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate">
                  Grand Ciledug Raya
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Zone */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Panic Button for Warga in Top Navbar */}
            {isWarga && !isPending && !isRejectedOrSuspended && (
              <button
                onClick={() => setIsPanicModalOpen(true)}
                className="min-h-[38px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer border border-rose-500"
                title="Tekan untuk mengirim sinyal alarm panik darurat"
              >
                <BellRing className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Panik Darurat</span>
                <span className="sm:hidden">SOS</span>
              </button>
            )}

            <PWAInstallButton variant="header" />

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-3 pl-1.5 sm:pl-3 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] font-medium text-blue-600">
                    {isAdmin ? 'Administrator' : 'Warga'}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 transition cursor-pointer"
                  title="Keluar (Logout)"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="min-h-[38px] px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition cursor-pointer"
              >
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar for Desktop */}
        {showActiveNav && (
          <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200 p-4 space-y-1">
            <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 pb-2">
              Menu {isAdmin ? 'Administrator' : 'Warga'}
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const badgeCount = item.badge || 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin' || item.to === '/warga'}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-[#142D4E] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {badgeCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-md shrink-0">
                      {badgeCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </aside>
        )}

        {/* Mobile Navigation Drawer (Safe-Area Aware for iPhone) */}
        {showActiveNav && mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-2xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-76 max-w-[85vw] bg-white h-full shadow-2xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="min-w-0">
                  <span className="font-bold text-[#142D4E] block text-sm">Menu Navigasi</span>
                  <span className="text-xs text-slate-500 truncate block">
                    {currentUser?.fullName} • {isAdmin ? 'Admin RT' : 'Warga'}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-1 flex-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const badgeCount = item.badge || 0;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/admin' || item.to === '/warga'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-2 px-3 py-3 rounded-xl text-sm font-medium transition ${
                          isActive
                            ? 'bg-[#142D4E] text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {badgeCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-md shrink-0">
                          {badgeCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
                <PWAInstallButton variant="drawer" />
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Footer (Padded on mobile when bottom tab bar is active) */}
      <footer
        className={`bg-white border-t border-slate-200 pt-4 px-4 sm:px-6 text-center text-xs text-slate-500 flex items-center justify-center max-w-7xl mx-auto w-full ${
          showActiveNav
            ? 'pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-4'
            : 'pb-[max(1rem,env(safe-area-inset-bottom,0px))]'
        }`}
      >
        <p>© 2026 GCR Smart Residence — Grand Ciledug Raya, Karang Tengah, Kota Tangerang, Banten.</p>
      </footer>

      {/* Mobile / iPhone Bottom Tab Bar for One-Handed Navigation */}
      {showActiveNav && (
        <nav
          aria-label="Navigasi Cepat Mobile"
          className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe pl-safe pr-safe shadow-[0_-2px_10px_rgba(15,23,42,0.05)]"
        >
          <div className="grid grid-cols-5 items-center h-14 max-w-lg mx-auto px-1">
            {mobileBottomTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.exact}
                  className={({ isActive }) =>
                    `relative flex flex-col items-center justify-center min-h-[48px] rounded-xl transition ${
                      isActive ? 'text-[#142D4E] font-bold' : 'text-slate-500 font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="relative">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                        {tab.badge > 0 && (
                          <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
                        {tab.shortLabel}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="relative flex flex-col items-center justify-center min-h-[48px] rounded-xl text-slate-500 font-medium hover:text-slate-900 cursor-pointer"
              >
                <Menu className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] tracking-tight mt-0.5">Menu Lain</span>
              </button>
            )}
          </div>
        </nav>
      )}
    </div>
  );
};
