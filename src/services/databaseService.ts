import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential, 
  onAuthStateChanged, 
  signOut,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  checkActionCode,
  User as FirebaseUser
} from 'firebase/auth';
import { Patient, Appointment, FinancialTransaction, UserAccount, NutriaMessage } from '../types';

// Load Firebase configuration (nutrink-505600.firebaseapp.com)
const firebaseConfig = {
  projectId: "gen-lang-client-0157446519",
  appId: "1:193329003759:web:b4922d6b2c9545104e6f1a",
  apiKey: "AIzaSyDb20KbtkPnP9Cn8v26cbMuTvVEkzE_Bss",
  authDomain: (typeof window !== 'undefined' && (window.location.origin.includes('nutrink-505600') || window.location.origin.includes('nutrink.com.br')))
    ? "nutrink-505600.firebaseapp.com"
    : "nutrink-505600.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-remixnutrinknutr-51d08cbc-daf3-4ec1-978f-d4e0c04f216a",
  storageBucket: "gen-lang-client-0157446519.firebasestorage.app",
  messagingSenderId: "193329003759"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export { onAuthStateChanged, signOut };

/**
 * Verifies a password reset oobCode and returns the corresponding email address
 */
export async function verifyResetCode(oobCode: string): Promise<string> {
  return await verifyPasswordResetCode(auth, oobCode);
}

/**
 * Confirms password reset with new password
 */
export async function submitNewPassword(oobCode: string, newPass: string): Promise<void> {
  await confirmPasswordReset(auth, oobCode, newPass);
}

/**
 * Applies email verification action code
 */
export async function applyEmailVerification(oobCode: string): Promise<void> {
  await applyActionCode(auth, oobCode);
}

// Google Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ 
  prompt: 'select_account'
});

/**
 * Checks if the current window is running inside an iframe
 */
export function isRunningInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Checks for any pending redirect auth result from Firebase Auth (useful when returning from signInWithRedirect)
 */
export async function checkFirebaseRedirectResult(): Promise<UserAccount | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const fbUser = result.user;
      return await handleGoogleProfileAuth({
        email: fbUser.email || '',
        name: fbUser.displayName || undefined,
        picture: fbUser.photoURL || undefined,
        uid: fbUser.uid
      });
    }
  } catch (error: any) {
    console.warn('[Firebase Auth redirect result check]:', error);
  }
  return null;
}

/**
 * Handle Google Profile Authentication (from Firebase Auth or Google Identity Services)
 * Automatically checks and registers account in database if first access, merges profile data,
 * and persists to Firestore.
 */
export async function handleGoogleProfileAuth(profile: {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
  uid?: string;
}): Promise<UserAccount> {
  const cleanEmail = (profile.email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('E-mail não fornecido pelo Google.');
  }
  const name = (profile.name || 'Profissional de Saúde').trim();
  const avatarUrl = profile.picture || undefined;
  const googleId = profile.sub || profile.uid || '';

  // Check if existing profile in Firestore
  let existing = await getProfileByEmail(cleanEmail);
  if (!existing) {
    try {
      const raw = localStorage.getItem('nutrink_registered_users');
      if (raw) {
        const list = JSON.parse(raw);
        existing = list.find((u: any) => u.email?.trim().toLowerCase() === cleanEmail) || null;
      }
    } catch {}
  }

  let finalUser: UserAccount;
  if (existing) {
    finalUser = {
      ...existing,
      name: existing.name || name,
      avatarUrl: avatarUrl || existing.avatarUrl,
      authProvider: 'google',
      googleId: googleId || existing.googleId
    };
  } else {
    // Automatically create account on first access
    finalUser = {
      id: `usr-g-${Date.now()}`,
      name: name,
      email: cleanEmail,
      crn: 'CRN Ativo',
      specialty: 'Nutrição Clínica & Funcional',
      plan: 'free',
      isSubscribed: false,
      dailyMessageCount: 0,
      dailyMessageLimit: 30,
      monthlyMessageCount: 0,
      monthlyMessageLimit: 50,
      activeSince: new Date().getFullYear().toString(),
      avatarUrl: avatarUrl,
      authProvider: 'google',
      googleId: googleId
    };
  }

  // Non-blocking background save to Firestore
  saveProfile(finalUser).catch(err => console.warn('Sync profile to Firestore:', err));

  // Sync to local registered users list and immediate active session
  try {
    const raw = localStorage.getItem('nutrink_registered_users');
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((u: any) => u.email?.trim().toLowerCase() === cleanEmail);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...finalUser };
    } else {
      list.push(finalUser);
    }
    localStorage.setItem('nutrink_registered_users', JSON.stringify(list));
    localStorage.setItem('nutrink_last_email', cleanEmail);
    localStorage.setItem('nutrink_user_session', JSON.stringify(finalUser));
  } catch (err) {
    console.warn('Local storage sync warn:', err);
  }

  return finalUser;
}

/**
 * Sign in with Firebase Auth Google (handles popup mode, redirect mode, and custom domains like nutrink.com.br)
 */
export async function signInWithGoogleFirebase(preferredMode?: 'popup' | 'redirect'): Promise<UserAccount> {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Dynamically set prompt and host parameters
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    authuser: '0'
  });

  // If redirect mode explicitly requested or running outside iframe with mobile browser
  if (preferredMode === 'redirect') {
    await signInWithRedirect(auth, googleProvider);
    return new Promise(() => {}); // Will reload upon redirect
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    return await handleGoogleProfileAuth({
      email: fbUser.email || '',
      name: fbUser.displayName || undefined,
      picture: fbUser.photoURL || undefined,
      uid: fbUser.uid
    });
  } catch (error: any) {
    const errorCode = error?.code || '';
    console.warn('[Firebase Auth Google error]:', errorCode, error?.message || error);

    // If popup was blocked and we are outside iframe (e.g., on https://nutrink.com.br), attempt redirect fallback
    if ((errorCode === 'auth/popup-blocked' || errorCode === 'auth/popup-closed-by-user') && !isRunningInIframe()) {
      try {
        console.log('[Firebase Auth]: tentando signInWithRedirect como fallback para popup bloqueado...');
        await signInWithRedirect(auth, googleProvider);
        return new Promise(() => {});
      } catch (redirectErr) {
        console.warn('[Firebase Auth redirect fallback error]:', redirectErr);
      }
    }

    throw error;
  }
}


/**
 * Recursively removes `undefined` properties and replaces undefined elements in arrays
 * to ensure Firestore setDoc/updateDoc never fails with 'Unsupported field value: undefined'.
 */
export function sanitizeForFirestore<T>(data: T): any {
  if (data === undefined) {
    return null;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => (item === undefined ? null : sanitizeForFirestore(item)));
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

/**
 * PROFILES SERVICE
 * Maps to 'profiles' collection
 */
export async function getProfileByEmail(email: string): Promise<UserAccount | null> {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  try {
    const docRef = doc(db, 'profiles', cleanEmail);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserAccount;
    }
  } catch (err) {
    console.warn('[DB Error getProfileByEmail]:', err);
  }
  return null;
}

export async function saveProfile(profile: Partial<UserAccount> & { email: string }): Promise<void> {
  if (!profile.email) return;
  const cleanEmail = profile.email.trim().toLowerCase();
  try {
    const docRef = doc(db, 'profiles', cleanEmail);
    const cleanData = sanitizeForFirestore({
      ...profile,
      email: cleanEmail,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.error('[DB Error saveProfile]:', err);
  }
}

/**
 * PATIENTS SERVICE
 * Maps to 'patients' collection
 */
export async function getPatientsByUser(userEmail: string): Promise<Patient[]> {
  if (!userEmail) return [];
  const cleanEmail = userEmail.trim().toLowerCase();
  try {
    const q = query(
      collection(db, 'patients'),
      where('userEmail', '==', cleanEmail)
    );
    const snapshot = await getDocs(q);
    const list: Patient[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Patient);
    });
    return list;
  } catch (err) {
    console.warn('[DB Error getPatientsByUser]:', err);
    return [];
  }
}

export async function savePatient(patient: Patient, userEmail: string): Promise<void> {
  if (!patient.id || !userEmail) return;
  const cleanEmail = userEmail.trim().toLowerCase();
  try {
    const docRef = doc(db, 'patients', patient.id);
    const cleanData = sanitizeForFirestore({
      ...patient,
      userEmail: cleanEmail,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.error('[DB Error savePatient]:', err);
  }
}

export async function deletePatientFromDb(patientId: string): Promise<void> {
  if (!patientId) return;
  try {
    const docRef = doc(db, 'patients', patientId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('[DB Error deletePatient]:', err);
  }
}

/**
 * APPOINTMENTS & AGENDA SERVICE
 * Maps to 'appointments' collection
 */
export async function getAppointmentsByUser(userEmail: string): Promise<Appointment[]> {
  if (!userEmail) return [];
  const cleanEmail = userEmail.trim().toLowerCase();
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userEmail', '==', cleanEmail)
    );
    const snapshot = await getDocs(q);
    const list: Appointment[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Appointment);
    });
    return list;
  } catch (err) {
    console.warn('[DB Error getAppointmentsByUser]:', err);
    return [];
  }
}

export async function saveAppointment(appointment: Appointment, userEmail: string): Promise<void> {
  if (!appointment.id || !userEmail) return;
  const cleanEmail = userEmail.trim().toLowerCase();
  try {
    const docRef = doc(db, 'appointments', appointment.id);
    const cleanData = sanitizeForFirestore({
      ...appointment,
      userEmail: cleanEmail,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.error('[DB Error saveAppointment]:', err);
  }
}

export async function deleteAppointmentFromDb(appointmentId: string): Promise<void> {
  if (!appointmentId) return;
  try {
    await deleteDoc(doc(db, 'appointments', appointmentId));
  } catch (err) {
    console.error('[DB Error deleteAppointment]:', err);
  }
}

/**
 * FINANCIAL TRANSACTIONS SERVICE
 * Maps to 'transactions' collection
 */
export async function getTransactionsByUser(userEmail: string): Promise<FinancialTransaction[]> {
  if (!userEmail) return [];
  const cleanEmail = userEmail.trim().toLowerCase();
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userEmail', '==', cleanEmail)
    );
    const snapshot = await getDocs(q);
    const list: FinancialTransaction[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as FinancialTransaction);
    });
    return list;
  } catch (err) {
    console.warn('[DB Error getTransactionsByUser]:', err);
    return [];
  }
}

export async function saveTransaction(transaction: FinancialTransaction, userEmail: string): Promise<void> {
  if (!transaction.id || !userEmail) return;
  const cleanEmail = userEmail.trim().toLowerCase();
  try {
    const docRef = doc(db, 'transactions', transaction.id);
    const cleanData = sanitizeForFirestore({
      ...transaction,
      userEmail: cleanEmail,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.error('[DB Error saveTransaction]:', err);
  }
}

/**
 * DIETS & CALCULATION HISTORY SERVICE
 * Maps to 'diets_and_calc' collection
 */
export interface DietAndCalcRecord {
  id: string;
  userEmail: string;
  patientId?: string;
  patientName?: string;
  type: 'tmb_get' | 'pollock' | 'meal_plan' | 'protocol';
  data: any;
  createdAt: string;
}

export async function saveDietOrCalc(record: DietAndCalcRecord): Promise<void> {
  if (!record.id || !record.userEmail) return;
  try {
    const docRef = doc(db, 'diets_and_calc', record.id);
    const cleanData = sanitizeForFirestore({
      ...record,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.error('[DB Error saveDietOrCalc]:', err);
  }
}

export async function getDietAndCalcHistory(userEmail: string): Promise<DietAndCalcRecord[]> {
  if (!userEmail) return [];
  const cleanEmail = userEmail.trim().toLowerCase();
  try {
    const q = query(
      collection(db, 'diets_and_calc'),
      where('userEmail', '==', cleanEmail)
    );
    const snapshot = await getDocs(q);
    const list: DietAndCalcRecord[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as DietAndCalcRecord);
    });
    return list;
  } catch (err) {
    console.warn('[DB Error getDietAndCalcHistory]:', err);
    return [];
  }
}

/**
 * NUTRIA SESSIONS & CHAT HISTORY SERVICE
 * Maps to 'nutria_sessions' collection
 */
export async function saveNutriaSession(userEmail: string, messages: NutriaMessage[]): Promise<void> {
  if (!userEmail || !messages) return;
  const cleanEmail = userEmail.trim().toLowerCase();
  try {
    const docRef = doc(db, 'nutria_sessions', cleanEmail);
    const cleanMessages = messages.slice(-50).map(m => sanitizeForFirestore(m));
    const cleanPayload = sanitizeForFirestore({
      userEmail: cleanEmail,
      messages: cleanMessages,
      lastUpdated: new Date().toISOString()
    });
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (err) {
    console.error('[DB Error saveNutriaSession]:', err);
  }
}

export async function getNutriaSession(userEmail: string): Promise<NutriaMessage[] | null> {
  if (!userEmail) return null;
  const cleanEmail = userEmail.trim().toLowerCase();
  try {
    const docRef = doc(db, 'nutria_sessions', cleanEmail);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return (data.messages as NutriaMessage[]) || null;
    }
  } catch (err) {
    console.warn('[DB Error getNutriaSession]:', err);
  }
  return null;
}

// Aliases & Generic Helpers
export const getPatients = async (userEmail?: string): Promise<Patient[]> => {
  if (userEmail) return getPatientsByUser(userEmail);
  try {
    const snap = await getDocs(collection(db, 'patients'));
    const list: Patient[] = [];
    snap.forEach(d => list.push(d.data() as Patient));
    return list;
  } catch {
    return [];
  }
};

export const savePatientToDb = async (patient: Patient, userEmail?: string): Promise<void> => {
  return savePatient(patient, userEmail || patient.email || 'consultorio@nutrink.com.br');
};

export const getAppointments = async (userEmail?: string): Promise<Appointment[]> => {
  if (userEmail) return getAppointmentsByUser(userEmail);
  try {
    const snap = await getDocs(collection(db, 'appointments'));
    const list: Appointment[] = [];
    snap.forEach(d => list.push(d.data() as Appointment));
    return list;
  } catch {
    return [];
  }
};

export const saveAppointmentToDb = async (appointment: Appointment, userEmail?: string): Promise<void> => {
  return saveAppointment(appointment, userEmail || 'consultorio@nutrink.com.br');
};

export const getTransactions = async (userEmail?: string): Promise<FinancialTransaction[]> => {
  if (userEmail) return getTransactionsByUser(userEmail);
  try {
    const snap = await getDocs(collection(db, 'transactions'));
    const list: FinancialTransaction[] = [];
    snap.forEach(d => list.push(d.data() as FinancialTransaction));
    return list;
  } catch {
    return [];
  }
};

export const saveTransactionToDb = async (transaction: FinancialTransaction, userEmail?: string): Promise<void> => {
  return saveTransaction(transaction, userEmail || 'consultorio@nutrink.com.br');
};

export const getNutriaMessages = async (userEmail: string): Promise<NutriaMessage[] | null> => {
  return getNutriaSession(userEmail);
};

export const saveNutriaMessage = async (userEmail: string, message: NutriaMessage): Promise<void> => {
  const current = await getNutriaSession(userEmail) || [];
  return saveNutriaSession(userEmail, [...current, message]);
};

/**
 * Real-time Firebase Firestore Subscription for Appointments
 */
export function subscribeToAppointments(
  callback: (appointments: Appointment[]) => void,
  userEmail?: string
): () => void {
  try {
    const q = userEmail
      ? query(collection(db, 'appointments'), where('userEmail', '==', userEmail.trim().toLowerCase()))
      : collection(db, 'appointments');

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Appointment[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Appointment);
        });
        callback(list);
      },
      (error) => {
        console.warn('[Firestore onSnapshot Appointments warning]:', error);
      }
    );
  } catch (err) {
    console.warn('[Firestore subscribeToAppointments error]:', err);
    return () => {};
  }
}

/**
 * Real-time Firebase Firestore Subscription for Financial Transactions
 */
export function subscribeToTransactions(
  callback: (transactions: FinancialTransaction[]) => void,
  userEmail?: string
): () => void {
  try {
    const q = userEmail
      ? query(collection(db, 'transactions'), where('userEmail', '==', userEmail.trim().toLowerCase()))
      : collection(db, 'transactions');

    return onSnapshot(
      q,
      (snapshot) => {
        const list: FinancialTransaction[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as FinancialTransaction);
        });
        callback(list);
      },
      (error) => {
        console.warn('[Firestore onSnapshot Transactions warning]:', error);
      }
    );
  } catch (err) {
    console.warn('[Firestore subscribeToTransactions error]:', err);
    return () => {};
  }
}

/**
 * Real-time Firebase Firestore Subscription for Patients
 */
export function subscribeToPatients(
  callback: (patients: Patient[]) => void,
  userEmail?: string
): () => void {
  try {
    const q = userEmail
      ? query(collection(db, 'patients'), where('userEmail', '==', userEmail.trim().toLowerCase()))
      : collection(db, 'patients');

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Patient[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Patient);
        });
        callback(list);
      },
      (error) => {
        console.warn('[Firestore onSnapshot Patients warning]:', error);
      }
    );
  } catch (err) {
    console.warn('[Firestore subscribeToPatients error]:', err);
    return () => {};
  }
}
