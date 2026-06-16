import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.isAnonymous) {
          setUser(firebaseUser);
          setLoading(false);
          return;
        }
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'விவசாயி',
              email: firebaseUser.email || 'guest@vivasayi.com',
              photoURL: firebaseUser.photoURL,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(userRef, {
              updatedAt: serverTimestamp(),
            }, { merge: true });
          }
        } catch (dbError) {
          console.error("Firestore user sync failed: ", dbError);
        }
        setUser(firebaseUser);
      } else {
        // If not authenticated in firebase, check if we have a guest session in state
        // Keep it if currentUser is null but we already set a mock guest user manually
        // But if signed out explicitly or starting fresh, set user state
        setUser((prev) => (prev && prev.uid.startsWith('guest_') ? prev : null));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      // 1. Try google login first (preferred/standard method)
      await signInWithPopup(auth, googleProvider);
    } catch (popupError: any) {
      console.warn("Google popup login failed, attempting anonymous sign-in", popupError);
      
      try {
        // 2. Try anonymous sign-in
        await signInAnonymously(auth);
      } catch (anonError: any) {
        console.warn("Anonymous sign-in failed, falling back to local guest mode", anonError);
        
        // 3. Fallback to custom guest user matching localStorage mock framework
        const mockUser = {
          uid: 'guest_user_' + Math.random().toString(36).substring(2, 10),
          displayName: 'விவசாயி (Guest)',
          email: 'guest@vivasayi.com',
          emailVerified: true,
          photoURL: null,
          isAnonymous: true
        } as any;
        setUser(mockUser);
        setLoading(false);
      }
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    // The onAuthStateChanged will handle the Firestore sync
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
