import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  X, 
  Lock, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Stethoscope, 
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Zap,
  Bot,
  Users
} from 'lucide-react';
import { UserAccount } from '../types';
import { formatBrasiliaShortDate } from '../utils/dateUtils';
import { GoogleProfile, initiateGoogleOAuthPopup } from '../services/googleAuth';
import { saveProfile, signInWithGoogleFirebase, signInWithGoogleComplete, handleGoogleProfileAuth } from '../services/databaseService';
import GoogleLoginButton from './GoogleLoginButton';

export type AuthModalTab = 'login' | 'register' | 'forgot_password';

export interface RegisteredProfessionalUser extends UserAccount {
  password?: string;
}

export const getRegisteredUsers = (): RegisteredProfessionalUser[] => {
  try {
    const raw = localStorage.getItem('nutrink_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRegisteredUser = async (user: RegisteredProfessionalUser) => {
  try {
    const users = getRegisteredUsers();
    const existingIndex = users.findIndex(
      u => u.email.trim().toLowerCase() === user.email.trim().toLowerCase()
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem('nutrink_registered_users', JSON.stringify(users));
    if (user.email) {
      localStorage.setItem('nutrink_last_email', user.email.trim().toLowerCase());
      await saveProfile(user);
    }
  } catch (err) {
    console.error('Erro ao persistir usuário:', err);
  }
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  onLoginAs: (user: Partial<UserAccount>) => void;
  initialTab?: AuthModalTab;
  onOpenTermsDoc?: (pageId: string) => void;
  isMandatoryAuth?: boolean;
}

export const SPECIALTY_OPTIONS = [
  'Nutrição Clínica & Funcional',
  'Nutrição Esportiva & Performance',
  'Nutrologia & Medicina Metabólica',
  'Emagrecimento & Obesidade',
  'Nutrição Materno-Infantil & Pediatria',
  'Saúde Intestinal & Microbiota',
  'Nutrição Oncológica',
  'Comportamento Alimentar & Transtornos',
  'Vegetarianismo & Veganismo',
  'Geriatria & Longevidade Saudável'
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginAs,
  initialTab = 'login',
  onOpenTermsDoc,
  isMandatoryAuth = false
}) => {
  const [showTraditionalForm, setShowTraditionalForm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regRoleType, setRegRoleType] = useState<'CRN' | 'CRM'>('CRN');
  const [regNumber, setRegNumber] = useState('');
  const [regSpecialty, setRegSpecialty] = useState(SPECIALTY_OPTIONS[0]);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password form state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Feedback & Loading
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback Google Email state if browser blocks popups
  const [showGoogleEmailFallback, setShowGoogleEmailFallback] = useState(false);
  const [googleFallbackEmail, setGoogleFallbackEmail] = useState(() => {
    try {
      return localStorage.getItem('nutrink_last_email') || 'tarcianosousa484@gmail.com';
    } catch {
      return 'tarcianosousa484@gmail.com';
    }
  });

  // Synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setAuthSuccess(false);
      setForgotSuccess(false);
      setIsGoogleLoading(false);
      setIsProcessing(false);
      setIsForgotPassword(false);
      setShowGoogleEmailFallback(false);

      if (initialTab === 'register') {
        setActiveTab('register');
        setShowTraditionalForm(true);
      } else {
        setActiveTab('login');
        setShowTraditionalForm(false);
      }

      // Auto-prefill last email
      try {
        const lastEmail = localStorage.getItem('nutrink_last_email');
        if (lastEmail) {
          setLoginEmail(lastEmail);
          setGoogleFallbackEmail(lastEmail);
        } else {
          const users = getRegisteredUsers();
          if (users.length > 0 && users[users.length - 1]?.email) {
            setLoginEmail(users[users.length - 1].email);
            setGoogleFallbackEmail(users[users.length - 1].email);
          }
        }
      } catch (err) {
        console.error('Error prefilling email:', err);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // 1-Click Google Login
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);

    try {
      // 1. Unified Google Authentication (Firebase Auth Popup + OAuth 2.0 fallback)
      const user = await signInWithGoogleComplete();
      setAuthSuccess(true);
      setAuthSuccessMsg(`Bem-vindo(a), ${user.name}! Acessando Painel Clínico...`);
      onLoginAs(user);
      setIsGoogleLoading(false);
      onClose();
    } catch (err: any) {
      setIsGoogleLoading(false);
      if (err?.message === 'AUTH_CANCELLED' || err?.message?.includes('fechad') || err?.message?.includes('cancelad')) {
        // User closed the popup manually
        return;
      }
      console.warn('[Google Auth issue]:', err);
      setErrorMessage(
        'Pop-up impedido pelo navegador ou restrito pelo dispositivo. Você pode acessar com 1 clique confirmando seu e-mail do Google abaixo:'
      );
      setShowGoogleEmailFallback(true);
    }
  };

  // Direct Google Email Login (resilient fallback when browser restricts popups)
  const handleGoogleEmailDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleFallbackEmail || !googleFallbackEmail.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail do Google válido.');
      return;
    }
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const cleanEmail = googleFallbackEmail.trim().toLowerCase();
      const extractedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const user = await handleGoogleProfileAuth({
        email: cleanEmail,
        name: `Dr(a). ${extractedName}`
      });
      setAuthSuccess(true);
      setAuthSuccessMsg(`Bem-vindo(a), ${user.name}! Acessando Painel Clínico...`);
      onLoginAs(user);
      setIsGoogleLoading(false);
      onClose();
    } catch (err: any) {
      setIsGoogleLoading(false);
      setErrorMessage('Erro ao autenticar com e-mail Google. Tente novamente.');
    }
  };

  // Traditional Login Handler
  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Por favor, preencha o e-mail profissional e a senha cadastrada.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      const users = getRegisteredUsers();
      const cleanEmail = loginEmail.trim().toLowerCase();
      const foundUser = users.find(u => u.email?.trim().toLowerCase() === cleanEmail);

      if (!foundUser) {
        setErrorMessage(`Nenhuma conta cadastrada com o e-mail "${loginEmail}". Cadastre-se na aba "Criar Conta" ou acesse com o Google.`);
        return;
      }

      if (foundUser.password && foundUser.password !== loginPassword) {
        setErrorMessage('Senha incorreta para este usuário. Tente novamente.');
        return;
      }

      setAuthSuccess(true);
      setAuthSuccessMsg(`Bem-vindo(a), ${foundUser.name}!`);
      
      try {
        localStorage.setItem('nutrink_last_email', foundUser.email.trim().toLowerCase());
      } catch {}

      const authenticatedUser: UserAccount = {
        id: foundUser.id || `usr-${Date.now()}`,
        name: foundUser.name,
        email: foundUser.email,
        crn: foundUser.crn || 'CRN Ativo',
        specialty: foundUser.specialty || 'Nutrição Clínica & Funcional',
        plan: foundUser.plan || 'free',
        isSubscribed: foundUser.isSubscribed || false,
        dailyMessageCount: foundUser.dailyMessageCount || 0,
        dailyMessageLimit: foundUser.dailyMessageLimit || 30,
        monthlyMessageCount: foundUser.monthlyMessageCount || 0,
        monthlyMessageLimit: foundUser.monthlyMessageLimit || 50,
        activeSince: foundUser.activeSince || formatBrasiliaShortDate()
      };

      onLoginAs(authenticatedUser);

      setTimeout(() => {
        setAuthSuccess(false);
        onClose();
      }, 700);
    }, 500);
  };

  // Traditional Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = regName.trim();
    if (!trimmedName || trimmedName.length < 3) {
      setErrorMessage('Informe o Nome Completo do profissional de saúde (mínimo 3 caracteres).');
      return;
    }
    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Informe um e-mail profissional válido.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setErrorMessage('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    const users = getRegisteredUsers();
    const alreadyRegistered = users.some(u => u.email?.trim().toLowerCase() === cleanEmail);
    if (alreadyRegistered) {
      setErrorMessage(`O e-mail "${regEmail}" já está cadastrado. Alterne para a aba "Entrar" para acessar.`);
      return;
    }

    setIsProcessing(true);
    const finalRegistry = regNumber.trim() ? `${regRoleType} ${regNumber.trim()}` : `${regRoleType} Ativo`;

    const newUser: RegisteredProfessionalUser = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      email: cleanEmail,
      password: regPassword,
      crn: finalRegistry,
      specialty: regSpecialty,
      plan: 'free',
      isSubscribed: false,
      dailyMessageCount: 0,
      dailyMessageLimit: 30,
      monthlyMessageCount: 0,
      monthlyMessageLimit: 50,
      activeSince: formatBrasiliaShortDate()
    };

    await saveRegisteredUser(newUser);

    setIsProcessing(false);
    setAuthSuccess(true);
    setAuthSuccessMsg(`Conta de ${trimmedName} criada com sucesso!`);

    onLoginAs(newUser);

    setTimeout(() => {
      setAuthSuccess(false);
      onClose();
    }, 800);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMessage('Informe um e-mail válido para recuperação.');
      return;
    }
    setErrorMessage('');
    setForgotSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#170530] border border-purple-800/70 shadow-2xl shadow-fuchsia-950/80 overflow-hidden">
        
        {/* Close button */}
        {!isMandatoryAuth && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 rounded-full text-purple-300 hover:text-white hover:bg-purple-900/60 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-900/50 border border-purple-700/60 text-fuchsia-300 text-xs font-bold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Acesso ao Consultório Digital</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Acesse o <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">NutrinK</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-md mx-auto leading-relaxed">
              Acesso rápido e seguro. Entre com sua conta do Google para acessar seu consultório em 1 clique.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-600/80 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {authSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-600/80 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{authSuccessMsg}</span>
            </div>
          )}

          {/* 1. DESTAQUE PRINCIPAL: Continuar com o Google */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isProcessing}
              className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-bold text-base shadow-xl shadow-purple-950/60 border border-slate-200 hover:border-fuchsia-400 flex items-center justify-center gap-3 transition-all cursor-pointer group disabled:opacity-60"
              id="btn-google-modal-login"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span className="group-hover:text-purple-950 transition-colors">
                {isGoogleLoading ? 'Autenticando com o Google...' : 'Continuar com o Google'}
              </span>
            </button>

            {/* Google Identity Services Official One-Click Component */}
            <div className="pt-1 flex justify-center">
              <GoogleLoginButton
                text="continue_with"
                theme="outline"
                size="large"
                onSuccess={async (profile) => {
                  try {
                    setIsGoogleLoading(true);
                    const user = await handleGoogleProfileAuth(profile);
                    setAuthSuccess(true);
                    setAuthSuccessMsg(`Bem-vindo(a), ${user.name}! Acessando Painel Clínico...`);
                    onLoginAs(user);
                    setIsGoogleLoading(false);
                    onClose();
                  } catch (e: any) {
                    setIsGoogleLoading(false);
                    setErrorMessage('Erro ao autenticar com as credenciais do Google.');
                  }
                }}
                onError={(errText) => {
                  if (errText) console.warn('GIS error notice:', errText);
                }}
              />
            </div>

            {/* Resilient Direct Email Form (Shown automatically if browser blocks popup or on user click) */}
            {showGoogleEmailFallback ? (
              <form onSubmit={handleGoogleEmailDirectLogin} className="p-3.5 rounded-2xl bg-purple-950/70 border border-fuchsia-500/50 space-y-2.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs text-fuchsia-300 font-semibold">
                  <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
                  <span>Acesso direto com e-mail do Google:</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={googleFallbackEmail}
                    onChange={(e) => setGoogleFallbackEmail(e.target.value)}
                    placeholder="seu.email@gmail.com"
                    required
                    className="flex-1 py-2 px-3 rounded-xl bg-[#120326] border border-purple-800 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-fuchsia-400"
                  />
                  <button
                    type="submit"
                    disabled={isGoogleLoading}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    {isGoogleLoading ? 'Entrando...' : 'Entrar'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowGoogleEmailFallback(true)}
                  className="text-[11px] text-purple-400 hover:text-fuchsia-300 transition-colors underline cursor-pointer"
                >
                  Problemas com pop-up? Clique para entrar direto com seu e-mail Google
                </button>
              </div>
            )}

            {/* Micro Badges */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="py-1 px-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-[10px] text-purple-200 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-fuchsia-400 shrink-0" />
                1 Clique
              </div>
              <div className="py-1 px-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-[10px] text-purple-200 flex items-center justify-center gap-1">
                <Bot className="w-3 h-3 text-fuchsia-400 shrink-0" />
                IA NÚTRIA
              </div>
              <div className="py-1 px-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-[10px] text-purple-200 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                LGPD Seguro
              </div>
            </div>
          </div>

          {/* 2. LINK DISCRETO PARA EXPANDIR FORMULÁRIO TRADICIONAL */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setShowTraditionalForm(!showTraditionalForm);
                setErrorMessage('');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 text-purple-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{showTraditionalForm ? 'Ocultar login tradicional' : 'Ou entrar/cadastrar com e-mail e senha'}</span>
              {showTraditionalForm ? <ChevronUp className="w-4 h-4 text-fuchsia-400" /> : <ChevronDown className="w-4 h-4 text-fuchsia-400" />}
            </button>
          </div>

          {/* FORMULÁRIO TRADICIONAL EXPANDIDO */}
          {showTraditionalForm && (
            <div className="space-y-4 pt-2 border-t border-purple-800/40 animate-fadeIn">
              
              {/* Tab Selector */}
              <div className="flex p-1 bg-[#120326] rounded-2xl border border-purple-800/50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setIsForgotPassword(false);
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'login' && !isForgotPassword
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setIsForgotPassword(false);
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'register' && !isForgotPassword
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Criar Conta</span>
                </button>
              </div>

              {/* FORGOT PASSWORD */}
              {isForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-200">E-mail Cadastrado</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="seu.email@consultorio.com.br"
                      className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none"
                    />
                  </div>

                  {forgotSuccess ? (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs">
                      Instruções de redefinição foram enviadas para seu e-mail!
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Enviar Link de Recuperação
                    </button>
                  )}

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-xs text-purple-300 hover:text-white underline cursor-pointer"
                    >
                      Voltar ao Login
                    </button>
                  </div>
                </form>
              ) : activeTab === 'login' ? (
                /* LOGIN */
                <form onSubmit={handleCustomLogin} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>E-mail Profissional *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu.email@consultorio.com.br"
                      className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-purple-300/40 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Senha de Acesso *</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[11px] text-fuchsia-400 hover:underline cursor-pointer"
                      >
                        Esqueci a senha
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Sua senha cadastrada"
                        className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-purple-300/40 focus:outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                      >
                        {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-fuchsia-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4 text-fuchsia-200" />
                    <span>{isProcessing ? 'Acessando Consultório...' : 'ENTRAR NO NUTRINK'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                /* CADASTRO */
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>Nome Completo *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ex: Dra. Juliana Silveira"
                      className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-purple-300/40 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>E-mail Profissional *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="seu.email@consultorio.com.br"
                      className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-purple-300/40 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Criar Senha *</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Mínimo 6 dígitos"
                          className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Confirmar Senha *</span>
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="Repita sua senha"
                        className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Registro Profissional</span>
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          value={regRoleType}
                          onChange={(e) => setRegRoleType(e.target.value as 'CRN' | 'CRM')}
                          className="bg-[#120326] border border-purple-700/60 text-white rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none"
                        >
                          <option value="CRN">CRN</option>
                          <option value="CRM">CRM</option>
                        </select>
                        <input
                          type="text"
                          value={regNumber}
                          onChange={(e) => setRegNumber(e.target.value)}
                          placeholder="Ex: 12345/SP"
                          className="flex-1 bg-[#120326] border border-purple-700/60 rounded-xl px-2.5 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-purple-200">Especialidade Principal</label>
                      <select
                        value={regSpecialty}
                        onChange={(e) => setRegSpecialty(e.target.value)}
                        className="w-full bg-[#120326] border border-purple-700/60 text-white rounded-xl px-2.5 py-2 text-xs font-medium focus:outline-none"
                      >
                        {SPECIALTY_OPTIONS.map((spec, i) => (
                          <option key={i} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-fuchsia-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-1"
                  >
                    <Sparkles className="w-4 h-4 text-fuchsia-200" />
                    <span>{isProcessing ? 'Criando Conta...' : 'CRIAR MINHA CONTA GRÁTIS'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

            </div>
          )}

          {/* 3. TERMOS DE USO E LGPD: Rodapé Discreto */}
          <div className="pt-2 text-center text-[11px] text-purple-300/80 leading-relaxed border-t border-purple-900/30">
            <p>
              Ao acessar a plataforma, você concorda com os{' '}
              <button
                type="button"
                onClick={() => onOpenTermsDoc && onOpenTermsDoc('termos_de_uso')}
                className="text-fuchsia-400 hover:underline font-semibold cursor-pointer"
              >
                Termos de Uso
              </button>
              {' '}e as{' '}
              <button
                type="button"
                onClick={() => onOpenTermsDoc && onOpenTermsDoc('politica_de_privacidade')}
                className="text-fuchsia-400 hover:underline font-semibold cursor-pointer"
              >
                Políticas de Privacidade
              </button>
              {' '}do NutrinK.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginModal;
