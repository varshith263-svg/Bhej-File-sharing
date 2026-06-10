import { useState, useEffect } from 'react';
import { User, signInWithPopup, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const TOKEN_KEY = 'bhej_google_access_token';
const TOKEN_TIME_KEY = 'bhej_google_access_token_time';

let cachedAccessToken: string | null = null;

try {
  const time = localStorage.getItem(TOKEN_TIME_KEY);
  if (time && Date.now() - parseInt(time) < 55 * 60 * 1000) {
    cachedAccessToken = localStorage.getItem(TOKEN_KEY);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TIME_KEY);
  }
} catch (e) {}

let isSigningIn = false;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(cachedAccessToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        cachedAccessToken = null;
        setToken(null);
        try {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(TOKEN_TIME_KEY);
        } catch (e) {}
      } else {
        setToken(cachedAccessToken);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        setToken(cachedAccessToken);
        try {
          localStorage.setItem(TOKEN_KEY, cachedAccessToken);
          localStorage.setItem(TOKEN_TIME_KEY, Date.now().toString());
        } catch (e) {}
      }
      return result;
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        console.warn('Login popup closed.');
        return null; // Return null gracefully
      }
      console.error('Login error:', e);
      throw e;
    } finally {
      isSigningIn = false;
    }
  };

  const logout = async () => {
    await auth.signOut();
    cachedAccessToken = null;
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_TIME_KEY);
    } catch (e) {}
  };

  return { user, token, loading, login, logout };
}

export function getAccessToken() {
  return cachedAccessToken;
}
