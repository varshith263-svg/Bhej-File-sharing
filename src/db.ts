import { collection, doc, query, where, getDocs, getDoc, setDoc, serverTimestamp, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  name: string;
  nameLowercase?: string;
  username: string;
  searchId: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp | Date;
}

export interface FileTransfer {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: Timestamp | Date;
}

export async function generateSearchId(): Promise<string> {
  // Generate a random 6 character alphanumeric ID
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return [];
  
  const results: UserProfile[] = [];
  const addedIds = new Set<string>();
  
  // Exact match on searchId (if length matches typical search ID length)
  if (searchTerm.length >= 5) {
    const exactIdQ = query(collection(db, 'users'), where('searchId', '==', searchTerm.toUpperCase()), limit(5));
    const exactIdSnap = await getDocs(exactIdQ);
    exactIdSnap.forEach(d => {
      const data = d.data() as UserProfile;
      if (!addedIds.has(data.uid)) {
        results.push(data);
        addedIds.add(data.uid);
      }
    });
  }

  // Prefix match on username
  const prefixNameQ = query(
    collection(db, 'users'), 
    where('username', '>=', term),
    where('username', '<=', term + '\uf8ff'),
    limit(10)
  );
  const prefixNameSnap = await getDocs(prefixNameQ);
  prefixNameSnap.forEach(d => {
    const data = d.data() as UserProfile;
    if (!addedIds.has(data.uid)) {
      results.push(data);
      addedIds.add(data.uid);
    }
  });

  // Prefix match on name
  const prefixRealNameQ = query(
    collection(db, 'users'), 
    where('nameLowercase', '>=', term),
    where('nameLowercase', '<=', term + '\uf8ff'),
    limit(10)
  );
  const prefixRealNameSnap = await getDocs(prefixRealNameQ);
  prefixRealNameSnap.forEach(d => {
    const data = d.data() as UserProfile;
    if (!addedIds.has(data.uid)) {
      results.push(data);
      addedIds.add(data.uid);
    }
  });

  return results;
}

export async function completeProfile(uid: string, name: string, email: string, photoURL: string, username: string, searchId: string) {
  const lowerUsername = username.toLowerCase();
  // check if username exists
  const existing = await getDocs(query(collection(db, 'users'), where('username', '==', lowerUsername)));
  if (!existing.empty && existing.docs[0].id !== uid) {
    throw new Error("Username already taken.");
  }

  await setDoc(doc(db, 'users', uid), {
    uid,
    name,
    nameLowercase: name.toLowerCase(),
    email,
    photoURL,
    username: lowerUsername,
    searchId,
    createdAt: serverTimestamp()
  });
}

export async function updateProfileInfo(uid: string, name: string, username: string) {
  const lowerUsername = username.toLowerCase();
  const existing = await getDocs(query(collection(db, 'users'), where('username', '==', lowerUsername)));
  if (!existing.empty && existing.docs[0].id !== uid) {
    throw new Error("Username already taken.");
  }
  
  await setDoc(doc(db, 'users', uid), {
    name,
    nameLowercase: name.toLowerCase(),
    username: lowerUsername
  }, { merge: true });
}
