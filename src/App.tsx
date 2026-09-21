import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { CalendarView } from './components/CalendarView';
import { FinanceView } from './components/FinanceView';
import { NutriCalcView } from './components/NutriCalcView';
import { NutriaCopilot } from './components/NutriaCopilot';
import { MealPlansGlobalView } from './components/MealPlansGlobalView';
import { ExamsGlobalView } from './components/ExamsGlobalView';
import { PrescriptionsGlobalView } from './components/PrescriptionsGlobalView';
import { SettingsGlobalView } from './components/SettingsGlobalView';
import { InstitutionalPageView } from './components/InstitutionalPageView';
import { NewPatientModal } from './components/NewPatientModal';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { AppointmentDetailsModal } from './components/AppointmentDetailsModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Footer } from './components/Footer';
import { InstitutionalDocModal } from './components/InstitutionalDocModal';
import { LoginModal } from './components/LoginModal';
import { OnboardingView } from './components/OnboardingView';
import { TelemedicineView } from './components/TelemedicineView';
import { MercadoPagoSubscriptionsView } from './components/MercadoPagoSubscriptionsView';
import { BottomNavigation } from './components/BottomNavigation';
import { 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_FOOD_DATABASE 
} from './data/initialData';
import { 
  Patient, 
  Appointment, 
  FinancialTransaction, 
  NutriaMessage, 
  NutriaActionExecution,
  UserAccount,
  SubscriptionPlan
} from './types';
import { safeFetchJson } from './utils/api';
import { callNutriaDirect } from './services/nutriaGeminiDirect';
import { getNutriaGreeting } from './utils/nutriaGreeting';
import { Bot, Sparkles, MessageSquare, X } from 'lucide-react';
import { 
  getPatients, 
  savePatientToDb, 
  deletePatientFromDb,
  getAppointments,
  saveAppointmentToDb,
  deleteAppointmentFromDb,
  getTransactions,
  saveTransactionToDb,
  getProfileByEmail,
  saveProfile,
  getNutriaMessages,
  saveNutriaMessage,
  subscribeToAppointments,
  subscribeToTransactions,
  subscribeToPatients
} from './services/databaseService';
import { trackPageView, trackAppointmentEvent, trackEvent } from './services/analytics';

// Subwrapper component for /pacientes/:id route
function PatientDetailRouteWrapper({
  patients,
  onOpenNewPatient,
  onOpenNewAppointmentWithPatient,
  onOpenNutriaWithPrompt,
  onUpdatePatient,
  onDeletePatient,
  foodDatabase,
  userAccount,
  onStartTelemedicine,
  onNavigateToNutriCalc,
  appointments,
  onUpdateAppointmentStatus,
  onOpenAppointmentDetails
}: any) {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  return (
    <PatientsView
      patients={patients}
      selectedPatientId={id || null}
      onSelectPatient={(selectedId) => {
        if (selectedId) {
          navigate(`/pacientes/${selectedId}`);
        } else {
          navigate('/pacientes');
        }
      }}
      onOpenNewPatient={onOpenNewPatient}
      onOpenNewAppointmentWithPatient={onOpenNewAppointmentWithPatient}
      onOpenNutriaWithPrompt={onOpenNutriaWithPrompt}
      onUpdatePatient={onUpdatePatient}
      onDeletePatient={onDeletePatient}
      foodDatabase={foodDatabase}
      userAccount={userAccount}
      onStartTelemedicine={onStartTelemedicine}
      onNavigateToNutriCalc={onNavigateToNutriCalc}
      appointments={appointments}
      onUpdateAppointmentStatus={onUpdateAppointmentStatus}
      onOpenAppointmentDetails={onOpenAppointmentDetails}
    />
  );
}

// Subwrapper component for /telemedicina/:roomName route
function TelemedicineRouteWrapper(props: any) {
  const { roomName } = useParams<{ roomName?: string }>();
  return <TelemedicineView {...props} initialRoomName={roomName || props.initialRoomName} />;
}

// Subwrapper component for /docs/:pageId route
function InstitutionalDocRouteWrapper(props: any) {
  const { pageId } = useParams<{ pageId?: string }>();
  return <InstitutionalPageView {...props} pageId={pageId || 'sobre'} />;
}

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check URL parameters for direct deep-linking (e.g. /telemedicina?room=xyz, ?tab=telemedicine)
  const [telemedRoomFromUrl, setTelemedRoomFromUrl] = useState<string | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('room') || urlParams.get('r') || urlParams.get('sala') || null;
    } catch {
      return null;
    }
  });

  const [telemedPatientFromUrl, setTelemedPatientFromUrl] = useState<string | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('patient') || urlParams.get('paciente') || urlParams.get('name') || null;
    } catch {
      return null;
    }
  });

  // User Account & Session Management (restores active session or registered profile)
  const [userAccount, setUserAccount] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('nutrink_user_session');
      if (saved) {
        const parsed: UserAccount = JSON.parse(saved);
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nutrink_user_session');
      return !!saved;
    } catch {
      return false;
    }
  });

  // Application Data States - Strictly isolated per user email
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const savedUser = localStorage.getItem('nutrink_user_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const email = parsed?.email?.trim().toLowerCase();
        if (email) {
          const saved = localStorage.getItem(`nutrink_patients_${email}`);
          return saved ? JSON.parse(saved) : [];
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const savedUser = localStorage.getItem('nutrink_user_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const email = parsed?.email?.trim().toLowerCase();
        if (email) {
          const saved = localStorage.getItem(`nutrink_appointments_${email}`);
          return saved ? JSON.parse(saved) : [];
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const savedUser = localStorage.getItem('nutrink_user_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const email = parsed?.email?.trim().toLowerCase();
        if (email) {
          const saved = localStorage.getItem(`nutrink_transactions_${email}`);
          return saved ? JSON.parse(saved) : [];
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Track page views in Google Analytics whenever the active URL changes
  useEffect(() => {
    const path = location.pathname;
    trackPageView(`NutrinK - ${path}`, path);
  }, [location.pathname]);

  // Sync state changes with email-scoped localStorage
  useEffect(() => {
    const email = userAccount?.email?.trim().toLowerCase();
    if (email) {
      try {
        localStorage.setItem(`nutrink_patients_${email}`, JSON.stringify(patients));
      } catch (e) {
        console.error('Error saving patients:', e);
      }
    }
  }, [patients, userAccount?.email]);

  useEffect(() => {
    const email = userAccount?.email?.trim().toLowerCase();
    if (email) {
      try {
        localStorage.setItem(`nutrink_appointments_${email}`, JSON.stringify(appointments));
      } catch (e) {
        console.error('Error saving appointments:', e);
      }
    }
  }, [appointments, userAccount?.email]);

  useEffect(() => {
    const email = userAccount?.email?.trim().toLowerCase();
    if (email) {
      try {
        localStorage.setItem(`nutrink_transactions_${email}`, JSON.stringify(transactions));
      } catch (e) {
        console.error('Error saving transactions:', e);
      }
    }
  }, [transactions, userAccount?.email]);

  // Modal UI States
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);
  const [selectedAppointmentForDetails, setSelectedAppointmentForDetails] = useState<Appointment | null>(null);
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInstitutionalModalOpen, setIsInstitutionalModalOpen] = useState(false);
  const [activeInstitutionalPageId, setActiveInstitutionalPageId] = useState<string>('sobre');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot_password'>(() => {
    try {
      const registeredUsersRaw = localStorage.getItem('nutrink_registered_users');
      const hasRegisteredUsers = registeredUsersRaw && JSON.parse(registeredUsersRaw).length > 0;
      const hasLastEmail = !!localStorage.getItem('nutrink_last_email');
      return (hasRegisteredUsers || hasLastEmail) ? 'login' : 'register';
    } catch {
      return 'login';
    }
  });

  const [preSelectedPatientForApt, setPreSelectedPatientForApt] = useState<Patient | null>(null);

  // Fallback guest object for child components that require non-null UserAccount
  const [guestDailyCount, setGuestDailyCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nutrink_guest_msg_count');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const effectiveUserAccount: UserAccount = userAccount || {
    id: 'usr-unauthenticated',
    name: 'Profissional de Saúde',
    email: '',
    crn: '',
    specialty: 'Nutrição Clínica & Funcional',
    plan: 'free',
    isSubscribed: false,
    dailyMessageCount: guestDailyCount,
    dailyMessageLimit: 30,
    monthlyMessageCount: guestDailyCount,
    monthlyMessageLimit: 50,
    activeSince: '2026'
  };

  const handleOpenInstitutionalPage = (pageId: string) => {
    navigate(`/${pageId}`);
  };

  const handleOpenLoginModal = (tab: 'login' | 'register' | 'forgot_password' = 'login') => {
    setAuthModalTab(tab);
    setIsLoginModalOpen(true);
  };

  const handleLoginAs = (updated: Partial<UserAccount>) => {
    const cleanEmail = (updated.email || '').trim().toLowerCase();
    const newUser: UserAccount = {
      id: updated.id || `usr-${Date.now()}`,
      name: updated.name || 'Profissional de Saúde',
      email: cleanEmail,
      crn: updated.crn || 'CRN Ativo',
      specialty: updated.specialty || 'Nutrição Clínica & Funcional',
      plan: updated.plan || 'free',
      isSubscribed: updated.isSubscribed || false,
      dailyMessageCount: updated.dailyMessageCount || 0,
      dailyMessageLimit: updated.dailyMessageLimit || 30,
      monthlyMessageCount: updated.monthlyMessageCount || 0,
      monthlyMessageLimit: updated.monthlyMessageLimit || 50,
      activeSince: updated.activeSince || '2026',
      avatarUrl: updated.avatarUrl,
      authProvider: updated.authProvider || 'google',
      googleId: updated.googleId
    };

    try {
      localStorage.setItem('nutrink_user_session', JSON.stringify(newUser));
      if (cleanEmail) {
        localStorage.setItem('nutrink_last_email', cleanEmail);
      }
    } catch (e) {
      console.error('Failed to save session:', e);
    }

    // Load account-specific cache or start clean (zerado) for this profile
    if (cleanEmail) {
      try {
        const savedPatients = localStorage.getItem(`nutrink_patients_${cleanEmail}`);
        setPatients(savedPatients ? JSON.parse(savedPatients) : []);

        const savedApts = localStorage.getItem(`nutrink_appointments_${cleanEmail}`);
        setAppointments(savedApts ? JSON.parse(savedApts) : []);

        const savedTx = localStorage.getItem(`nutrink_transactions_${cleanEmail}`);
        setTransactions(savedTx ? JSON.parse(savedTx) : []);

        const savedNutria = localStorage.getItem(`nutrink_nutria_conversation_history_${cleanEmail}`);
        setNutriaMessages(savedNutria ? JSON.parse(savedNutria) : [DEFAULT_NUTRIA_WELCOME]);
      } catch {
        setPatients([]);
        setAppointments([]);
        setTransactions([]);
        setNutriaMessages([DEFAULT_NUTRIA_WELCOME]);
      }
    } else {
      setPatients([]);
      setAppointments([]);
      setTransactions([]);
      setNutriaMessages([DEFAULT_NUTRIA_WELCOME]);
    }

    setUserAccount(newUser);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    setSelectedPatientId(null);
    navigate('/dashboard');

    if (cleanEmail) {
      saveProfile(newUser).catch(err => console.warn('Erro ao salvar perfil no banco:', err));
    }
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage on logout:', e);
    }
    setUserAccount(null);
    setIsAuthenticated(false);
    setPatients([]);
    setAppointments([]);
    setTransactions([]);
    setSelectedPatientId(null);
    setNutriaMessages([DEFAULT_NUTRIA_WELCOME]);
    setIsProfileModalOpen(false);
    setIsLoginModalOpen(false);
    setIsSubscriptionModalOpen(false);
    setIsNewPatientOpen(false);
    setIsNewAppointmentOpen(false);
    setIsNewTransactionOpen(false);
    setIsAppointmentDetailsOpen(false);
    setSelectedAppointmentForDetails(null);
    setGlobalSearch('');
    navigate('/dashboard');
  };

  // Real-time backend subscription sync (via Mercado Pago Webhook)
  useEffect(() => {
    if (!userAccount?.email) return;

    let isMounted = true;

    const checkBackendSubscription = async () => {
      try {
        const email = encodeURIComponent(userAccount.email.trim().toLowerCase());
        const res = await safeFetchJson<{ hasActiveSubscription: boolean; planId: any }>(
          `/api/payments/user-subscription/${email}`,
          { silent: true }
        );
        if (!isMounted) return;
        if (res.ok && res.data) {
          const data = res.data;
          if (data.hasActiveSubscription && (!userAccount.isSubscribed || userAccount.plan !== data.planId)) {
            const upgradedUser: UserAccount = {
              ...userAccount,
              plan: data.planId,
              isSubscribed: true,
              dailyMessageLimit: 99999,
              monthlyMessageLimit: 99999
            };
            setUserAccount(upgradedUser);
            try {
              localStorage.setItem('nutrink_user_session', JSON.stringify(upgradedUser));

              const registeredRaw = localStorage.getItem('nutrink_registered_users');
              if (registeredRaw) {
                const regList = JSON.parse(registeredRaw);
                const updatedList = regList.map((u: any) => 
                  u.email?.toLowerCase() === userAccount.email.toLowerCase()
                    ? { ...u, plan: data.planId, isSubscribed: true }
                    : u
                );
                localStorage.setItem('nutrink_registered_users', JSON.stringify(updatedList));
              }
            } catch (storageErr) {
              console.warn('[NutrinK LocalStorage Warn]', storageErr);
            }
          }
        }
      } catch {
        // silent fallback
      }
    };

    checkBackendSubscription();
    const subSyncInterval = setInterval(checkBackendSubscription, 20000);
    return () => {
      isMounted = false;
      clearInterval(subSyncInterval);
    };
  }, [userAccount?.email, userAccount?.plan, userAccount?.isSubscribed]);

  // NUTRIA Copilot Conversation History State
  const defaultNutriaWelcomeText = getNutriaGreeting(userAccount);
  const DEFAULT_NUTRIA_WELCOME: NutriaMessage = {
    id: 'msg-init-1',
    role: 'assistant',
    content: defaultNutriaWelcomeText,
    timestamp: 'Agora'
  };

  const [nutriaMessages, setNutriaMessages] = useState<NutriaMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('nutrink_user_session');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          const email = parsed?.email?.trim().toLowerCase();
          if (email) {
            const saved = localStorage.getItem(`nutrink_nutria_conversation_history_${email}`);
            if (saved) {
              const parsedHistory = JSON.parse(saved);
              if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                if (parsedHistory.length === 1 && parsedHistory[0]?.role === 'assistant') {
                  return [{
                    ...parsedHistory[0],
                    content: getNutriaGreeting(parsed)
                  }];
                }
                return parsedHistory;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao restaurar histórico de conversas da NUTRIA:', err);
      }
    }
    return [DEFAULT_NUTRIA_WELCOME];
  });

  // Atualiza saudação inicial automaticamente quando o usuário logar ou atualizar seu perfil
  useEffect(() => {
    const greeting = getNutriaGreeting(userAccount);
    setNutriaMessages(prev => {
      if (!prev || prev.length === 0) {
        return [{
          id: 'msg-init-1',
          role: 'assistant',
          content: greeting,
          timestamp: 'Agora'
        }];
      }
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{
          ...prev[0],
          content: greeting
        }];
      }
      return prev;
    });
  }, [userAccount?.name]);

  useEffect(() => {
    const email = userAccount?.email?.trim().toLowerCase();
    if (email && nutriaMessages.length > 0) {
      try {
        localStorage.setItem(`nutrink_nutria_conversation_history_${email}`, JSON.stringify(nutriaMessages));
      } catch {}
    }
  }, [nutriaMessages, userAccount?.email]);

  const handleClearNutriaHistory = () => {
    const freshWelcome: NutriaMessage = {
      id: 'msg-init-1',
      role: 'assistant',
      content: getNutriaGreeting(userAccount),
      timestamp: 'Agora'
    };
    setNutriaMessages([freshWelcome]);
    const email = userAccount?.email?.trim().toLowerCase();
    if (email) {
      try {
        localStorage.setItem(`nutrink_nutria_conversation_history_${email}`, JSON.stringify([freshWelcome]));
      } catch {}
    }
  };

  const [isNutriaLoading, setIsNutriaLoading] = useState(false);

  // Initial load and real-time live sync with Cloud Database for the active user account
  useEffect(() => {
    const email = userAccount?.email ? userAccount.email.trim().toLowerCase() : undefined;

    if (!email) {
      return;
    }

    let isSubscribed = true;

    const loadInitialCloudData = async () => {
      try {
        const cloudPatients = await getPatients(email);
        if (!isSubscribed) return;
        setPatients(cloudPatients || []);
        try { localStorage.setItem(`nutrink_patients_${email}`, JSON.stringify(cloudPatients || [])); } catch {}

        const cloudApts = await getAppointments(email);
        if (!isSubscribed) return;
        setAppointments(cloudApts || []);
        try { localStorage.setItem(`nutrink_appointments_${email}`, JSON.stringify(cloudApts || [])); } catch {}

        const cloudTx = await getTransactions(email);
        if (!isSubscribed) return;
        setTransactions(cloudTx || []);
        try { localStorage.setItem(`nutrink_transactions_${email}`, JSON.stringify(cloudTx || [])); } catch {}

        const profile = await getProfileByEmail(email);
        if (!isSubscribed) return;
        if (profile) {
          setUserAccount(prev => (prev ? { ...prev, ...profile } : profile));
        }

        const cloudMsgs = await getNutriaMessages(email);
        if (!isSubscribed) return;
        if (cloudMsgs && cloudMsgs.length > 0) {
          setNutriaMessages(cloudMsgs);
          try { localStorage.setItem(`nutrink_nutria_conversation_history_${email}`, JSON.stringify(cloudMsgs)); } catch {}
        }
      } catch (err) {
        console.warn('Syncing user cloud data with cloud store...', err);
      }
    };

    loadInitialCloudData();

    const unsubApts = subscribeToAppointments((cloudApts) => {
      if (isSubscribed) {
        setAppointments(cloudApts || []);
        try { localStorage.setItem(`nutrink_appointments_${email}`, JSON.stringify(cloudApts || [])); } catch {}
      }
    }, email);

    const unsubTx = subscribeToTransactions((cloudTx) => {
      if (isSubscribed) {
        setTransactions(cloudTx || []);
        try { localStorage.setItem(`nutrink_transactions_${email}`, JSON.stringify(cloudTx || [])); } catch {}
      }
    }, email);

    const unsubPatients = subscribeToPatients((cloudPatients) => {
      if (isSubscribed) {
        setPatients(cloudPatients || []);
        try { localStorage.setItem(`nutrink_patients_${email}`, JSON.stringify(cloudPatients || [])); } catch {}
      }
    }, email);

    return () => {
      isSubscribed = false;
      unsubApts();
      unsubTx();
      unsubPatients();
    };
  }, [userAccount?.email]);

  const activePatient = patients.find(p => p.id === selectedPatientId) || null;

  const paidAppointments = appointments.filter(a => 
    a.paymentStatus === 'pago' || (a.status === 'realizada' && a.paymentStatus !== 'cancelado')
  );
  const appointmentsRevenue = paidAppointments.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const transactionsRevenue = transactions
    .filter(t => t.type === 'receita' && t.status === 'concluido' && !paidAppointments.some(a => a.id === t.id))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRevenue = appointmentsRevenue + transactionsRevenue;

  const totalExpenses = transactions
    .filter(t => t.type === 'despesa' && t.status === 'concluido')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenAppointmentDetails = (apt: Appointment) => {
    setSelectedAppointmentForDetails(apt);
    setIsAppointmentDetailsOpen(true);
  };

  const handleSaveAppointmentDetails = async (updated: Appointment) => {
    const email = userAccount?.email?.trim().toLowerCase();
    setAppointments(prev => {
      const exists = prev.some(a => a.id === updated.id);
      const updatedList = exists 
        ? prev.map(a => a.id === updated.id ? updated : a)
        : [updated, ...prev];
      if (email) {
        try { localStorage.setItem(`nutrink_appointments_${email}`, JSON.stringify(updatedList)); } catch {}
      }
      return updatedList;
    });
    setSelectedAppointmentForDetails(updated);
    await saveAppointmentToDb(updated, userAccount?.email).catch(err => console.warn('Erro ao persistir agendamento no Firestore:', err));
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    const email = userAccount?.email?.trim().toLowerCase();
    setAppointments(prev => {
      const updatedList = prev.filter(a => a.id !== appointmentId);
      if (email) {
        try { localStorage.setItem(`nutrink_appointments_${email}`, JSON.stringify(updatedList)); } catch {}
      }
      return updatedList;
    });
    if (selectedAppointmentForDetails?.id === appointmentId) {
      setSelectedAppointmentForDetails(null);
      setIsAppointmentDetailsOpen(false);
    }
    await deleteAppointmentFromDb(appointmentId).catch(err => console.warn('Erro ao deletar agendamento do Firestore:', err));
  };

  const handleUpdateAppointmentStatus = (aptId: string, newStatus: Appointment['status']) => {
    const email = userAccount?.email?.trim().toLowerCase();
    setAppointments(prev => {
      const updated = prev.map(a => {
        if (a.id === aptId) {
          return {
            ...a,
            status: newStatus,
            paymentStatus: newStatus === 'realizada' ? 'pago' : a.paymentStatus
          };
        }
        return a;
      });
      const targetApt = updated.find(a => a.id === aptId);
      if (targetApt) {
        saveAppointmentToDb(targetApt, userAccount?.email).catch(err => console.warn('Erro ao atualizar agendamento:', err));
      }
      if (email) {
        try { localStorage.setItem(`nutrink_appointments_${email}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  const handleOpenNewAppointmentWithPatient = (patient: Patient) => {
    setPreSelectedPatientForApt(patient);
    setIsNewAppointmentOpen(true);
  };

  const handleUpdatePatient = (updated: Patient) => {
    const email = userAccount?.email?.trim().toLowerCase();
    setPatients(prev => {
      const updatedList = prev.map(p => p.id === updated.id ? updated : p);
      if (email) {
        try { localStorage.setItem(`nutrink_patients_${email}`, JSON.stringify(updatedList)); } catch {}
      }
      return updatedList;
    });
    savePatientToDb(updated, userAccount?.email).catch(err => console.warn('Erro ao salvar paciente na nuvem:', err));
  };

  const handleDeletePatient = (patientId: string) => {
    const email = userAccount?.email?.trim().toLowerCase();
    setPatients(prev => {
      const updated = prev.filter(p => p.id !== patientId);
      if (email) {
        try { localStorage.setItem(`nutrink_patients_${email}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    setAppointments(prev => {
      const updated = prev.filter(a => a.patientId !== patientId);
      if (email) {
        try { localStorage.setItem(`nutrink_appointments_${email}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    deletePatientFromDb(patientId).catch(err => console.warn('Erro ao deletar paciente na nuvem:', err));
    if (selectedPatientId === patientId) {
      setSelectedPatientId(null);
      navigate('/pacientes');
    }
  };

  const handleOpenNutriaWithPrompt = (prompt: string) => {
    setIsFloatingChatOpen(true);
    handleSendNutriaMessage(prompt);
  };

  const handleSelectPlan = (plan: SubscriptionPlan, registeredUser?: Partial<UserAccount>) => {
    let finalUser: UserAccount;
    setUserAccount(prev => {
      const base = registeredUser ? { ...effectiveUserAccount, ...registeredUser } : (prev || effectiveUserAccount);
      const updated: UserAccount = {
        ...base,
        plan: plan,
        isSubscribed: plan !== 'free',
        subscriptionExpiresAt: plan === 'premium_anual' ? '15/08/2027' : '15/09/2026'
      };
      finalUser = updated;
      try {
        localStorage.setItem('nutrink_user_session', JSON.stringify(updated));
        if (updated.email) {
          localStorage.setItem('nutrink_last_email', updated.email.trim().toLowerCase());
        }
      } catch {}
      return updated;
    });
    setIsAuthenticated(true);
    setIsSubscriptionModalOpen(false);
    navigate('/dashboard');

    const userName = registeredUser?.name || userAccount?.name || 'Doutor(a)';

    const upgradeMsg: NutriaMessage = {
      id: `msg-upg-${Date.now()}`,
      role: 'assistant',
      content: `# 🎉 PARABÉNS, ${userName.toUpperCase()}! SEU CONSULTÓRIO ESTÁ ATIVADO!
      
Seu acesso ao **Plano ${plan === 'premium_anual' ? 'Premium Anual (R$ 399,00 à vista via PIX)' : 'Premium Mensal (R$ 39,00 à vista via PIX)'}** foi liberado e seu cadastro foi registrado com sucesso!

### 🌟 Seu Consultório Inteligente Desbloqueado:
- **Copiloto NUTRIA ILIMITADO**: Sem restrições de mensagens, cálculos ou consultas.
- **Relatórios & Prescrições Completas**: Prontas para impressão e envio aos pacientes.
- **NutriCalc & Todos os Módulos**: Acesso irrestrito a todas as ferramentas clínicas e financeiras.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setNutriaMessages(prev => [...prev, upgradeMsg]);
  };

  // Intercept Mercado Pago return URL redirects
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname.toLowerCase();
      const paymentStatus = urlParams.get('payment_status') || urlParams.get('collection_status') || urlParams.get('status');
      const planParam = urlParams.get('plan') as SubscriptionPlan | null;

      const isSuccessRoute = pathname.includes('/sucesso') || paymentStatus === 'approved';
      const isErrorRoute = pathname.includes('/erro') || paymentStatus === 'rejected' || paymentStatus === 'failure';
      const isPendingRoute = pathname.includes('/pendente') || paymentStatus === 'pending' || paymentStatus === 'in_process';

      if (isSuccessRoute) {
        const targetPlan: SubscriptionPlan = planParam === 'premium_anual' ? 'premium_anual' : 'premium_mensal';
        handleSelectPlan(targetPlan);
        
        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
          });
        } catch {}

        navigate('/dashboard');
      } else if (isPendingRoute) {
        setNutriaMessages(prev => [
          ...prev,
          {
            id: `msg-pending-${Date.now()}`,
            role: 'assistant',
            content: `⏳ **Pagamento em Análise no Mercado Pago!**\n\nRecebemos seu pedido de assinatura. Caso tenha optado por boleto bancário ou PIX em processamento, seu plano será ativado automaticamente assim que a compensação for confirmada.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        navigate('/dashboard');
      } else if (isErrorRoute) {
        setNutriaMessages(prev => [
          ...prev,
          {
            id: `msg-error-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ **Transação não concluída no Mercado Pago.**\n\nO pagamento não foi processado pela operadora. Você pode tentar novamente com outro cartão, saldo ou PIX instantâneo na aba **Planos e Assinaturas**.`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        navigate('/dashboard');
      }
    } catch (e) {
      console.warn('Erro ao processar retorno do Mercado Pago:', e);
    }
  }, []);

  const handleSendNutriaMessage = async (userInput: string) => {
    const inputLower = userInput.toLowerCase();
    const isPlanInquiry = inputLower.includes('plano') || inputLower.includes('assinatura') || inputLower.includes('preço') || inputLower.includes('valor') || inputLower.includes('quanto custa') || inputLower.includes('upgrade');

    const userPlan = effectiveUserAccount.plan;
    const isFree = userPlan === 'free';
    const msgCount = effectiveUserAccount.dailyMessageCount;
    const msgLimit = effectiveUserAccount.dailyMessageLimit;

    if (isFree && msgCount >= msgLimit && !isPlanInquiry) {
      const userMsg: NutriaMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: userInput,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      const isUnauthenticated = !isAuthenticated || !userAccount?.email || userAccount.id === 'usr-unauthenticated';

      const limitBlockedMsg: NutriaMessage = {
        id: `msg-limit-${Date.now() + 1}`,
        role: 'assistant',
        content: isUnauthenticated
          ? `🔒 Você atingiu o limite de **30 mensagens gratuitas** por dia com a NUTRIA. Para continuar enviando comandos, salvando prontuários e gerando prescrições clínicas completas, crie sua conta gratuita ou assine o **Plano Premium**!`
          : `🔒 Você atingiu o limite de **30 mensagens diárias** do Plano Gratuito. Assine o **Plano Premium** (R$ 39,00/mês ou R$ 399,00/ano via PIX) para ter conversas ilimitadas e relatórios clínicos completos!`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isLocked: true
      };

      setNutriaMessages(prev => [...prev, userMsg, limitBlockedMsg]);

      if (isUnauthenticated) {
        handleOpenLoginModal('register');
      } else {
        setIsSubscriptionModalOpen(true);
      }
      return;
    }

    const userMsg: NutriaMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setNutriaMessages(prev => [...prev, userMsg]);
    setIsNutriaLoading(true);

    if (userAccount) {
      setUserAccount(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          dailyMessageCount: (prev.dailyMessageCount || 0) + 1,
          monthlyMessageCount: (prev.monthlyMessageCount || 0) + 1
        };
        try { localStorage.setItem('nutrink_user_session', JSON.stringify(updated)); } catch {}
        return updated;
      });
    } else {
      setGuestDailyCount(prev => {
        const next = prev + 1;
        try { localStorage.setItem('nutrink_guest_msg_count', String(next)); } catch {}
        return next;
      });
    }

    try {
      const context = {
        activePatient: activePatient ? {
          id: activePatient.id,
          name: activePatient.name,
          age: activePatient.age,
          gender: activePatient.gender,
          weightKg: activePatient.currentWeightKg,
          heightCm: activePatient.heightCm,
          bmi: activePatient.bmi,
          tmb: activePatient.tmb,
          get: activePatient.get,
          bodyFatPercentage: activePatient.bodyFatPercentage,
          objective: activePatient.objective,
          allergies: activePatient.anamnese?.foodAllergiesAndIntolerances,
          medications: activePatient.anamnese?.currentMedicationsAndSupplements,
          clinicalHistory: activePatient.anamnese?.clinicalHistory,
          foodPlan: activePatient.foodPlan
        } : null,
        todayAppointments: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).map(a => ({
          id: a.id,
          patientName: a.patientName,
          time: a.time,
          status: a.status,
          location: a.location,
          price: a.price
        })),
        patientsSummary: {
          total: patients.length,
          names: patients.slice(0, 10).map(p => ({ id: p.id, name: p.name, objective: p.objective }))
        },
        financialSummary: {
          totalRevenue,
          totalExpenses,
          balance: totalRevenue - totalExpenses
        },
        userAccount: {
          name: effectiveUserAccount.name,
          plan: effectiveUserAccount.plan,
          isSubscribed: effectiveUserAccount.isSubscribed,
          crn: effectiveUserAccount.crn,
          specialty: effectiveUserAccount.specialty
        }
      };

      const response = await callNutriaDirect(userInput, context);

      const assistantMsg: NutriaMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: response.actionExecuted
      };

      setNutriaMessages(prev => [...prev, assistantMsg]);

      if (userAccount?.email) {
        saveNutriaMessage(userAccount.email, userMsg).catch(err => console.warn('Erro ao salvar msg user no banco:', err));
        saveNutriaMessage(userAccount.email, assistantMsg).catch(err => console.warn('Erro ao salvar msg assist no banco:', err));
      }

      if (response.actionExecuted) {
        executeNutriaAction(response.actionExecuted);
      }
    } catch (error: any) {
      console.error(error);
      console.error('Error in Nutria conversation (Gemini 3.7 Flash):', error?.message || error);
      const errorMsg: NutriaMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Desculpe, ocorreu uma oscilação na conexão ao processar sua solicitação: ${error?.message ? `(${error.message})` : 'consulte o console'}. Por favor, tente novamente.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setNutriaMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsNutriaLoading(false);
    }
  };

  const executeNutriaAction = (actionExecuted: NutriaActionExecution) => {
    try {
      const payload = actionExecuted.payload || {};

      if (actionExecuted.type === 'patient_created' || actionExecuted.type === 'CREATE_PATIENT') {
        const rawWeight = parseFloat(payload.weightKg || payload.currentWeightKg || payload.peso || 70);
        const rawHeight = parseFloat(payload.heightCm || payload.altura || 170);
        const heightM = rawHeight / 100;
        const bmi = heightM > 0 ? parseFloat((rawWeight / (heightM * heightM)).toFixed(1)) : 24.2;

        const newPat: Patient = {
          id: payload.id || `pat-${Date.now()}`,
          name: payload.name || payload.nome || 'Novo Paciente',
          age: parseInt(payload.age || payload.idade || 30, 10),
          gender: payload.gender || payload.genero || 'feminino',
          objective: payload.objective || payload.objetivo || 'emagrecimento',
          currentWeightKg: rawWeight,
          heightCm: rawHeight,
          bmi: bmi,
          bodyFatPercentage: parseFloat(payload.bodyFatPercentage || 20),
          status: 'ativo',
          phone: payload.phone || '(11) 99999-0000',
          email: payload.email || `${(payload.name || 'paciente').toLowerCase().replace(/\s+/g, '')}@email.com`,
          notes: payload.notes || payload.observacoes || 'Cadastrado via copiloto autônomo NÚTRIA.',
          tags: [payload.objective || 'nutricao_clinica'],
          createdAt: new Date().toISOString().split('T')[0],
          anamnese: {
            clinicalHistory: payload.notes || 'Sem restrições relatadas.',
            foodAllergiesAndIntolerances: 'Nenhuma alergia relatada.',
            currentMedicationsAndSupplements: 'Nenhum medicamento informado.',
            waterIntakeLiters: 2.5
          },
          evolutionHistory: [
            {
              id: `ev-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              weightKg: rawWeight,
              heightCm: rawHeight,
              bmi: bmi,
              bodyFatPercentage: parseFloat(payload.bodyFatPercentage || 20),
              notes: 'Avaliação inicial cadastrada pela NÚTRIA.'
            }
          ]
        };

        setPatients(prev => [newPat, ...prev]);
        setSelectedPatientId(newPat.id);
        navigate(`/pacientes/${newPat.id}`);
      } else if (actionExecuted.type === 'patient_selected' || actionExecuted.type === 'SELECT_PATIENT') {
        const pName = (payload.patientName || '').toLowerCase();
        const found = patients.find(p => p.id === payload.patientId || (pName && p.name.toLowerCase().includes(pName)));
        if (found) {
          setSelectedPatientId(found.id);
          navigate(`/pacientes/${found.id}`);
        }
      } else if (actionExecuted.type === 'appointment_scheduled' || actionExecuted.type === 'SCHEDULE_APPOINTMENT') {
        const newApt: Appointment = {
          id: payload.id || `apt-${Date.now()}`,
          patientId: payload.patientId || (activePatient ? activePatient.id : 'pat-general'),
          patientName: payload.patientName || (activePatient ? activePatient.name : 'Paciente NutrinK'),
          date: payload.date || new Date().toISOString().split('T')[0],
          time: payload.time || '14:00',
          durationMinutes: payload.durationMinutes || 50,
          type: payload.type || 'retorno',
          status: payload.status || 'confirmada',
          location: payload.location || 'presencial_consultorio',
          modality: payload.location === 'online_video' ? 'online' : 'presencial',
          price: payload.price || payload.value || 350,
          notes: payload.notes || 'Agendamento registrado pelo copiloto NÚTRIA.'
        };
        setAppointments(prev => [...prev, newApt]);
        navigate('/agenda');
      } else if (actionExecuted.type === 'transaction_logged' || actionExecuted.type === 'ADD_FINANCE_TRANSACTION') {
        const newTx: FinancialTransaction = {
          id: payload.id || `tx-${Date.now()}`,
          description: payload.description || payload.descricao || 'Consulta Nutricional',
          amount: parseFloat(payload.amount || payload.valor || 350),
          type: payload.type || 'receita',
          category: payload.category || 'Consultas',
          date: payload.date || new Date().toISOString().split('T')[0],
          paymentMethod: payload.paymentMethod || 'pix',
          status: 'concluido'
        };
        setTransactions(prev => [newTx, ...prev]);
        navigate('/financeiro');
      }
    } catch (e) {
      console.warn('Erro ao executar ação local da NÚTRIA:', e);
    }
  };

  // Render Onboarding and Presentation screen when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-fuchsia-600 selection:text-white">
        <OnboardingView
          onCompleteAuth={(user, destinationTab) => {
            handleLoginAs(user);
          }}
          onOpenTermsDoc={(pageId) => {
            setActiveInstitutionalPageId(pageId);
            setIsInstitutionalModalOpen(true);
          }}
        />
        <InstitutionalDocModal
          isOpen={isInstitutionalModalOpen}
          onClose={() => setIsInstitutionalModalOpen(false)}
          initialPageId={activeInstitutionalPageId}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0B18] text-white flex flex-col font-sans selection:bg-fuchsia-600 selection:text-white">
      
      {/* Global Header with Brand and Quick Actions */}
      <Header
        onOpenNutriaChat={() => setIsFloatingChatOpen(true)}
        onOpenNewPatient={() => setIsNewPatientOpen(true)}
        onOpenNewAppointment={() => {
          setPreSelectedPatientForApt(null);
          setIsNewAppointmentOpen(true);
        }}
        onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenLoginModal={() => handleOpenLoginModal('login')}
        userAccount={effectiveUserAccount}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        activePatientCount={patients.length}
      />

      {/* Global Navigation Bar */}
      <Navigation
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        todayAppointmentsCount={appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
        pendingAppointmentsCount={appointments.filter(a => a.status === 'agendada').length}
        isSubscribed={effectiveUserAccount.isSubscribed}
      />

      {/* Main Dynamic View with Browser URL Routing */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        <Routes>
          
          {/* Dashboard / Painel Principal */}
          <Route path="/" element={
            <DashboardView
              patients={patients}
              appointments={appointments}
              transactions={transactions}
              userAccount={userAccount}
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                navigate(`/pacientes/${id}`);
              }}
              onOpenNewPatient={() => setIsNewPatientOpen(true)}
              onOpenNewAppointment={() => {
                setPreSelectedPatientForApt(null);
                setIsNewAppointmentOpen(true);
              }}
              onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenAppointmentDetails={handleOpenAppointmentDetails}
            />
          } />

          <Route path="/dashboard" element={
            <DashboardView
              patients={patients}
              appointments={appointments}
              transactions={transactions}
              userAccount={userAccount}
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                navigate(`/pacientes/${id}`);
              }}
              onOpenNewPatient={() => setIsNewPatientOpen(true)}
              onOpenNewAppointment={() => {
                setPreSelectedPatientForApt(null);
                setIsNewAppointmentOpen(true);
              }}
              onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenAppointmentDetails={handleOpenAppointmentDetails}
            />
          } />

          {/* Pacientes & Prontuários (Lista e Detalhes) */}
          <Route path="/pacientes" element={
            <PatientsView
              patients={patients}
              selectedPatientId={null}
              onSelectPatient={(id) => {
                if (id) navigate(`/pacientes/${id}`);
              }}
              onOpenNewPatient={() => setIsNewPatientOpen(true)}
              onOpenNewAppointmentWithPatient={handleOpenNewAppointmentWithPatient}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
              foodDatabase={INITIAL_FOOD_DATABASE}
              userAccount={userAccount || undefined}
              onStartTelemedicine={(patientId) => {
                setSelectedPatientId(patientId);
                navigate('/telemedicina');
              }}
              onNavigateToNutriCalc={(patientId) => {
                setSelectedPatientId(patientId);
                navigate('/antropometria');
              }}
              appointments={appointments}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onOpenAppointmentDetails={handleOpenAppointmentDetails}
            />
          } />

          <Route path="/pacientes/:id" element={
            <PatientDetailRouteWrapper
              patients={patients}
              onOpenNewPatient={() => setIsNewPatientOpen(true)}
              onOpenNewAppointmentWithPatient={handleOpenNewAppointmentWithPatient}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
              foodDatabase={INITIAL_FOOD_DATABASE}
              userAccount={userAccount || undefined}
              onStartTelemedicine={(patientId: string) => {
                setSelectedPatientId(patientId);
                navigate('/telemedicina');
              }}
              onNavigateToNutriCalc={(patientId: string) => {
                setSelectedPatientId(patientId);
                navigate('/antropometria');
              }}
              appointments={appointments}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onOpenAppointmentDetails={handleOpenAppointmentDetails}
            />
          } />

          {/* Agenda de Consultas */}
          <Route path="/agenda" element={
            <CalendarView
              appointments={appointments}
              patients={patients}
              onOpenNewAppointment={() => {
                setPreSelectedPatientForApt(null);
                setIsNewAppointmentOpen(true);
              }}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                navigate(`/pacientes/${id}`);
              }}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
              onStartTelemedicine={(patientId) => {
                setSelectedPatientId(patientId);
                navigate('/telemedicina');
              }}
              onOpenAppointmentDetails={handleOpenAppointmentDetails}
            />
          } />
          <Route path="/consultas" element={<Navigate to="/agenda" replace />} />

          {/* Planos Alimentares (Dieta & TACO) */}
          <Route path="/planos-alimentares" element={
            <MealPlansGlobalView
              patients={patients}
              onUpdatePatient={handleUpdatePatient}
              foodDatabase={INITIAL_FOOD_DATABASE}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
              userAccount={effectiveUserAccount}
            />
          } />
          <Route path="/dietas" element={<Navigate to="/planos-alimentares" replace />} />

          {/* Antropometria & NutriCalc */}
          <Route path="/antropometria" element={
            <NutriCalcView
              patients={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              onUpdatePatient={handleUpdatePatient}
              userAccount={effectiveUserAccount}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
            />
          } />
          <Route path="/nutricalc" element={<Navigate to="/antropometria" replace />} />
          <Route path="/calculos" element={<Navigate to="/antropometria" replace />} />

          {/* Exames & Biomarcadores */}
          <Route path="/exames" element={
            <ExamsGlobalView
              patients={patients}
              onUpdatePatient={handleUpdatePatient}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
              userAccount={effectiveUserAccount}
              initialSelectedPatientId={selectedPatientId}
            />
          } />

          {/* Prescrições & Fórmulas */}
          <Route path="/prescricoes" element={
            <PrescriptionsGlobalView
              patients={patients}
              onUpdatePatient={handleUpdatePatient}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
              userAccount={effectiveUserAccount}
              initialSelectedPatientId={selectedPatientId}
            />
          } />

          {/* Telemedicina & Vídeo */}
          <Route path="/telemedicina" element={
            <TelemedicineView
              patients={patients}
              appointments={appointments}
              userAccount={effectiveUserAccount}
              initialRoomName={telemedRoomFromUrl || undefined}
              initialPatientName={telemedPatientFromUrl || undefined}
              isGuestPatient={!isAuthenticated && Boolean(telemedRoomFromUrl)}
              onUpdatePatient={handleUpdatePatient}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onNavigateTab={(tab) => {
                if (tab === 'patients' && selectedPatientId) {
                  navigate(`/pacientes/${selectedPatientId}`);
                } else if (tab === 'patients') {
                  navigate('/pacientes');
                } else if (tab === 'calendar') {
                  navigate('/agenda');
                } else if (tab === 'finance') {
                  navigate('/financeiro');
                } else if (tab === 'nutricalc') {
                  navigate('/antropometria');
                } else {
                  navigate('/dashboard');
                }
              }}
            />
          } />
          <Route path="/telemedicina/:roomName" element={
            <TelemedicineRouteWrapper
              patients={patients}
              appointments={appointments}
              userAccount={effectiveUserAccount}
              initialPatientName={telemedPatientFromUrl || undefined}
              isGuestPatient={!isAuthenticated && Boolean(telemedRoomFromUrl)}
              onUpdatePatient={handleUpdatePatient}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onNavigateTab={(tab: string) => navigate(`/${tab}`)}
            />
          } />

          {/* Financeiro */}
          <Route path="/financeiro" element={
            <FinanceView
              transactions={transactions}
              patients={patients}
              appointments={appointments}
              onOpenNewTransaction={() => setIsNewTransactionOpen(true)}
              onOpenNutriaWithPrompt={handleOpenNutriaWithPrompt}
            />
          } />
          <Route path="/financas" element={<Navigate to="/financeiro" replace />} />

          {/* Copiloto NÚTRIA IA Hub */}
          <Route path="/nutria" element={
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-fuchsia-400" />
                    Central NUTRIA • Assistente & Copiloto Clínico
                  </h1>
                  <p className="text-xs text-purple-300">
                    Gerencie prontuários, planos alimentares, exames e rotinas por texto ou voz.
                  </p>
                </div>
              </div>

              <NutriaCopilot
                messages={nutriaMessages}
                onSendMessage={handleSendNutriaMessage}
                isLoading={isNutriaLoading}
                activePatient={activePatient}
                todayAppointments={appointments.filter(a => a.date === new Date().toISOString().split('T')[0])}
                patientsCount={patients.length}
                monthlyRevenue={totalRevenue}
                monthlyExpenses={totalExpenses}
                userAccount={effectiveUserAccount}
                onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
                onOpenLoginModal={(tab) => handleOpenLoginModal(tab || 'register')}
                onClearMessages={handleClearNutriaHistory}
              />
            </div>
          } />
          <Route path="/copiloto" element={<Navigate to="/nutria" replace />} />
          <Route path="/nutria_hub" element={<Navigate to="/nutria" replace />} />

          {/* Planos e Assinaturas */}
          <Route path="/planos" element={
            <MercadoPagoSubscriptionsView
              userAccount={userAccount || undefined}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onSelectPlan={(plan, billingCycle) => {
                if (userAccount) {
                  const planId = billingCycle === 'annual' ? 'premium_anual' : 'premium_mensal';
                  const upgradedUser: UserAccount = {
                    ...userAccount,
                    plan: planId,
                    isSubscribed: true,
                    dailyMessageLimit: 99999,
                    monthlyMessageLimit: 99999
                  };
                  setUserAccount(upgradedUser);
                  localStorage.setItem('nutrink_user_session', JSON.stringify(upgradedUser));
                }
              }}
            />
          } />
          <Route path="/assinatura" element={<Navigate to="/planos" replace />} />
          <Route path="/assinaturas" element={<Navigate to="/planos" replace />} />
          <Route path="/precos" element={<Navigate to="/planos" replace />} />

          {/* Configurações & Perfil */}
          <Route path="/configuracoes" element={
            <SettingsGlobalView
              userAccount={effectiveUserAccount}
              onSaveProfile={(updated) => {
                const updatedFull: UserAccount = { ...effectiveUserAccount, ...updated };
                setUserAccount(updatedFull);
                try {
                  localStorage.setItem('nutrink_user_session', JSON.stringify(updatedFull));
                } catch {}
                saveProfile(updatedFull).catch(err => console.warn('Erro ao salvar:', err));
              }}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onLogout={handleLogout}
            />
          } />
          <Route path="/perfil" element={<Navigate to="/configuracoes" replace />} />

          {/* Páginas Institucionais & Legais com URLs próprias */}
          <Route path="/sobre" element={
            <InstitutionalPageView
              pageId="sobre"
              onOpenNutriaPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={() => handleOpenLoginModal('login')}
            />
          } />

          <Route path="/recursos" element={
            <InstitutionalPageView
              pageId="recursos"
              onOpenNutriaPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={() => handleOpenLoginModal('login')}
            />
          } />

          <Route path="/metodologia" element={
            <InstitutionalPageView
              pageId="metodologia"
              onOpenNutriaPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={() => handleOpenLoginModal('login')}
            />
          } />

          <Route path="/clientes" element={
            <InstitutionalPageView
              pageId="clientes"
              onOpenNutriaPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={() => handleOpenLoginModal('login')}
            />
          } />

          <Route path="/faq" element={
            <InstitutionalPageView
              pageId="faq"
              onOpenNutriaPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={() => handleOpenLoginModal('login')}
            />
          } />

          <Route path="/privacidade" element={
            <InstitutionalPageView
              pageId="privacidade_lgpd"
              onOpenNutriaPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={() => handleOpenLoginModal('login')}
            />
          } />
          <Route path="/privacidade_lgpd" element={<Navigate to="/privacidade" replace />} />

          <Route path="/termos" element={
            <InstitutionalPageView
              pageId="termos_servico"
              onOpenNutriaPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={() => handleOpenLoginModal('login')}
            />
          } />
          <Route path="/termos_servico" element={<Navigate to="/termos" replace />} />

          <Route path="/politica-uso-aceitavel" element={
            <InstitutionalPageView
              pageId="politica_uso_aceitavel"
              onOpenNutriaPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={() => handleOpenLoginModal('login')}
            />
          } />
          <Route path="/politica_uso_aceitavel" element={<Navigate to="/politica-uso-aceitavel" replace />} />

          <Route path="/suporte" element={
            <InstitutionalPageView
              pageId="fale_conosco"
              onOpenNutriaPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={() => handleOpenLoginModal('login')}
            />
          } />
          <Route path="/fale_conosco" element={<Navigate to="/suporte" replace />} />
          <Route path="/contato" element={<Navigate to="/suporte" replace />} />

          <Route path="/docs/:pageId" element={
            <InstitutionalDocRouteWrapper
              onOpenNutriaPrompt={handleOpenNutriaWithPrompt}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
              onOpenLoginModal={() => handleOpenLoginModal('login')}
            />
          } />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>

      </main>

      {/* Institutional Footer */}
      <Footer 
        onOpenPage={handleOpenInstitutionalPage}
        onOpenPlans={() => setIsSubscriptionModalOpen(true)}
        onOpenLogin={handleOpenLoginModal}
      />

      {/* PWA Fixed Responsive Bottom Navigation Bar */}
      <BottomNavigation
        onOpenNutriaChat={() => setIsFloatingChatOpen(true)}
        unreadNutriaAlerts={2}
        todayAppointmentsCount={appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
      />

      {/* Floating NÚTRIA Action Button (when drawer is closed) */}
      {!isFloatingChatOpen && (
        <button
          onClick={() => setIsFloatingChatOpen(true)}
          className="fixed bottom-20 sm:bottom-24 lg:bottom-6 right-4 lg:right-6 z-40 px-3.5 py-2.5 sm:px-4 sm:py-2.5 max-w-[180px] sm:max-w-none bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-full shadow-2xl hover:shadow-fuchsia-500/40 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 border border-fuchsia-400/50 group shadow-purple-950/90 cursor-pointer"
          id="btn-open-nutria-floating"
          title="Falar com Copiloto NÚTRIA AI"
        >
          <div className="relative shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-fuchsia-300 rounded-full animate-ping"></span>
          </div>
          <span className="truncate text-xs sm:text-sm font-bold tracking-tight">
            Falar com NÚTRIA
          </span>
        </button>
      )}

      {/* Floating NÚTRIA Chat Drawer */}
      {isFloatingChatOpen && (
        <div 
          className="fixed bottom-20 sm:bottom-24 lg:bottom-6 right-2.5 sm:right-4 lg:right-6 z-50 w-[calc(100vw-20px)] sm:w-full max-w-lg p-0.5 sm:p-2 max-h-[80vh] lg:max-h-[85vh] flex flex-col box-border min-w-0"
        >
          <NutriaCopilot
            messages={nutriaMessages}
            onSendMessage={handleSendNutriaMessage}
            isLoading={isNutriaLoading}
            activePatient={activePatient}
            todayAppointments={appointments.filter(a => a.date === new Date().toISOString().split('T')[0])}
            patientsCount={patients.length}
            monthlyRevenue={totalRevenue}
            monthlyExpenses={totalExpenses}
            isFloating={true}
            onCloseFloating={() => setIsFloatingChatOpen(false)}
            userAccount={effectiveUserAccount}
            onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
            onOpenLoginModal={(tab) => handleOpenLoginModal(tab || 'register')}
            onClearMessages={handleClearNutriaHistory}
          />
        </div>
      )}

      {/* Institutional Document Modal (for quick popups if invoked) */}
      <InstitutionalDocModal
        isOpen={isInstitutionalModalOpen}
        initialPageId={activeInstitutionalPageId}
        onClose={() => setIsInstitutionalModalOpen(false)}
        onOpenNutriaPrompt={(prompt) => {
          setIsInstitutionalModalOpen(false);
          setIsFloatingChatOpen(true);
          handleSendNutriaMessage(prompt);
        }}
        onOpenSubscriptionModal={() => {
          setIsInstitutionalModalOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
        onSelectPlan={() => {
          setIsInstitutionalModalOpen(false);
          setIsSubscriptionModalOpen(true);
        }}
        onOpenLoginModal={() => {
          setIsInstitutionalModalOpen(false);
          handleOpenLoginModal('login');
        }}
        onOpenLogin={() => {
          setIsInstitutionalModalOpen(false);
          handleOpenLoginModal('login');
        }}
      />

      {/* Login & Authentication Modal (Strictly preserved) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={userAccount}
        onLoginAs={handleLoginAs}
        onOpenTermsDoc={(pageId) => {
          setIsLoginModalOpen(false);
          navigate(`/${pageId}`);
        }}
        isMandatoryAuth={false}
      />

      {/* Subscription Plans Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userAccount={effectiveUserAccount}
        onSelectPlan={(plan, billingCycle, registeredUser) => handleSelectPlan(plan, registeredUser)}
        isAuthenticated={isAuthenticated}
        onOpenLoginModal={(tab) => handleOpenLoginModal(tab || 'register')}
      />

      {/* User Account / Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userAccount={effectiveUserAccount}
        onUpdateUserAccount={(updated) => {
          const updatedFull: UserAccount = { ...effectiveUserAccount, ...updated };
          setUserAccount(updatedFull);
          try {
            localStorage.setItem('nutrink_user_session', JSON.stringify(updatedFull));
          } catch {}
        }}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        onOpenLoginModal={(tab) => {
          setIsProfileModalOpen(false);
          handleOpenLoginModal(tab || 'login');
        }}
        onLogout={handleLogout}
      />

      {/* Clinical Modals */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onSavePatient={(newPatient) => {
          setPatients(prev => [newPatient, ...prev]);
          savePatientToDb(newPatient, userAccount?.email).catch(err => console.warn('Erro ao persistir novo paciente:', err));
        }}
      />

      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => {
          setIsNewAppointmentOpen(false);
          setPreSelectedPatientForApt(null);
        }}
        patients={patients}
        preSelectedPatient={preSelectedPatientForApt}
        onSaveAppointment={(newApt) => {
          setAppointments(prev => [...prev, newApt]);
          saveAppointmentToDb(newApt, userAccount?.email).catch(err => console.warn('Erro ao persistir novo agendamento:', err));
        }}
      />

      <AppointmentDetailsModal
        isOpen={isAppointmentDetailsOpen}
        onClose={() => {
          setIsAppointmentDetailsOpen(false);
          setSelectedAppointmentForDetails(null);
        }}
        appointment={selectedAppointmentForDetails}
        patients={patients}
        onSaveAppointment={handleSaveAppointmentDetails}
        onDeleteAppointment={handleDeleteAppointment}
      />

      <NewTransactionModal
        isOpen={isNewTransactionOpen}
        onClose={() => setIsNewTransactionOpen(false)}
        patients={patients}
        onSaveTransaction={(newTx) => {
          setTransactions(prev => [newTx, ...prev]);
          saveTransactionToDb(newTx, userAccount?.email).catch(err => console.warn('Erro ao persistir nova transação:', err));
        }}
      />

    </div>
  );
}

export default App;
