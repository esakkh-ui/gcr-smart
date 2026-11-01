import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/common/Layout';
import { LoginPage } from './components/auth/LoginPage';
import { PendingApprovalPage, AccessDeniedPage } from './components/auth/RestrictedPages';
import { initOneSignal } from './utils/onesignal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HouseManagement } from './components/admin/HouseManagement';
import { ResidentManagement } from './components/admin/ResidentManagement';
import { AccountApprovals } from './components/admin/AccountApprovals';
import { IPLBilling } from './components/admin/IPLBilling';
import { PaymentVerification } from './components/admin/PaymentVerification';
import { FinancialLedger } from './components/admin/FinancialLedger';
import { AnnouncementsAdmin } from './components/admin/AnnouncementsAdmin';
import { ComplaintsAdmin } from './components/admin/ComplaintsAdmin';
import { EventsAdmin } from './components/admin/EventsAdmin';
import { ReportsAdmin } from './components/admin/ReportsAdmin';
import { SettingsAdmin } from './components/admin/SettingsAdmin';
import { PollsAdmin } from './components/admin/PollsAdmin';
import { TataTertibPage } from './components/common/TataTertibPage';
import SupportPortal from './components/SupportPortal';

// Warga Components
import { ResidentDashboard } from './components/warga/ResidentDashboard';
import { HouseProfileResident } from './components/warga/HouseProfileResident';
import { IPLInvoicesResident } from './components/warga/IPLInvoicesResident';
import { PaymentHistoryResident } from './components/warga/PaymentHistoryResident';
import { FinancialTransparencyResident } from './components/warga/FinancialTransparencyResident';
import { AnnouncementsResident } from './components/warga/AnnouncementsResident';
import { ComplaintsResident } from './components/warga/ComplaintsResident';
import { EventsResident } from './components/warga/EventsResident';
import { ProfileResident } from './components/warga/ProfileResident';
import { PollsResident } from './components/warga/PollsResident';

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/support" element={<SupportPortal />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    );
  }

  if (currentUser.status === 'PENDING') {
    return (
      <Layout>
        <Routes>
          <Route path="/pending" element={<PendingApprovalPage />} />
          <Route path="*" element={<Navigate to="/pending" replace />} />
        </Routes>
      </Layout>
    );
  }

  if (currentUser.status === 'REJECTED' || currentUser.status === 'SUSPENDED') {
    return (
      <Layout>
        <Routes>
          <Route path="/unauthorized" element={<AccessDeniedPage />} />
          <Route path="*" element={<Navigate to="/unauthorized" replace />} />
        </Routes>
      </Layout>
    );
  }

  if (currentUser.role === 'ADMINISTRATOR') {
    return (
      <Layout>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/houses" element={<HouseManagement />} />
          <Route path="/admin/residents" element={<Navigate to="/admin/houses" replace />} />
          <Route path="/admin/approvals" element={<AccountApprovals />} />
          <Route path="/admin/ipl" element={<IPLBilling />} />
          <Route path="/admin/verifications" element={<PaymentVerification />} />
          <Route path="/admin/finance" element={<FinancialLedger />} />
          <Route path="/admin/announcements" element={<AnnouncementsAdmin />} />
          <Route path="/admin/complaints" element={<ComplaintsAdmin />} />
          <Route path="/admin/events" element={<EventsAdmin />} />
          <Route path="/admin/reports" element={<ReportsAdmin />} />
          <Route path="/admin/settings" element={<SettingsAdmin />} />
          <Route path="/admin/polls" element={<PollsAdmin />} />
          <Route path="/admin/rules" element={<TataTertibPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/warga" element={<ResidentDashboard />} />
        <Route path="/warga/house" element={<HouseProfileResident />} />
        <Route path="/warga/invoices" element={<IPLInvoicesResident />} />
        <Route path="/warga/history" element={<PaymentHistoryResident />} />
        <Route path="/warga/finance" element={<FinancialTransparencyResident />} />
        <Route path="/warga/announcements" element={<AnnouncementsResident />} />
        <Route path="/warga/complaints" element={<ComplaintsResident />} />
        <Route path="/warga/events" element={<EventsResident />} />
        <Route path="/warga/profile" element={<ProfileResident />} />
        <Route path="/warga/polls" element={<PollsResident />} />
        <Route path="/warga/rules" element={<TataTertibPage />} />
        <Route path="*" element={<Navigate to="/warga" replace />} />
      </Routes>
    </Layout>
  );
};


export default function App() {
  React.useEffect(() => {
    initOneSignal();

    // Suppress annoying WebSocket errors from Vite HMR in the browser console
    // This is useful for cleaner logs when working in the AI Studio environment
    const handleGlobalError = (event: ErrorEvent) => {
      if (
        event.message?.includes('WebSocket') ||
        event.message?.includes('HMR') ||
        event.filename?.includes('@vite/client')
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('WebSocket')) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    return () => {
      window.removeEventListener('error', handleGlobalError, true);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
