import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { normalizeHouseId, DEFAULT_WARGA_PASSWORD } from '../../context/AuthContext';
import {
  House,
  Resident,
  OccupancyStatus,
  EmergencyContactRelation,
  PopulationStatus,
  DomicileLetterStatus,
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  formatEmergencyRelation,
  formatPopulationStatus,
  formatDomicileStatus,
  formatHouseLabel,
  formatDate,
  formatDateTime,
  translateStatus,
} from '../../utils/formatters';
import { compressIdentityImage } from '../../utils/imageCompressor';
import {
  Home,
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  UserPlus,
  Building,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Camera,
  Image as ImageIcon,
  Eye,
  X,
  MapPin,
  ShieldCheck,
  FileText,
  ChevronRight,
} from 'lucide-react';

export const HouseManagement: React.FC = () => {
  const { houses, residents, addHouse, updateHouse, deleteHouse, addResident, updateResident, deleteResident } = useData();
  const { users, resetWargaPassword, hasCustomWargaPassword, deleteUser } = useAuth();

  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [modalResetNotice, setModalResetNotice] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'HOUSES' | 'RESIDENTS'>('HOUSES');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedOccupancy, setSelectedOccupancy] = useState<'ALL' | 'PEMILIK' | 'PENYEWA'>('ALL');

  // Modal States
  const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);

  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // Resident Profile Modal State
  const [profileResidentId, setProfileResidentId] = useState<string | null>(null);
  const profileResident = profileResidentId
    ? residents.find(r => r.residentId === profileResidentId) || null
    : null;

  // Confirm Delete Modals
  const [deletingHouse, setDeletingHouse] = useState<House | null>(null);
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null);

  // House Form States
  const [block, setBlock] = useState('A');
  const [houseNumber, setHouseNumber] = useState('');
  const [occupancyStatus, setOccupancyStatus] = useState<OccupancyStatus>('TERISI_PEMILIK');
  const [notes, setNotes] = useState('');

  // House Form Optional Inline Resident
  const [addResidentWithHouse, setAddResidentWithHouse] = useState(false);
  const [inlineResidentName, setInlineResidentName] = useState('');
  const [inlineResidentEmail, setInlineResidentEmail] = useState('');
  const [inlineResidentPhone, setInlineResidentPhone] = useState('');

  // Resident Form States
  const [fullName, setFullName] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationship, setRelationship] = useState<any>('KEPALA_KELUARGA');
  const [occupancyType, setOccupancyType] = useState<any>('PEMILIK');
  const [originVillage, setOriginVillage] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] =
    useState<EmergencyContactRelation>('ORANG_TUA');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [populationStatus, setPopulationStatus] = useState<PopulationStatus>('BELUM_PINDAH');
  const [domicileLetterStatus, setDomicileLetterStatus] = useState<DomicileLetterStatus>('ADA');
  const [ktpPhotoUrl, setKtpPhotoUrl] = useState('');
  const [kkPhotoUrl, setKkPhotoUrl] = useState('');
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [uploadingDocType, setUploadingDocType] = useState<'KTP' | 'KK' | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<{ title: string; src: string } | null>(null);

  const ktpCamRef = useRef<HTMLInputElement>(null);
  const ktpGalRef = useRef<HTMLInputElement>(null);
  const kkCamRef = useRef<HTMLInputElement>(null);
  const kkGalRef = useRef<HTMLInputElement>(null);

  // Resident House Selection
  const [selectedHouseMode, setSelectedHouseMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [newHouseBlock, setNewHouseBlock] = useState('A');
  const [newHouseNumber, setNewHouseNumber] = useState('');

  // Open Resident Profile Modal
  const handleOpenResidentProfile = (r: Resident) => {
    setModalResetNotice(null);
    setProfileResidentId(r.residentId);
  };

  // Filtering
  const filteredHouses = houses.filter(h => {
    const q = searchTerm.trim().toLowerCase();
    const unitLabel = formatHouseLabel(h).toLowerCase();
    const houseCode = `${h.block}${h.houseNumber}`.toLowerCase();
    const houseResidents = residents.filter(
      r => normalizeHouseId(r.houseId) === normalizeHouseId(h.houseId)
    );
    const matchesSearch =
      !q ||
      unitLabel.includes(q) ||
      houseCode.includes(q) ||
      h.addressLabel.toLowerCase().includes(q) ||
      h.houseNumber.includes(q) ||
      houseResidents.some(r => r.fullName.toLowerCase().includes(q));
    const matchesBlock = selectedBlock === 'ALL' || h.block === selectedBlock;
    return matchesSearch && matchesBlock;
  });

  const filteredResidents = residents.filter(r => {
    const q = searchTerm.trim().toLowerCase();
    const house = houses.find(h => normalizeHouseId(h.houseId) === normalizeHouseId(r.houseId));
    const unitLabel = formatHouseLabel(house, r.houseId);
    const unitLower = unitLabel.toLowerCase();
    const matchesSearch =
      !q ||
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phoneNumber.includes(q) ||
      (r.originVillage || '').toLowerCase().includes(q) ||
      unitLower.includes(q);
    const matchesBlock =
      selectedBlock === 'ALL' ||
      (house
        ? house.block === selectedBlock
        : unitLabel.toUpperCase().startsWith(`BLOK ${selectedBlock}`));
    const matchesOccupancy =
      selectedOccupancy === 'ALL' ||
      (selectedOccupancy === 'PEMILIK' ? r.occupancyType === 'PEMILIK' : r.occupancyType === 'PENYEWA');
    return matchesSearch && matchesBlock && matchesOccupancy;
  });

  // Open House Modal
  const handleOpenAddHouse = () => {
    setEditingHouse(null);
    setModalResetNotice(null);
    setBlock('A');
    setHouseNumber('');
    setOccupancyStatus('TERISI_PEMILIK');
    setNotes('');
    setAddResidentWithHouse(false);
    setInlineResidentName('');
    setInlineResidentEmail('');
    setInlineResidentPhone('');
    setIsHouseModalOpen(true);
  };

  const handleOpenEditHouse = (h: House) => {
    setEditingHouse(h);
    setModalResetNotice(null);
    setBlock(h.block);
    setHouseNumber(h.houseNumber);
    setOccupancyStatus(h.occupancyStatus);
    setNotes(h.notes || '');
    setAddResidentWithHouse(false);
    setIsHouseModalOpen(true);
  };

  // Open Resident Modal
  const handleOpenAddResident = (presetHouseId?: string) => {
    setEditingResident(null);
    setModalResetNotice(null);
    setDocUploadError(null);
    setFullName('');
    setIdCardNumber('');
    setEmail('');
    setPhoneNumber('');
    setRelationship('KEPALA_KELUARGA');
    setOccupancyType('PEMILIK');
    setOriginVillage('');
    setEmergencyContactRelation('ORANG_TUA');
    setEmergencyContactPhone('');
    setPopulationStatus('BELUM_PINDAH');
    setDomicileLetterStatus('ADA');
    setKtpPhotoUrl('');
    setKkPhotoUrl('');

    if (presetHouseId && houses.some(h => h.houseId === presetHouseId)) {
      setSelectedHouseMode('EXISTING');
      setSelectedHouseId(presetHouseId);
    } else if (houses.length > 0) {
      setSelectedHouseMode('EXISTING');
      setSelectedHouseId(houses[0].houseId);
    } else {
      setSelectedHouseMode('NEW');
      setNewHouseBlock('A');
      setNewHouseNumber('10');
    }

    setIsResidentModalOpen(true);
  };

  const handleOpenEditResident = (r: Resident) => {
    setEditingResident(r);
    setModalResetNotice(null);
    setDocUploadError(null);
    setFullName(r.fullName);
    setIdCardNumber(r.idCardNumber || '');
    setEmail(r.email);
    setPhoneNumber(r.phoneNumber);
    setRelationship(r.householdRelationship || 'KEPALA_KELUARGA');
    setOccupancyType(r.occupancyType || 'PEMILIK');
    setOriginVillage(r.originVillage || '');
    setEmergencyContactRelation(r.emergencyContactRelation || 'ORANG_TUA');
    setEmergencyContactPhone(r.emergencyContactPhone || '');
    setPopulationStatus(r.populationStatus || 'BELUM_PINDAH');
    setDomicileLetterStatus(r.domicileLetterStatus || 'ADA');
    setKtpPhotoUrl(r.ktpPhotoUrl || '');
    setKkPhotoUrl(r.kkPhotoUrl || '');
    setSelectedHouseMode('EXISTING');
    setSelectedHouseId(r.houseId);
    setIsResidentModalOpen(true);
  };

  const handleAdminDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'KTP' | 'KK'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setDocUploadError(null);
    setUploadingDocType(docType);
    try {
      const compressed = await compressIdentityImage(file);
      if (docType === 'KTP') {
        setKtpPhotoUrl(compressed);
      } else {
        setKkPhotoUrl(compressed);
      }
    } catch (err) {
      setDocUploadError(err instanceof Error ? err.message : 'Gagal memproses foto.');
    } finally {
      setUploadingDocType(null);
    }
  };

  // Save House
  const handleSaveHouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseNumber) return;

    const cleanNum = houseNumber.trim().replace(/^0+(?=\d)/, '');
    const houseId = `house-${block.toLowerCase()}-${cleanNum}`;
    const addressLabel = `Blok ${block}${cleanNum}`;

    if (editingHouse) {
      updateHouse(editingHouse.houseId, {
        block,
        houseNumber: cleanNum,
        addressLabel,
        occupancyStatus,
        notes,
      });
    } else {
      addHouse({
        houseId,
        block,
        houseNumber: cleanNum,
        addressLabel,
        occupancyStatus,
        notes,
      });

      // If inline resident provided
      if (addResidentWithHouse && inlineResidentName) {
        addResident({
          residentId: `res-${Date.now()}`,
          userUid: `warga-inline-${Date.now()}`,
          houseId,
          fullName: inlineResidentName,
          email: inlineResidentEmail || `warga.${block.toLowerCase()}${cleanNum}@gcr.id`,
          phoneNumber: inlineResidentPhone || '081234567890',
          householdRelationship: 'KEPALA_KELUARGA',
          occupancyType: occupancyStatus === 'TERISI_SEWA' ? 'PENYEWA' : 'PEMILIK',
          residentStatus: 'ACTIVE',
        });
      }
    }

    setIsHouseModalOpen(false);
  };

  // Save Resident (with simultaneous House creation if needed)
  const handleSaveResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phoneNumber) return;

    let targetHouseId = selectedHouseId;

    if (selectedHouseMode === 'NEW') {
      if (!newHouseNumber) return;
      const cleanNewNum = newHouseNumber.trim().replace(/^0+(?=\d)/, '');
      const createdHouseId = `house-${newHouseBlock.toLowerCase()}-${cleanNewNum}`;
      const createdAddressLabel = `Blok ${newHouseBlock}${cleanNewNum}`;

      // Check if house already exists
      const existing = houses.find(h => h.block === newHouseBlock && h.houseNumber === newHouseNumber);
      if (existing) {
        targetHouseId = existing.houseId;
      } else {
        addHouse({
          houseId: createdHouseId,
          block: newHouseBlock,
          houseNumber: newHouseNumber,
          addressLabel: createdAddressLabel,
          occupancyStatus: occupancyType === 'PENYEWA' ? 'TERISI_SEWA' : 'TERISI_PEMILIK',
          notes: 'Dibuat otomatis saat pendaftaran warga baru',
        });
        targetHouseId = createdHouseId;
      }
    }

    if (editingResident) {
      updateResident(editingResident.residentId, {
        houseId: targetHouseId,
        fullName,
        idCardNumber,
        email,
        phoneNumber,
        householdRelationship: relationship,
        occupancyType,
        originVillage: originVillage.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        emergencyContactRelation: emergencyContactPhone.trim() ? emergencyContactRelation : undefined,
        populationStatus,
        domicileLetterStatus,
        ktpPhotoUrl: ktpPhotoUrl || undefined,
        kkPhotoUrl: kkPhotoUrl || undefined,
      });
    } else {
      addResident({
        residentId: `res-${Date.now()}`,
        userUid: `warga-admin-${Date.now()}`,
        houseId: targetHouseId,
        fullName,
        idCardNumber,
        email,
        phoneNumber,
        householdRelationship: relationship,
        occupancyType,
        residentStatus: 'ACTIVE',
        originVillage: originVillage.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        emergencyContactRelation: emergencyContactPhone.trim() ? emergencyContactRelation : undefined,
        populationStatus,
        domicileLetterStatus,
        ktpPhotoUrl: ktpPhotoUrl || undefined,
        kkPhotoUrl: kkPhotoUrl || undefined,
      });
    }

    setIsResidentModalOpen(false);
  };

  // Confirm Delete Handlers
  const executeDeleteHouse = () => {
    if (deletingHouse) {
      const linked = residents.filter(
        r => normalizeHouseId(r.houseId) === normalizeHouseId(deletingHouse.houseId)
      );
      linked.forEach(r => {
        if (r.userUid) deleteUser(r.userUid);
      });
      deleteHouse(deletingHouse.houseId);
      setDeletingHouse(null);
    }
  };

  const executeDeleteResident = () => {
    if (deletingResident) {
      if (deletingResident.userUid) {
        deleteUser(deletingResident.userUid);
      }
      if (profileResidentId === deletingResident.residentId) {
        setProfileResidentId(null);
      }
      deleteResident(deletingResident.residentId);
      setDeletingResident(null);
    }
  };

  const getHousePasswordIdentifiers = (house?: House | null, extraResident?: Resident | null): (string | undefined)[] => {
    const normHouseId = normalizeHouseId(house?.houseId || extraResident?.houseId);
    const linkedResidents = normHouseId
      ? residents.filter(r => normalizeHouseId(r.houseId) === normHouseId)
      : [];
    const linkedUsers = normHouseId
      ? users.filter(u => u.role === 'WARGA' && normalizeHouseId(u.houseId) === normHouseId)
      : [];

    return [
      normHouseId,
      house?.houseId,
      house ? `${house.block}${house.houseNumber}` : undefined,
      extraResident?.houseId,
      extraResident?.userUid,
      extraResident?.email,
      ...linkedResidents.map(r => r.userUid),
      ...linkedResidents.map(r => r.email),
      ...linkedUsers.map(u => u.uid),
      ...linkedUsers.map(u => u.email),
    ];
  };

  const getResidentLoginCode = (house?: House | null, res?: Resident | null): string => {
    if (house?.block && house?.houseNumber) {
      return `${house.block.trim().toUpperCase()}${house.houseNumber.trim().replace(/^0+(?=\d)/, '')}`;
    }
    const norm = normalizeHouseId(res?.houseId || '');
    const m = norm.match(/^house-([a-z0-9]+)-(\d+)$/i);
    if (m) {
      return `${m[1].toUpperCase()}${m[2].replace(/^0+(?=\d)/, '')}`;
    }
    return res?.houseId || '-';
  };

  const handleResetPassword = (res: Resident, showInModal = false) => {
    const house = houses.find(h => normalizeHouseId(h.houseId) === normalizeHouseId(res.houseId));
    const identifiers = getHousePasswordIdentifiers(house, res);
    resetWargaPassword(identifiers);
    const loginCode = getResidentLoginCode(house, res);
    const unitLabel = formatHouseLabel(house, res.houseId);
    const msg = `Password akun warga ${res.fullName} (${unitLabel} · User Login: ${loginCode}) berhasil dikembalikan ke password bawaan '${DEFAULT_WARGA_PASSWORD}'.`;
    setResetSuccessMsg(msg);
    if (showInModal) {
      setModalResetNotice(msg);
    }
    setTimeout(() => setResetSuccessMsg(null), 8000);
  };

  const totalOccupied = houses.filter(h => h.occupancyStatus !== 'KOSONG').length;
  const totalVacant = houses.filter(h => h.occupancyStatus === 'KOSONG').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rumah & Data Warga</h1>
          <p className="text-sm text-slate-500">
            Kelola data unit rumah, kavling, serta pendaftaran seluruh warga Grand Ciledug Raya.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenAddResident()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Warga Baru</span>
          </button>
          <button
            onClick={handleOpenAddHouse}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Rumah Baru</span>
          </button>
        </div>
      </div>

      {resetSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetSuccessMsg}</span>
          </div>
          <button onClick={() => setResetSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{houses.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Rumah Terdaftar</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{residents.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Warga Terdaftar</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              <span className="text-emerald-600">{totalOccupied} Terisi</span> / <span className="text-amber-600">{totalVacant} Kosong</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Status Hunian Kavling</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('HOUSES')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'HOUSES'
              ? 'bg-[#142D4E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Daftar Rumah & Blok ({houses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RESIDENTS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'RESIDENTS'
              ? 'bg-[#142D4E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Data Warga ({residents.length})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'HOUSES'
                ? 'Cari rumah (contoh: Blok A10) atau nama warga...'
                : 'Cari nama warga, rumah (Blok A10), nomor HP...'
            }
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {activeTab === 'RESIDENTS' && (
            <>
              <button
                onClick={() => setSelectedOccupancy('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  selectedOccupancy === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({residents.length})
              </button>
              <button
                onClick={() => setSelectedOccupancy('PEMILIK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  selectedOccupancy === 'PEMILIK'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pemilik ({residents.filter(r => r.occupancyType === 'PEMILIK').length})
              </button>
              <button
                onClick={() => setSelectedOccupancy('PENYEWA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  selectedOccupancy === 'PENYEWA'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Penyewa ({residents.filter(r => r.occupancyType === 'PENYEWA').length})
              </button>
              <div className="mx-2 h-4 border-l border-slate-300" />
            </>
          )}

          {['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(b => (
            <button
              key={b}
              onClick={() => setSelectedBlock(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedBlock === b
                  ? 'bg-[#142D4E] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b === 'ALL' ? 'Semua Blok' : `Blok ${b}`}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: HOUSES TABLE */}
      {activeTab === 'HOUSES' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Rumah</th>
                  <th className="px-6 py-3">Status Huni</th>
                  <th className="px-6 py-3">Warga Terdaftar (Klik untuk Profil)</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHouses.map(house => {
                  const houseResidents = residents.filter(
                    r => normalizeHouseId(r.houseId) === normalizeHouseId(house.houseId)
                  );
                  const unitLabel = formatHouseLabel(house);
                  const hasResidents = houseResidents.length > 0;

                  return (
                    <tr
                      key={house.houseId}
                      onClick={() => {
                        if (houseResidents.length === 1) {
                          handleOpenResidentProfile(houseResidents[0]);
                        }
                      }}
                      className={`transition ${
                        houseResidents.length === 1
                          ? 'hover:bg-blue-50/40 cursor-pointer'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{unitLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <StatusBadge status={house.occupancyStatus} />
                      </td>
                      <td className="px-6 py-3.5">
                        {hasResidents ? (
                          <div className="space-y-1">
                            {houseResidents.map(r => (
                              <button
                                key={r.residentId}
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleOpenResidentProfile(r);
                                }}
                                className="group flex items-center gap-2 text-left py-1 px-2 -mx-2 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                                title={`Lihat Profil Warga ${r.fullName}`}
                              >
                                <span className="font-semibold text-slate-900 group-hover:text-blue-700 group-hover:underline">
                                  {r.fullName}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ·{' '}
                                  {r.householdRelationship === 'KEPALA_KELUARGA'
                                    ? 'Kepala Keluarga'
                                    : translateStatus(r.householdRelationship)}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 italic">Belum ada warga</span>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleOpenAddResident(house.houseId);
                              }}
                              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer whitespace-nowrap"
                            >
                              + Daftarkan
                            </button>
                          </div>
                        )}
                      </td>
                      <td
                        className="px-6 py-3.5 text-right whitespace-nowrap space-x-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenEditHouse(house)}
                          className="p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition cursor-pointer inline-flex items-center"
                          title={`Edit ${unitLabel}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingHouse(house)}
                          className="p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition cursor-pointer inline-flex items-center"
                          title={`Hapus ${unitLabel}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredHouses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      Tidak ada rumah yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RESIDENTS TABLE */}
      {activeTab === 'RESIDENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Nama Warga</th>
                  <th className="px-6 py-3">Rumah</th>
                  <th className="px-6 py-3">Kontak</th>
                  <th className="px-6 py-3">Hubungan & Hunian</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredResidents.map(res => {
                  const house = houses.find(
                    h => normalizeHouseId(h.houseId) === normalizeHouseId(res.houseId)
                  );
                  const unitLabel = formatHouseLabel(house, res.houseId);

                  return (
                    <tr
                      key={res.residentId}
                      onClick={() => handleOpenResidentProfile(res)}
                      className="group hover:bg-blue-50/40 transition cursor-pointer"
                      title={`Klik untuk membuka Profil Warga ${res.fullName}`}
                    >
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {res.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-blue-700 group-hover:underline flex items-center gap-1">
                              <span className="truncate">{res.fullName}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
                            </div>
                            <div className="text-xs text-slate-400 font-normal tabular-nums">
                              NIK: {res.idCardNumber || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                          <Home className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{unitLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 tabular-nums">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{res.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{res.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 space-y-0.5">
                        <div className="text-xs font-semibold text-slate-800">
                          {translateStatus(res.householdRelationship)} ·{' '}
                          {translateStatus(res.occupancyType || 'PEMILIK')}
                        </div>
                        {res.originVillage && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{res.originVillage}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <StatusBadge status={res.residentStatus} />
                      </td>
                      <td
                        className="px-6 py-3.5 text-right whitespace-nowrap space-x-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenResidentProfile(res)}
                          className="p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition cursor-pointer inline-flex items-center"
                          title="Lihat Profil Warga"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditResident(res)}
                          className="p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition cursor-pointer inline-flex items-center"
                          title="Edit Data Warga"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingResident(res)}
                          className="p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition cursor-pointer inline-flex items-center"
                          title="Hapus Data Warga"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredResidents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      Tidak ada data warga yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add/Edit House */}
      {isHouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              {editingHouse ? 'Edit Data Rumah' : 'Tambah Rumah Baru'}
            </h3>
            <form onSubmit={handleSaveHouse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Blok (A - I)</label>
                  <select
                    value={block}
                    onChange={e => setBlock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(b => (
                      <option key={b} value={b}>Blok {b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nomor Rumah (1 - 60)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    placeholder="1 - 60"
                    value={houseNumber}
                    onChange={e => setHouseNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Status Huni</label>
                <select
                  value={occupancyStatus}
                  onChange={e => setOccupancyStatus(e.target.value as OccupancyStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                >
                  <option value="TERISI_PEMILIK">Terisi Pemilik</option>
                  <option value="TERISI_SEWA">Terisi Penyewa</option>
                  <option value="KOSONG">Kosong</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Catatan / Keterangan</label>
                <textarea
                  placeholder="Keterangan tambahan (opsional)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  rows={2}
                />
              </div>

              {/* Optional inline resident creation if adding a new house */}
              {!editingHouse && (
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addResidentWithHouse}
                      onChange={e => setAddResidentWithHouse(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-800">Daftarkan Warga / Penghuni Sekaligus</span>
                  </label>

                  {addResidentWithHouse && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3 animate-fade-in">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Nama Lengkap Warga</label>
                        <input
                          type="text"
                          required={addResidentWithHouse}
                          placeholder="Nama Kepala Keluarga / Penghuni"
                          value={inlineResidentName}
                          onChange={e => setInlineResidentName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Email</label>
                          <input
                            type="email"
                            placeholder="email@domain.com"
                            value={inlineResidentEmail}
                            onChange={e => setInlineResidentEmail(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">No. WhatsApp</label>
                          <input
                            type="text"
                            placeholder="081234567890"
                            value={inlineResidentPhone}
                            onChange={e => setInlineResidentPhone(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsHouseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  Simpan Rumah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add/Edit Resident (with simultaneous House creation option) */}
      {isResidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              {editingResident ? 'Edit Data Warga' : 'Tambah Data Warga Baru'}
            </h3>
            <form onSubmit={handleSaveResident} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Lengkap Warga *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama sesuai KTP"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">NIK / No. KTP</label>
                  <input
                    type="text"
                    placeholder="36710xxxxxxxxxxx"
                    value={idCardNumber}
                    onChange={e => setIdCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">No. WhatsApp / HP *</label>
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxxxx"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="warga@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* House Selection / Creation Section */}
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 space-y-3">
                <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-blue-600" />
                  <span>Penetapan Unit Rumah Warga</span>
                </label>

                {!editingResident && (
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="houseMode"
                        checked={selectedHouseMode === 'EXISTING'}
                        onChange={() => setSelectedHouseMode('EXISTING')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Pilih Rumah Terdaftar</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="houseMode"
                        checked={selectedHouseMode === 'NEW'}
                        onChange={() => setSelectedHouseMode('NEW')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Input Rumah Baru</span>
                    </label>
                  </div>
                )}

                {selectedHouseMode === 'EXISTING' ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Pilih Unit Rumah</label>
                    <select
                      value={selectedHouseId}
                      onChange={e => setSelectedHouseId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    >
                      {houses.map(h => (
                        <option key={h.houseId} value={h.houseId}>
                          {formatHouseLabel(h)} ({translateStatus(h.occupancyStatus)})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Blok Rumah Baru (A-I)</label>
                      <select
                        value={newHouseBlock}
                        onChange={e => setNewHouseBlock(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                      >
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(b => (
                          <option key={b} value={b}>Blok {b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Nomor Rumah Baru (1-60)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        required={selectedHouseMode === 'NEW'}
                        placeholder="1 - 60"
                        value={newHouseNumber}
                        onChange={e => setNewHouseNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Hubungan Keluarga</label>
                  <select
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                    <option value="PASANGAN">Pasangan</option>
                    <option value="ANAK">Anak</option>
                    <option value="KELUARGA_LAIN">Keluarga Lain</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tipe Hunian</label>
                  <select
                    value={occupancyType}
                    onChange={e => setOccupancyType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="PEMILIK">Pemilik</option>
                    <option value="KELUARGA_PEMILIK">Keluarga Pemilik</option>
                    <option value="PENYEWA">Penyewa</option>
                  </select>
                </div>
              </div>

              {/* Data Desa Asal, Kontak Keluarga Terdekat & Kependudukan */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800">
                  Data Asal, Kontak Keluarga Terdekat & Kependudukan
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Desa Asal</label>
                  <input
                    type="text"
                    placeholder="Contoh: Desa Sukamaju, Kec. Cibeber"
                    value={originVillage}
                    onChange={e => setOriginVillage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Hubungan Keluarga Terdekat
                    </label>
                    <select
                      value={emergencyContactRelation}
                      onChange={e =>
                        setEmergencyContactRelation(e.target.value as EmergencyContactRelation)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    >
                      <option value="ORANG_TUA">Orang Tua (Ortu)</option>
                      <option value="PASANGAN">Pasangan</option>
                      <option value="ANAK">Anak</option>
                      <option value="SAUDARA">Saudara</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      No. HP Keluarga Terdekat
                    </label>
                    <input
                      type="tel"
                      placeholder="0812-xxxx-xxxx"
                      value={emergencyContactPhone}
                      onChange={e => setEmergencyContactPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Status Kependudukan
                    </label>
                    <select
                      value={populationStatus}
                      onChange={e => setPopulationStatus(e.target.value as PopulationStatus)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    >
                      <option value="SUDAH_WARGA_LEUWUNGGAJAH">a. Sudah Warga Leuwunggajah</option>
                      <option value="BELUM_PINDAH">b. Belum Pindah Kependudukan</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Surat Domisili</label>
                    <select
                      value={domicileLetterStatus}
                      onChange={e =>
                        setDomicileLetterStatus(e.target.value as DomicileLetterStatus)
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                    >
                      <option value="ADA">Ada</option>
                      <option value="TIDAK_ADA">Tidak Ada</option>
                    </select>
                  </div>
                </div>

                {docUploadError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                    {docUploadError}
                  </div>
                )}

                {/* Lampiran Foto KTP & KK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* KTP */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-slate-800">Foto KTP</div>
                    <input
                      ref={ktpCamRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={e => handleAdminDocUpload(e, 'KTP')}
                      className="hidden"
                    />
                    <input
                      ref={ktpGalRef}
                      type="file"
                      accept="image/*"
                      onChange={e => handleAdminDocUpload(e, 'KTP')}
                      className="hidden"
                    />
                    {ktpPhotoUrl && (
                      <div className="relative h-24 rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <img
                          src={ktpPhotoUrl}
                          alt="KTP"
                          onClick={() => setZoomPhoto({ title: 'Foto KTP', src: ktpPhotoUrl })}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setKtpPhotoUrl('')}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded text-[10px] cursor-pointer"
                          title="Hapus Foto KTP"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        disabled={uploadingDocType === 'KTP'}
                        onClick={() => ktpCamRef.current?.click()}
                        className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-600" /> Kamera
                      </button>
                      <button
                        type="button"
                        disabled={uploadingDocType === 'KTP'}
                        onClick={() => ktpGalRef.current?.click()}
                        className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Galeri
                      </button>
                    </div>
                  </div>

                  {/* KK */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-slate-800">Foto KK (Opsional)</div>
                    <input
                      ref={kkCamRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={e => handleAdminDocUpload(e, 'KK')}
                      className="hidden"
                    />
                    <input
                      ref={kkGalRef}
                      type="file"
                      accept="image/*"
                      onChange={e => handleAdminDocUpload(e, 'KK')}
                      className="hidden"
                    />
                    {kkPhotoUrl && (
                      <div className="relative h-24 rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <img
                          src={kkPhotoUrl}
                          alt="KK"
                          onClick={() => setZoomPhoto({ title: 'Foto KK', src: kkPhotoUrl })}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setKkPhotoUrl('')}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded text-[10px] cursor-pointer"
                          title="Hapus Foto KK"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        disabled={uploadingDocType === 'KK'}
                        onClick={() => kkCamRef.current?.click()}
                        className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-600" /> Kamera
                      </button>
                      <button
                        type="button"
                        disabled={uploadingDocType === 'KK'}
                        onClick={() => kkGalRef.current?.click()}
                        className="py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Galeri
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResidentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  Simpan Warga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROFIL LENGKAP WARGA */}
      {profileResident && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setProfileResidentId(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90dvh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              const profileHouse = houses.find(
                h => normalizeHouseId(h.houseId) === normalizeHouseId(profileResident.houseId)
              );
              const unitLabel = formatHouseLabel(profileHouse, profileResident.houseId);
              const loginCode = getResidentLoginCode(profileHouse, profileResident);
              const isCustomPass = hasCustomWargaPassword(
                getHousePasswordIdentifiers(profileHouse, profileResident)
              );

              return (
                <>
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Profil Warga</h3>
                      <p className="text-xs text-slate-500">
                        Detail lengkap data pendaftaran, kependudukan, dan akun login warga.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileResidentId(null)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 transition cursor-pointer"
                      aria-label="Tutup Profil Warga"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Scrollable Body */}
                  <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Resident Summary Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#142D4E] text-white flex items-center justify-center font-bold text-lg shrink-0">
                          {profileResident.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-lg font-bold text-slate-900 truncate">
                            {profileResident.fullName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-0.5">
                            <span className="font-semibold text-blue-700 inline-flex items-center gap-1">
                              <Home className="w-3.5 h-3.5" />
                              {unitLabel}
                            </span>
                            <span>·</span>
                            <span>{translateStatus(profileResident.householdRelationship)}</span>
                            <span>·</span>
                            <span>{translateStatus(profileResident.occupancyType || 'PEMILIK')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={profileResident.residentStatus} />
                      </div>
                    </div>

                    {/* Section 1: Data Identitas & Kontak */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Identitas & Kontak Pribadi
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-sm">
                        <div>
                          <div className="text-xs text-slate-500">Nama Lengkap</div>
                          <div className="font-semibold text-slate-900 mt-0.5">
                            {profileResident.fullName}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Unit Rumah</div>
                          <div className="font-semibold text-slate-900 mt-0.5">{unitLabel}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">NIK / Nomor KTP</div>
                          <div className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                            {profileResident.idCardNumber || '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Nomor WhatsApp / HP</div>
                          <div className="font-semibold text-slate-900 tabular-nums mt-0.5">
                            {profileResident.phoneNumber || '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Alamat Email</div>
                          <div className="font-medium text-slate-900 break-all mt-0.5">
                            {profileResident.email || '-'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Desa Asal</div>
                          <div className="font-medium text-slate-900 mt-0.5">
                            {profileResident.originVillage || '-'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Kontak Keluarga Terdekat & Kependudukan */}
                    <div className="pt-5 border-t border-slate-200 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Keluarga Terdekat & Status Kependudukan
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-sm">
                        <div>
                          <div className="text-xs text-slate-500">
                            Nomor HP Keluarga Terdekat
                          </div>
                          <div className="font-semibold text-slate-900 tabular-nums mt-0.5">
                            {profileResident.emergencyContactPhone ? (
                              <>
                                {profileResident.emergencyContactPhone}{' '}
                                <span className="text-xs font-normal text-slate-500">
                                  ({formatEmergencyRelation(profileResident.emergencyContactRelation)})
                                </span>
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Status Kependudukan</div>
                          <div className="font-semibold text-slate-900 mt-0.5">
                            {formatPopulationStatus(profileResident.populationStatus)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Surat Domisili</div>
                          <div className="font-semibold text-slate-900 mt-0.5">
                            {formatDomicileStatus(profileResident.domicileLetterStatus)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Tanggal Terdaftar</div>
                          <div className="font-medium text-slate-900 tabular-nums mt-0.5">
                            {formatDate(profileResident.createdAt)}
                          </div>
                        </div>
                        {profileResident.disclaimerAccepted !== undefined && (
                          <div className="sm:col-span-2">
                            <div className="text-xs text-slate-500">
                              Persetujuan Pernyataan Data & Tata Tertib Paguyuban
                            </div>
                            <div className="font-medium text-emerald-700 flex items-center gap-1.5 mt-0.5 text-xs">
                              <ShieldCheck className="w-4 h-4 shrink-0" />
                              <span>
                                {profileResident.disclaimerAccepted
                                  ? `Telah disetujui warga${
                                      profileResident.disclaimerAcceptedAt
                                        ? ` pada ${formatDateTime(profileResident.disclaimerAcceptedAt)}`
                                        : ''
                                    }`
                                  : 'Belum tercatat'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 3: Dokumen Identitas (KTP & KK) */}
                    <div className="pt-5 border-t border-slate-200 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Dokumen Identitas (KTP & KK)
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Foto KTP */}
                        <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50/50">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              Foto KTP
                            </span>
                            {profileResident.ktpPhotoUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setZoomPhoto({
                                    title: `Foto KTP — ${profileResident.fullName} (${unitLabel})`,
                                    src: profileResident.ktpPhotoUrl!,
                                  })
                                }
                                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Perbesar
                              </button>
                            )}
                          </div>
                          {profileResident.ktpPhotoUrl ? (
                            <div
                              onClick={() =>
                                setZoomPhoto({
                                  title: `Foto KTP — ${profileResident.fullName} (${unitLabel})`,
                                  src: profileResident.ktpPhotoUrl!,
                                })
                              }
                              className="h-32 rounded-lg overflow-hidden border border-slate-200 bg-white cursor-pointer"
                            >
                              <img
                                src={profileResident.ktpPhotoUrl}
                                alt={`KTP ${profileResident.fullName}`}
                                className="w-full h-full object-cover hover:scale-105 transition duration-200"
                              />
                            </div>
                          ) : (
                            <div className="h-24 rounded-lg border border-dashed border-slate-200 bg-white flex items-center justify-center text-xs text-slate-400">
                              Belum ada foto KTP
                            </div>
                          )}
                        </div>

                        {/* Foto KK */}
                        <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50/50">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              Foto Kartu Keluarga (KK)
                            </span>
                            {profileResident.kkPhotoUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setZoomPhoto({
                                    title: `Foto KK — ${profileResident.fullName} (${unitLabel})`,
                                    src: profileResident.kkPhotoUrl!,
                                  })
                                }
                                className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Perbesar
                              </button>
                            )}
                          </div>
                          {profileResident.kkPhotoUrl ? (
                            <div
                              onClick={() =>
                                setZoomPhoto({
                                  title: `Foto KK — ${profileResident.fullName} (${unitLabel})`,
                                  src: profileResident.kkPhotoUrl!,
                                })
                              }
                              className="h-32 rounded-lg overflow-hidden border border-slate-200 bg-white cursor-pointer"
                            >
                              <img
                                src={profileResident.kkPhotoUrl}
                                alt={`KK ${profileResident.fullName}`}
                                className="w-full h-full object-cover hover:scale-105 transition duration-200"
                              />
                            </div>
                          ) : (
                            <div className="h-24 rounded-lg border border-dashed border-slate-200 bg-white flex items-center justify-center text-xs text-slate-400">
                              Tidak dilampirkan (Opsional)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Akun Login Warga & Reset Password */}
                    <div className="pt-5 border-t border-slate-200 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Akun Login Warga & Keamanan Password
                      </h5>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="text-xs text-slate-500">Username / Kode Login Warga</div>
                            <div className="font-mono text-sm font-bold text-slate-900">
                              {loginCode}{' '}
                              <span className="font-sans text-xs font-normal text-slate-500">
                                (atau email {profileResident.email})
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1 sm:text-right">
                            <div className="text-xs text-slate-500">Status Password</div>
                            <div className="text-xs font-semibold">
                              {isCustomPass ? (
                                <span className="text-amber-700">Sudah Diubah Warga</span>
                              ) : (
                                <span className="text-emerald-700">
                                  Password Bawaan ({DEFAULT_WARGA_PASSWORD})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {modalResetNotice && (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{modalResetNotice}</span>
                          </div>
                        )}

                        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200/80">
                          <p className="text-xs text-slate-500">
                            Kembalikan password login warga ke bawaan{' '}
                            <strong className="font-mono text-slate-700">
                              {DEFAULT_WARGA_PASSWORD}
                            </strong>{' '}
                            jika warga lupa kata sandi.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleResetPassword(profileResident, true)}
                            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>Reset Password</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const target = profileResident;
                          setProfileResidentId(null);
                          handleOpenEditResident(target);
                        }}
                        className="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Data Warga</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const target = profileResident;
                          setProfileResidentId(null);
                          setDeletingResident(target);
                        }}
                        className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Warga</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileResidentId(null)}
                      className="px-4 py-2 bg-[#142D4E] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap"
                    >
                      Tutup
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE HOUSE MODAL */}
      {deletingHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Hapus Data Rumah</h3>
              <p className="text-xs text-slate-600">
                Apakah Anda yakin ingin menghapus{' '}
                <strong>{formatHouseLabel(deletingHouse)}</strong>?
              </p>
              {residents.filter(
                r => normalizeHouseId(r.houseId) === normalizeHouseId(deletingHouse.houseId)
              ).length > 0 && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 font-medium">
                  Perhatian: Terdapat{' '}
                  {
                    residents.filter(
                      r => normalizeHouseId(r.houseId) === normalizeHouseId(deletingHouse.houseId)
                    ).length
                  }{' '}
                  warga terdaftar di rumah ini. Data warga juga akan dihapus.
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingHouse(null)}
                className="w-1/2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteHouse}
                className="w-1/2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                Ya, Hapus Rumah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE RESIDENT MODAL */}
      {deletingResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Hapus Data Warga</h3>
              <p className="text-xs text-slate-600">
                Apakah Anda yakin ingin menghapus data warga <strong>{deletingResident.fullName}</strong> ({deletingResident.email})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingResident(null)}
                className="w-1/2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteResident}
                className="w-1/2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                Ya, Hapus Warga
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Zoom Modal */}
      {zoomPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomPhoto(null)}
        >
          <div
            className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">{zoomPhoto.title}</h4>
              <button
                type="button"
                onClick={() => setZoomPhoto(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[78dvh] overflow-auto">
              <img
                src={zoomPhoto.src}
                alt={zoomPhoto.title}
                className="max-w-full max-h-[72dvh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
