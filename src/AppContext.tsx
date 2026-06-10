import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth';
import { getUserProfile, UserProfile, FileTransfer } from './db';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

interface AppContextType {
  user: any;
  token: string | null;
  loading: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  incomingTransfers: FileTransfer[];
  activeTransfers: FileTransfer[];
  login: () => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, token, loading, login, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [incomingTransfers, setIncomingTransfers] = useState<FileTransfer[]>([]);
  const [activeTransfers, setActiveTransfers] = useState<FileTransfer[]>([]);

  const refreshProfile = async () => {
    if (user && token) {
      try {
        const p = await getUserProfile(user.uid);
        setProfile(p);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (user && token) {
      setProfileLoading(true);
      getUserProfile(user.uid).then(p => {
        setProfile(p);
        setProfileLoading(false);
      }).catch(err => {
        console.error("Error fetching profile", err);
        setProfileLoading(false);
      });
    } else {
      setProfile(null);
      setProfileLoading(false);
      setIncomingTransfers([]);
      setActiveTransfers([]);
    }
  }, [user, token]);

  useEffect(() => {
    if (!profile) return;
    
    const unIncoming = onSnapshot(query(collection(db, 'transfers'), where('receiverId', '==', profile.uid)), (snap) => {
      const data = snap.docs.map(d => d.data() as FileTransfer);
      // Sort in memory instead of requiring composite index
      const sorted = data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setIncomingTransfers(sorted.filter(t => t.status === 'pending' || t.status === 'accepted'));
    });

    const unOutgoing = onSnapshot(query(collection(db, 'transfers'), where('senderId', '==', profile.uid)), (snap) => {
      const data = snap.docs.map(d => d.data() as FileTransfer);
      const sorted = data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setActiveTransfers(sorted.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.status !== 'rejected'));
    });

    return () => {
      unIncoming();
      unOutgoing();
    };
  }, [profile]);

  return (
    <AppContext.Provider value={{ user, token, loading, profile, profileLoading, incomingTransfers, activeTransfers, login, logout, refreshProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
