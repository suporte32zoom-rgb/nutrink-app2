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
  signInWithCredential, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { Patient, Appointment, FinancialTransaction, UserAccount, NutriaMessage } from '../types';

// Load Firebase configuration
const firebaseConfig = {
  projectId: "gen-lang-client-0157446519",
  appId: "1:193329003759:web:b4922d6b2c9545104e6f1a",
  apiKey: "AIzaSyDb20KbtkPnP9Cn8v26cbMuTvVEkzE_Bss",
  authDomain: "gen-lang-client-0157446519.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-remixnutrinknutr-51d08cbc-daf3-4ec1-978f-d4e0c04f216a",
  storageBucket: "gen-lang-client-0157446519.firebasestorage.app",
  messagingSenderId: "193329003759"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Google Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
