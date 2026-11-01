import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/client';
import {
  House,
  Resident,
  IplRate,
  IplInvoice,
  PaymentSubmission,
  CashTransaction,
  Announcement,
  Complaint,
  ComplaintUpdate,
  Poll,
  PollVote,
  CommunityEvent,
  EventRegistration,
  CommunitySettings,
  AuditLog,
  PanicAlert,
} from '../types';
import { useAuth } from './AuthContext';

export const sanitizeIplNominalOptions = (raw: unknown): [number, number, number, number] => {
  const DEFAULT_IPL_NOMINAL_OPTIONS: [number, number, number, number] = [150000, 200000, 250000, 300000];
  if (Array.isArray(raw) && raw.length >= 4) {
    const parsed = raw.slice(0, 4).map((val, idx) => {
      const num = Math.round(Number(val));
      return Number.isFinite(num) && num > 0 ? num : DEFAULT_IPL_NOMINAL_OPTIONS[idx];
    });
    return [parsed[0], parsed[1], parsed[2], parsed[3]];
  }
  return [...DEFAULT_IPL_NOMINAL_OPTIONS];
};

interface DataContextType {
  houses: House[];
  residents: Resident[];
  iplRates: IplRate[];
  invoices: IplInvoice[];
  paymentSubmissions: PaymentSubmission[];
  cashTransactions: CashTransaction[];
  announcements: Announcement[];
  complaints: Complaint[];
  complaintUpdates: ComplaintUpdate[];
  polls: Poll[];
  pollVotes: PollVote[];
  events: CommunityEvent[];
  eventRegistrations: EventRegistration[];
  settings: CommunitySettings;
  auditLogs: AuditLog[];
  panicAlerts: PanicAlert[];
  activePanicAlert: PanicAlert | null;
  latestAnnouncementNotice: { id: string; title: string; category: string; timestamp: string } | null;
  dismissAnnouncementNotice: () => void;

  triggerPanicAlert: (data: any) => Promise<void>;
  resolvePanicAlert: (alertId: string, resolvedBy: string) => Promise<void>;
  addHouse: (house: any) => Promise<void>;
  updateHouse: (houseId: string, updates: any) => Promise<void>;
  deleteHouse: (houseId: string) => Promise<void>;
  addResident: (resident: any) => Promise<void>;
  updateResident: (residentId: string, updates: any) => Promise<void>;
  deleteResident: (residentId: string) => Promise<void>;
  generateMonthlyInvoices: (period: string, amount: number) => Promise<void>;
  submitPayment: (submission: any) => Promise<void>;
  verifyPayment: (submissionId: string, adminName: string, adminUid: string) => Promise<void>;
  rejectPayment: (submissionId: string, reason: string, adminName: string) => Promise<void>;
  recordDirectPayment: (data: any) => Promise<void>;
  addCashTransaction: (trx: any) => Promise<void>;
  updateCashTransaction: (transactionId: string, updates: any) => Promise<void>;
  deleteCashTransaction: (transactionId: string) => Promise<void>;
  saveAnnouncement: (ann: any, id?: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  createComplaint: (cmp: any) => Promise<void>;
  addComplaintUpdate: (update: any) => Promise<void>;
  updateComplaintStatus: (complaintId: string, status: any) => Promise<void>;
  createPoll: (poll: any) => Promise<void>;
  voteInPoll: (pollId: string, optionIndex: number, userUid: string) => Promise<void>;
  finishPoll: (pollId: string) => Promise<void>;
  deletePoll: (pollId: string) => Promise<void>;
  saveEvent: (evt: any, id?: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registerForEvent: (eventId: string, userUid: string, houseId: string, fullName: string) => Promise<boolean>;
  cancelEventRegistration: (eventId: string, userUid: string) => Promise<void>;
  updateSettings: (newSettings: any) => Promise<void>;
  refreshDataFromCloud: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [iplRates, setIplRates] = useState<IplRate[]>([]);
  const [invoices, setInvoices] = useState<IplInvoice[]>([]);
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintUpdates, setComplaintUpdates] = useState<ComplaintUpdate[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollVotes, setPollVotes] = useState<PollVote[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [settings, setSettings] = useState<CommunitySettings>({
    communityName: 'Grand Ciledug Raya',
    locationName: 'Ciledug, Tangerang',
    defaultIplAmount: 150000,
    iplNominalOptions: [150000, 200000, 250000, 300000],
    dueDayOfMonth: 10,
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    adminContactPhone: '',
    announcementNotice: '',
    staffInfo: {
      ketuaPaguyuban: { name: '', phone: '' },
      wakilKetua: { name: '', phone: '' },
      sekretaris: { name: '', phone: '' },
      bendahara: { name: '', phone: '' },
      keamanan: { name: '', phone: '' },
      petugasSampah: { name: '', phone: '' },
    }
  } as CommunitySettings);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [panicAlerts, setPanicAlerts] = useState<PanicAlert[]>([]);
  const [activePanicAlert, setActivePanicAlert] = useState<PanicAlert | null>(null);
  const [latestAnnouncementNotice, setLatestAnnouncementNotice] = useState<{
    id: string;
    title: string;
    category: string;
    timestamp: string;
  } | null>(null);

  const dismissAnnouncementNotice = useCallback(() => {
    if (latestAnnouncementNotice) {
      localStorage.setItem(`gcr_dismissed_notice_${latestAnnouncementNotice.id}`, '1');
      setLatestAnnouncementNotice(null);
    }
  }, [latestAnnouncementNotice]);

  const refreshDataFromCloud = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await apiClient.get('/sync');
      const data = response.data;
      
      setHouses(data.houses || []);
      setResidents(data.residents || []);
      setIplRates(data.iplRates || []);
      setInvoices(data.invoices || []);
      setPaymentSubmissions(data.paymentSubmissions || []);
      setCashTransactions(data.cashTransactions || []);
      setAnnouncements(data.announcements || []);
      setComplaints(data.complaints || []);
      setComplaintUpdates(data.complaintUpdates || []);
      setPolls(data.polls || []);
      setPollVotes(data.pollVotes || []);
      setEvents(data.events || []);
      setEventRegistrations(data.eventRegistrations || []);
      setSettings(data.settings || {});
      setAuditLogs(data.auditLogs || []);
      setPanicAlerts(data.panicAlerts || []);
      
      const active = data.panicAlerts?.find((a: PanicAlert) => a.status === 'ACTIVE') || null;
      setActivePanicAlert(active);

      // Announcement Notice
      if (data.latestAnnouncement) {
        const ann = data.latestAnnouncement;
        const dismissedLocal = localStorage.getItem(`gcr_dismissed_notice_${ann.id}`);
        if (!dismissedLocal) {
          setLatestAnnouncementNotice({
            id: ann.id,
            title: ann.title,
            category: ann.category || 'Informasi Umum',
            timestamp: ann.timestamp || new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error('Failed to sync data from VPS:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      refreshDataFromCloud();
      // Periodic polling as a fallback for real-time
      const interval = setInterval(refreshDataFromCloud, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, refreshDataFromCloud]);

  // Actions
  const triggerPanicAlert = async (data: any) => {
    await apiClient.post('/sos', data);
    refreshDataFromCloud();
  };

  const resolvePanicAlert = async (alertId: string, resolvedBy: string) => {
    await apiClient.patch(`/sos/${alertId}/resolve`, { resolvedBy });
    refreshDataFromCloud();
  };

  const addHouse = async (house: any) => {
    await apiClient.post('/houses', house);
    refreshDataFromCloud();
  };

  const updateHouse = async (houseId: string, updates: any) => {
    await apiClient.patch(`/houses/${houseId}`, updates);
    refreshDataFromCloud();
  };

  const deleteHouse = async (houseId: string) => {
    await apiClient.delete(`/houses/${houseId}`);
    refreshDataFromCloud();
  };

  const addResident = async (resident: any) => {
    await apiClient.post('/residents', resident);
    refreshDataFromCloud();
  };

  const updateResident = async (residentId: string, updates: any) => {
    await apiClient.patch(`/residents/${residentId}`, updates);
    refreshDataFromCloud();
  };

  const deleteResident = async (residentId: string) => {
    await apiClient.delete(`/residents/${residentId}`);
    refreshDataFromCloud();
  };

  const generateMonthlyInvoices = async (period: string, amount: number) => {
    await apiClient.post('/invoices/generate', { period, amount });
    refreshDataFromCloud();
  };

  const submitPayment = async (submission: any) => {
    await apiClient.post('/payments', submission);
    refreshDataFromCloud();
  };

  const verifyPayment = async (submissionId: string, adminName: string, adminUid: string) => {
    await apiClient.patch(`/payments/${submissionId}/verify`, { adminName, adminUid });
    refreshDataFromCloud();
  };

  const rejectPayment = async (submissionId: string, reason: string, adminName: string) => {
    await apiClient.patch(`/payments/${submissionId}/reject`, { reason, adminName });
    refreshDataFromCloud();
  };

  const recordDirectPayment = async (data: any) => {
    await apiClient.post('/payments/direct', data);
    refreshDataFromCloud();
  };

  const addCashTransaction = async (trx: any) => {
    await apiClient.post('/transactions', trx);
    refreshDataFromCloud();
  };

  const updateCashTransaction = async (transactionId: string, updates: any) => {
    await apiClient.patch(`/transactions/${transactionId}`, updates);
    refreshDataFromCloud();
  };

  const deleteCashTransaction = async (transactionId: string) => {
    await apiClient.delete(`/transactions/${transactionId}`);
    refreshDataFromCloud();
  };

  const saveAnnouncement = async (ann: any, id?: string) => {
    if (id) {
      await apiClient.patch(`/announcements/${id}`, ann);
    } else {
      await apiClient.post('/announcements', ann);
    }
    refreshDataFromCloud();
  };

  const deleteAnnouncement = async (id: string) => {
    await apiClient.delete(`/announcements/${id}`);
    refreshDataFromCloud();
  };

  const createComplaint = async (cmp: any) => {
    await apiClient.post('/complaints', cmp);
    refreshDataFromCloud();
  };

  const addComplaintUpdate = async (update: any) => {
    await apiClient.post('/complaint-updates', update);
    refreshDataFromCloud();
  };

  const updateComplaintStatus = async (complaintId: string, status: any) => {
    await apiClient.patch(`/complaints/${complaintId}/status`, { status });
    refreshDataFromCloud();
  };

  const createPoll = async (poll: any) => {
    await apiClient.post('/polls', poll);
    refreshDataFromCloud();
  };

  const voteInPoll = async (pollId: string, optionIndex: number, userUid: string) => {
    await apiClient.post(`/polls/${pollId}/vote`, { optionIndex, userUid });
    refreshDataFromCloud();
  };

  const finishPoll = async (pollId: string) => {
    await apiClient.patch(`/polls/${pollId}/finish`);
    refreshDataFromCloud();
  };

  const deletePoll = async (pollId: string) => {
    await apiClient.delete(`/polls/${pollId}`);
    refreshDataFromCloud();
  };

  const saveEvent = async (evt: any, id?: string) => {
    if (id) {
      await apiClient.patch(`/events/${id}`, evt);
    } else {
      await apiClient.post('/events', evt);
    }
    refreshDataFromCloud();
  };

  const deleteEvent = async (id: string) => {
    await apiClient.delete(`/events/${id}`);
    refreshDataFromCloud();
  };

  const registerForEvent = async (eventId: string, userUid: string, houseId: string, fullName: string) => {
    try {
      await apiClient.post(`/events/${eventId}/register`, { userUid, houseId, fullName });
      refreshDataFromCloud();
      return true;
    } catch {
      return false;
    }
  };

  const cancelEventRegistration = async (eventId: string, userUid: string) => {
    await apiClient.delete(`/events/${eventId}/register/${userUid}`);
    refreshDataFromCloud();
  };

  const updateSettings = async (newSettings: any) => {
    await apiClient.patch('/settings', newSettings);
    refreshDataFromCloud();
  };

  return (
    <DataContext.Provider
      value={{
        houses,
        residents,
        iplRates,
        invoices,
        paymentSubmissions,
        cashTransactions,
        announcements,
        complaints,
        complaintUpdates,
        polls,
        pollVotes,
        events,
        eventRegistrations,
        settings,
        auditLogs,
        panicAlerts,
        activePanicAlert,
        latestAnnouncementNotice,
        dismissAnnouncementNotice,
        triggerPanicAlert,
        resolvePanicAlert,
        addHouse,
        updateHouse,
        deleteHouse,
        addResident,
        updateResident,
        deleteResident,
        generateMonthlyInvoices,
        submitPayment,
        verifyPayment,
        rejectPayment,
        recordDirectPayment,
        addCashTransaction,
        updateCashTransaction,
        deleteCashTransaction,
        saveAnnouncement,
        deleteAnnouncement,
        createComplaint,
        addComplaintUpdate,
        updateComplaintStatus,
        createPoll,
        voteInPoll,
        finishPoll,
        deletePoll,
        saveEvent,
        deleteEvent,
        registerForEvent,
        cancelEventRegistration,
        updateSettings,
        refreshDataFromCloud,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
