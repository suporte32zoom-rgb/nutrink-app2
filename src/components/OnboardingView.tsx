import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bot, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Mail, 
  KeyRound, 
  User, 
  ShieldCheck, 
  Activity, 
  FileText, 
  Calculator, 
  Zap, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  TrendingUp,
  Check
} from 'lucide-react';
import { UserAccount } from '../types';
import { getRegisteredUsers, saveRegisteredUser, SPECIALTY_OPTIONS, RegisteredProfessionalUser } from './LoginModal';
import { GoogleProfile, initiateGoogleOAuthPopup } from '../services/googleAuth';
import { signInWithGoogleFirebase, handleGoogleProfileAuth } from '../services/databaseService';

interface OnboardingViewProps {
  onCompleteAuth: (user: Partial<UserAccount>, destinationTab?: string) => void;
  onOpenTermsDoc?: (pageId: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onCompleteAuth,
  onOpenTermsDoc
}) => {
  // State for toggling traditional email/password form
  const [showTraditionalForm, setShowTraditionalForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form State for Register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleType, setRoleType] = useState<'CRN' | 'CRM'>('CRN');
  const [crnNumber, setCrnNumber] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(SPECIALTY_OPTIONS[0]);

  // Form State for Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password sub-view
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Feedback State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Load last registered email if available
  useEffect(() => {
    try {
      const lastEmail = localStorage.getItem('nutrink_last_email');
      if (lastEmail) {
        setLoginEmail(lastEmail);
      }
    } catch {}
  }, []);

  // 1-Click Google Sign In (Primary Action via Firebase Auth & OAuth)
  const handleGoogleClick = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);

    try {
      // 1. Attempt standard Firebase Auth Google Popup
      const user = await signInWithGoogleFirebase();
      setSuccessMsg(`Bem-vindo(a), ${user.name}! Acessando seu consultório...`);
      setTimeout(() => {
        setIsGoogleLoading(false);
        onCompleteAuth(user, 'dashboard');
      }, 600);
    } catch (fbErr: any) {
      console.warn('[Firebase Auth fallback]: tentando OAuth popup alternativo...', fbErr);

      // If popup blocked or standard Firebase popup failed, fallback to direct Google OAuth popup
      try {
        await initiateGoogleOAuthPopup(
          async (profile: GoogleProfile) => {
            try {
              const user = await handleGoogleProfileAuth(profile);
              setSuccessMsg(`Bem-vindo(a), ${user.name}! Acessando seu consultório...`);
              setTimeout(() => {
                setIsGoogleLoading(false);
                onCompleteAuth(user, 'dashboard');
              }, 600);
            } catch (err: any) {
              setIsGoogleLoading(false);
              setErrorMsg('Falha ao processar cadastro com Google. Tente novamente.');
            }
          },
          (errText: string) => {
            setIsGoogleLoading(false);
            if (errText) {
              setErrorMsg(errText);
            }
          }
        );
      } catch (oauthErr: any) {
        setIsGoogleLoading(false);
        setErrorMsg('Não foi possível conectar ao Google. Verifique sua conexão ou use o e-mail/senha.');
      }
    }
  };

  // Traditional Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 3) {
      setErrorMsg('Por favor, informe seu Nome Completo (mínimo 3 caracteres).');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Por favor, informe um endereço de e-mail profissional válido.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres para segurança do consultório.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg('As senhas digitadas não coincidem. Verifique a confirmação.');
      return;
    }

    setIsSubmitting(true);

    try {
      const existingUsers = getRegisteredUsers();
      const alreadyExists = existingUsers.some(u => u.email?.toLowerCase() === cleanEmail);

      if (alreadyExists) {
        setErrorMsg('Este e-mail já está cadastrado no NutrinK. Alterne para "Entrar" para acessar sua conta.');
        setIsSubmitting(false);
        return;
      }

      const formattedCrn = crnNumber.trim() 
        ? `${roleType} ${crnNumber.trim()}` 
        : `${roleType} Ativo`;

      const newUser: RegisteredProfessionalUser = {
        id: `usr-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password: password,
        crn: formattedCrn,
        specialty: selectedSpecialty,
        plan: 'free',
        isSubscribed: false,
        dailyMessageCount: 0,
        dailyMessageLimit: 30,
        monthlyMessageCount: 0,
        monthlyMessageLimit: 50,
        activeSince: new Date().getFullYear().toString(),
        authProvider: 'local'
      };

      await saveRegisteredUser(newUser);

      setSuccessMsg(`Cadastro criado com sucesso! Inicializando consultório de ${cleanName}...`);
      setTimeout(() => {
        setIsSubmitting(false);
        onCompleteAuth(newUser, 'dashboard');
      }, 700);

    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg('Ocorreu um erro ao salvar o cadastro. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  // Traditional Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = loginEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('Por favor, digite sua senha de acesso.');
      return;
    }

    setIsSubmitting(true);

    try {
      const users = getRegisteredUsers();
      const matched = users.find(u => u.email?.toLowerCase() === cleanEmail);

      if (!matched) {
        setErrorMsg('E-mail não encontrado. Verifique a digitação ou cadastre-se no Plano Free.');
        setIsSubmitting(false);
        return;
      }

      if (matched.password && matched.password !== loginPassword) {
        setErrorMsg('Senha incorreta para este usuário. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      const sessionUser: UserAccount = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        crn: matched.crn || 'CRN Ativo',
        specialty: matched.specialty || 'Nutrição Clínica & Funcional',
        plan: matched.plan || 'free',
        isSubscribed: matched.isSubscribed || false,
        dailyMessageCount: matched.dailyMessageCount || 0,
        dailyMessageLimit: matched.dailyMessageLimit || 30,
        monthlyMessageCount: matched.monthlyMessageCount || 0,
        monthlyMessageLimit: matched.monthlyMessageLimit || 50,
        activeSince: matched.activeSince || '2026',
        authProvider: matched.authProvider || 'local'
      };

      setSuccessMsg(`Bem-vindo(a) de volta, ${sessionUser.name}!`);
      setTimeout(() => {
        setIsSubmitting(false);
        onCompleteAuth(sessionUser, 'dashboard');
      }, 500);

    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Erro ao autenticar. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMsg('Informe um e-mail válido para recuperação.');
      return;
    }
    setErrorMsg(null);
    setForgotSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-fuchsia-600 selection:text-white relative overflow-x-hidden font-sans">
      
      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            src="/icon-512.svg"
            alt="NutrinK Logo"
            className="w-10 h-10 rounded-2xl shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40 object-cover shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">Nutrin<span className="text-fuchsia-400">K</span></span>
              <span className="px-2 py-0.5 rounded-md bg-purple-900/60 border border-purple-700/50 text-purple-200 text-[10px] font-bold uppercase tracking-wider">
                Plataforma Clínica
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80 hidden sm:block">Ecossistema Inteligente para Nutricionistas & Médicos</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Ambiente Seguro & LGPD</span>
        </div>
      </header>

      {/* Main Center Content Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center items-center z-10">
        
        {/* Main Clean Authentication Card */}
        <div className="w-full rounded-3xl bg-[#170530]/95 border border-purple-800/70 shadow-2xl shadow-fuchsia-950/80 p-6 sm:p-8 backdrop-blur-md space-y-6">
          
          {/* Header & App Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-900/50 border border-purple-700/60 text-fuchsia-300 text-xs font-bold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Acesso ao Consultório Digital</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bem-vindo ao <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">NutrinK</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-md mx-auto leading-relaxed">
              Acesso rápido e seguro. Entre com sua conta do Google para acessar seu consultório em 1 clique.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-600/80 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-600/80 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* 1. DESTAQUE PRINCIPAL: Botão Continuar com o Google */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isGoogleLoading || isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-bold text-base shadow-xl shadow-purple-950/60 border border-slate-200 hover:border-fuchsia-400 flex items-center justify-center gap-3 transition-all cursor-pointer group disabled:opacity-60"
              id="btn-google-primary-login"
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

            {/* Quick Benefits Tags */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="py-1.5 px-2 rounded-xl bg-purple-950/60 border border-purple-800/50 text-center">
                <span className="text-[10px] font-semibold text-purple-200 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-fuchsia-400 shrink-0" />
                  1 Clique
                </span>
              </div>
              <div className="py-1.5 px-2 rounded-xl bg-purple-950/60 border border-purple-800/50 text-center">
                <span className="text-[10px] font-semibold text-purple-200 flex items-center justify-center gap-1">
                  <Bot className="w-3 h-3 text-fuchsia-400 shrink-0" />
                  IA NUTRIA
                </span>
              </div>
              <div className="py-1.5 px-2 rounded-xl bg-purple-950/60 border border-purple-800/50 text-center">
                <span className="text-[10px] font-semibold text-purple-200 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-fuchsia-400 shrink-0" />
                  Prontuários
                </span>
              </div>
            </div>
          </div>

          {/* 2. BOTÃO/LINK DISCRETO PARA EXPANDIR FORMULÁRIO TRADICIONAL */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setShowTraditionalForm(!showTraditionalForm);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/40 hover:border-purple-700/60 text-purple-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              id="btn-toggle-traditional-form"
            >
              <span>{showTraditionalForm ? 'Ocultar login tradicional' : 'Ou entrar/cadastrar com e-mail e senha'}</span>
              {showTraditionalForm ? <ChevronUp className="w-4 h-4 text-fuchsia-400" /> : <ChevronDown className="w-4 h-4 text-fuchsia-400" />}
            </button>
          </div>

          {/* EXPANDED TRADITIONAL FORM */}
          {showTraditionalForm && (
            <div className="space-y-4 pt-2 border-t border-purple-800/40 animate-fadeIn">
              
              {/* Tab Selector: Entrar vs Cadastrar */}
              <div className="flex p-1 bg-[#120326] rounded-2xl border border-purple-800/50">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setIsForgotPassword(false);
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'login' && !isForgotPassword
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
                    setAuthMode('register');
                    setIsForgotPassword(false);
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'register' && !isForgotPassword
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Criar Conta</span>
                </button>
              </div>

              {/* FORGOT PASSWORD SUB-VIEW */}
              {isForgotPassword ? (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
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
                      Instruções para redefinição de senha foram enviadas ao seu e-mail!
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
              ) : authMode === 'login' ? (
                /* TRADITIONAL LOGIN FORM */
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
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
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-fuchsia-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    id="btn-login-traditional-submit"
                  >
                    <Lock className="w-4 h-4 text-fuchsia-200" />
                    <span>{isSubmitting ? 'Acessando Consultório...' : 'ENTRAR NO NUTRINK'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                /* TRADITIONAL REGISTER FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>Nome Completo do Profissional *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Dra. Mariana Albuquerque"
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Confirmar Senha *</span>
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
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
                          value={roleType}
                          onChange={(e) => setRoleType(e.target.value as 'CRN' | 'CRM')}
                          className="bg-[#120326] border border-purple-700/60 text-white rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none"
                        >
                          <option value="CRN">CRN</option>
                          <option value="CRM">CRM</option>
                        </select>
                        <input
                          type="text"
                          value={crnNumber}
                          onChange={(e) => setCrnNumber(e.target.value)}
                          placeholder="Ex: 12345/SP"
                          className="flex-1 bg-[#120326] border border-purple-700/60 rounded-xl px-2.5 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-purple-200">Especialidade Principal</label>
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
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
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-fuchsia-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-1"
                    id="btn-register-traditional-submit"
                  >
                    <Sparkles className="w-4 h-4 text-fuchsia-200" />
                    <span>{isSubmitting ? 'Criando Conta...' : 'CRIAR MINHA CONTA GRÁTIS'}</span>
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

      </main>

      {/* Bottom Global Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-300/70 border-t border-purple-900/40 z-10">
        <div className="flex items-center gap-2">
          <span>NutrinK Plataforma Clínica © {new Date().getFullYear()}</span>
          <span>•</span>
          <span>Em conformidade com LGPD & CFM/CFN</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button
            type="button"
            onClick={() => onOpenTermsDoc && onOpenTermsDoc('termos_de_uso')}
            className="hover:text-fuchsia-300 transition-colors cursor-pointer"
          >
            Termos
          </button>
          <button
            type="button"
            onClick={() => onOpenTermsDoc && onOpenTermsDoc('politica_de_privacidade')}
            className="hover:text-fuchsia-300 transition-colors cursor-pointer"
          >
            Privacidade
          </button>
          <button
            type="button"
            onClick={() => onOpenTermsDoc && onOpenTermsDoc('seguranca')}
            className="hover:text-fuchsia-300 transition-colors cursor-pointer"
          >
            Segurança
          </button>
        </div>
      </footer>

    </div>
  );
};

export default OnboardingView;
