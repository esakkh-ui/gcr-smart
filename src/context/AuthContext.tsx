import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/client';
import { User, UserRole, UserStatus, CommunitySettings, House, Resident } from '../types';
import { safeStr } from '../utils/helpers';
import { setOneSignalExternalId, removeOneSignalExternalId } from '../utils/onesignal';

export const DEFAULT_WARGA_PASSWORD = 'gcr123';

export const normalizeHouseId = (id?: string): string => {
  if (!id) return '';
  const trimmed = id.trim();
  if (trimmed === 'house-a1-10') return 'house-a-10';
  if (trimmed === 'house-b2-15') return 'house-b-15';
  if (trimmed === 'house-c2-08' || trimmed === 'house-c1-04') return 'house-c-04';
  if (trimmed === 'house-d1-02') return 'house-d-8';
  return trimmed;
};

export const getCanonicalUnitKey = (input?: string): string => {
  if (!input) return '';
  const normalized = normalizeHouseId(input).toLowerCase().trim();
  if (!normalized) return '';

  const unitMatch = normalized.match(/^unit-([a-z]+)-0*(\d+)$/i);
  if (unitMatch) {
    return `unit-${unitMatch[1].toLowerCase()}-${parseInt(unitMatch[2], 10)}`;
  }

  const houseMatch = normalized.match(/^(?:warga-)?house-([a-z]+)\d*-0*(\d+)$/i);
  if (houseMatch) {
    return `unit-${houseMatch[1].toLowerCase()}-${parseInt(houseMatch[2], 10)}`;
  }

  if (
    !normalized.startsWith('warga-') &&
    !normalized.startsWith('admin-') &&
    !normalized.startsWith('res-') &&
    !normalized.includes('@')
  ) {
    const blockMatch = normalized.match(/^(?:blok\s*)?([a-z]{1,2})[\s.\-]*(?:no\.?\s*)?0*(\d+)$/i);
    if (blockMatch) {
      return `unit-${blockMatch[1].toLowerCase()}-${parseInt(blockMatch[2], 10)}`;
    }
  }

  return normalized;
};

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loginAsDemo: (role: UserRole, userUid?: string) => void;
  loginWithCredentials: (
    usernameInput: string,
    passwordInput: string
  ) => Promise<{ success: boolean; message?: string; role?: UserRole }>;
  logout: () => Promise<void>;
  registerUser: (userData: Omit<User, 'createdAt' | 'updatedAt'>) => Promise<void>;
  approveUser: (uid: string) => Promise<void>;
  rejectUser: (uid: string) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  changeUserPassword: (
    oldPass: string,
    newPass: string
  ) => Promise<{ success: boolean; message: string }>;
  resetWargaPassword: (identifiers: string | (string | undefined)[]) => Promise<void>;
  hasCustomWargaPassword: (identifiers: (string | undefined)[]) => boolean;
  refreshAuthFromCloud: () => Promise<void>;
  fetchUserList: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_SESSION_KEY = 'gcr_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (saved) {
        const { user } = JSON.parse(saved);
        return user;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [users, setUsers] = useState<User[]>([]);

  const saveSession = useCallback((user: User | null, token?: string) => {
    if (user && token) {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ user, token }));
      setOneSignalExternalId(user.uid);
    } else if (!user) {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      removeOneSignalExternalId();
    }
    setCurrentUser(user);
  }, []);

  const refreshAuthFromCloud = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const user = response.data;
      setCurrentUser(user);
      // Update session storage while keeping current token
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (saved) {
        const { token } = JSON.parse(saved);
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ user, token }));
      }
    } catch (err) {
      console.error('Failed to refresh auth from VPS:', err);
    }
  }, []);

  const loginWithCredentials = async (
    usernameInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; message?: string; role?: UserRole }> => {
    try {
      const response = await apiClient.post('/auth/login', {
        houseId: usernameInput,
        pin: passwordInput,
      });

      let { user, token } = response.data;
      
      // Map server response to frontend types
      if (user && !user.uid) user.uid = user.id;
      if (user && user.role === 'admin') user.role = 'ADMINISTRATOR';
      if (user && user.status === 'approved') user.status = 'ACTIVE';

      saveSession(user, token);
      return { success: true, role: user.role };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login gagal. Periksa kembali username dan password Anda.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    saveSession(null);
  };

  const loginAsDemo = (role: UserRole, userUid?: string) => {
    console.warn('Demo login is disabled in production VPS mode.');
  };

  const registerUser = async (userData: any): Promise<void> => {
    try {
      const payload = {
        name: userData.fullName,
        houseId: userData.houseId,
        pin: userData.pin || DEFAULT_WARGA_PASSWORD,
        phone: userData.phoneNumber
      };
      
      await apiClient.post('/auth/register', payload);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Registrasi gagal.');
    }
  };

  const approveUser = async (uid: string) => {
    await apiClient.post(`/admin/approve-user`, { userId: uid });
    if (currentUser?.role === 'ADMINISTRATOR') {
      fetchUserList();
    }
  };

  const rejectUser = async (uid: string) => {
    await apiClient.post(`/admin/users/${uid}/reject`);
    if (currentUser?.role === 'ADMINISTRATOR') {
      fetchUserList();
    }
  };

  const deleteUser = async (uid: string) => {
    await apiClient.delete(`/admin/users/${uid}`);
    setUsers(prev => prev.filter(u => u.uid !== uid));
  };

  const updateUserRole = async (uid: string, role: UserRole) => {
    await apiClient.patch(`/admin/users/${uid}/role`, { role });
    if (currentUser?.role === 'ADMINISTRATOR') {
      fetchUserList();
    }
  };

  const changeUserPassword = async (
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await apiClient.post('/auth/change-password', {
        oldPassword: oldPass,
        newPassword: newPass,
      });
      return { success: true, message: 'Password berhasil diperbarui!' };
    } catch (err: any) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Gagal mengganti password.' 
      };
    }
  };

  const fetchUserList = async (): Promise<User[]> => {
    try {
      const response = await apiClient.get('/admin/users');
      const userList = response.data;
      setUsers(userList);
      return userList;
    } catch (err) {
      console.error('Failed to fetch user list:', err);
      return [];
    }
  };

  // Sync session on mount
  useEffect(() => {
    if (currentUser) {
      refreshAuthFromCloud();
    }
  }, []);

  const resetWargaPassword = async (identifiers: string | (string | undefined)[]) => {
    await apiClient.post('/admin/users/reset-password', { identifiers });
    refreshAuthFromCloud();
  };

  const hasCustomWargaPassword = (identifiers: (string | undefined)[]) => {
    // In VPS mode, we assume server handles this, return false or check user meta
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loginAsDemo,
        loginWithCredentials,
        logout,
        registerUser,
        approveUser,
        rejectUser,
        deleteUser,
        updateUserRole,
        changeUserPassword,
        resetWargaPassword,
        hasCustomWargaPassword,
        refreshAuthFromCloud,
        fetchUserList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
