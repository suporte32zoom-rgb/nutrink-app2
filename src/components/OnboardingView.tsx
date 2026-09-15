import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Bot, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Mail, 
  KeyRound, 
  User, 
  ShieldCheck, 
  Crown, 
  Check, 
  Activity, 
  FileText, 
  Calculator, 
  Zap, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  HeartPulse
} from 'lucide-react';
import { UserAccount } from '../types';
import { getRegisteredUsers, saveRegisteredUser, SPECIALTY_OPTIONS, RegisteredProfessionalUser } from './LoginModal';
import GoogleLoginButton from './GoogleLoginButton';
import { GoogleProfile } from '../services/googleAuth';

interface OnboardingViewProps {
  onCompleteAuth: (user: Partial<UserAccount>, destinationTab?: string) => void;
  onOpenTermsDoc?: (pageId: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onCompleteAuth,
  onOpenTermsDoc
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Form State for Register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleType, setRoleType] = useState<'CRN' | 'CRM'>('CRN');
  const [crnNumber, setCrnNumber] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(SPECIALTY_OPTIONS[0]);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Form State for Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Feedback State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Touch Swipe Support for Mobile Carousel
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Reset errors on step/mode change
  useEffect(() => {
    setErrorMsg(null);
  }, [currentStep, authMode]);

  // Load last registered email if available
  useEffect(() => {
    try {
      const lastEmail = localStorage.getItem('nutrink_last_email');
      if (lastEmail) {
        setLoginEmail(lastEmail);
      }
    } catch {}
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && currentStep < 4) {
      // Swiped Left -> Next
      setCurrentStep(prev => Math.min(4, prev + 1));
    } else if (distance < -minSwipeDistance && currentStep > 1) {
      // Swiped Right -> Prev
      setCurrentStep(prev => Math.max(1, prev - 1));
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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

    if (!acceptedTerms) {
      setErrorMsg('É necessário aceitar os Termos de Uso e Política de Privacidade.');
      return;
    }

    setIsSubmitting(true);

    try {
      const existingUsers = getRegisteredUsers();
      const alreadyExists = existingUsers.some(u => u.email?.toLowerCase() === cleanEmail);

      if (alreadyExists) {
        setErrorMsg('Este e-mail já está cadastrado no NutrinK. Alterne para a aba "Entrar" para acessar sua conta.');
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

      saveRegisteredUser(newUser);

      // Authenticate immediately and direct to dashboard
      setTimeout(() => {
        setIsSubmitting(false);
        onCompleteAuth(newUser, 'dashboard');
      }, 400);

    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg('Ocorreu um erro ao salvar o cadastro. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
        // If no user found, allow quick free account registration prompt
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

      setTimeout(() => {
        setIsSubmitting(false);
        onCompleteAuth(sessionUser, 'dashboard');
      }, 400);

    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Erro ao autenticar. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = (profile: GoogleProfile) => {
    const cleanEmail = profile.email.trim().toLowerCase();
    const existingUsers = getRegisteredUsers();
    let existing = existingUsers.find(u => u.email?.toLowerCase() === cleanEmail);

    let finalUser: UserAccount;

    if (existing) {
      finalUser = {
        ...existing,
        name: existing.name || profile.name,
        avatarUrl: profile.picture || existing.avatarUrl,
        authProvider: 'google',
        googleId: profile.sub
      };
    } else {
      finalUser = {
        id: `usr-g-${Date.now()}`,
        name: profile.name,
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
        avatarUrl: profile.picture,
        authProvider: 'google',
        googleId: profile.sub
      };
      saveRegisteredUser(finalUser as RegisteredProfessionalUser);
    }

    onCompleteAuth(finalUser, 'dashboard');
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-fuchsia-600 selection:text-white relative overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between z-10">
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

        {/* Top Direct Action: Skip or Login */}
        <div className="flex items-center gap-3">
          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(4)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1d0637] hover:bg-[#280a4d] border border-purple-800/60 text-purple-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              id="btn-skip-to-register"
            >
              <span>Pular para Cadastro</span>
              <ChevronRight className="w-3.5 h-3.5 text-fuchsia-400" />
            </button>
          ) : (
            <button
              onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
              className="px-3.5 py-1.5 rounded-xl bg-[#1d0637] hover:bg-[#280a4d] border border-purple-800/60 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              {authMode === 'register' ? 'Já possui conta? Entrar' : 'Novo por aqui? Cadastrar'}
            </button>
          )}
        </div>
      </header>

      {/* Main Center Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 flex flex-col justify-center items-center z-10">
        
        {/* Step 1: Apresentação da Plataforma NutrinK */}
        {currentStep === 1 && (
          <div className="w-full max-w-3xl text-center space-y-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/50 border border-purple-700/60 text-fuchsia-300 text-xs font-bold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Etapa 1 de 4 • Apresentação da Plataforma</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Bem-vindo ao <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">NutrinK</span>!
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed font-medium">
                Sua plataforma completa para gestão de consultório, cálculos metabólicos de precisão e acompanhamento nutricional de excelência.
              </p>
            </div>

            {/* 3 Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
              <div className="p-5 rounded-3xl bg-[#150328] border border-purple-800/60 shadow-xl space-y-3 hover:border-fuchsia-500/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-900/60 border border-purple-700/50 text-fuchsia-400 flex items-center justify-center group-hover:scale-105 transition-all">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-white text-base">Painel Nutricional Completo</h3>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Visão consolidada de consultas do dia, métricas de pacientes, faturamento do consultório e atalhos clínicos rápidos.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#150328] border border-purple-800/60 shadow-xl space-y-3 hover:border-fuchsia-500/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-900/60 border border-fuchsia-700/50 text-fuchsia-300 flex items-center justify-center group-hover:scale-105 transition-all">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-white text-base">Cálculos & Metas Automáticas</h3>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  TMB e GET instantâneos (Mifflin-St Jeor), Peso Ajustado na obesidade, periodização de macronutrientes e metas hídricas.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#150328] border border-purple-800/60 shadow-xl space-y-3 hover:border-fuchsia-500/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 flex items-center justify-center group-hover:scale-105 transition-all">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-white text-base">Prontuário Digital Integrado</h3>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Histórico evolutivo, antropometria, exames laboratoriais, prescrições de manipulados e planos alimentares isoenergéticos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: A IA Copiloto NÚTRIA (Plano FREE) */}
        {currentStep === 2 && (
          <div className="w-full max-w-3xl text-center space-y-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/50 border border-purple-700/60 text-fuchsia-300 text-xs font-bold shadow-inner">
              <Bot className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Etapa 2 de 4 • Inteligência Artificial Copiloto</span>
            </div>

            <div className="space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-fuchsia-950/60 border border-fuchsia-400/40">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Copiloto IA <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">NÚTRIA</span> ao seu dispor
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed font-medium">
                <strong className="text-fuchsia-300">30 mensagens diárias grátis no Plano FREE</strong> para cadastrar pacientes por voz ou texto, tirar dúvidas clínicas de alta complexidade e automatizar prescrições.
              </p>
            </div>

            {/* 3 Copilot Highlight Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-left">
              <div className="p-5 rounded-3xl bg-[#150328] border border-purple-800/60 shadow-xl space-y-2">
                <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-sm">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Respostas Clínicas Instantâneas</span>
                </div>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Interpretação de exames de sangue, cálculo de HOMA-IR, interações droga-nutriente e manejo de patologias crônicas.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#150328] border border-purple-800/60 shadow-xl space-y-2">
                <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-sm">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Cadastro e Ações via Chat</span>
                </div>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Diga à NÚTRIA: <em>"Cadastre o paciente Carlos, 80kg, hipertrofia"</em> e veja o registro salvo diretamente no banco de dados.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#150328] border border-purple-800/60 shadow-xl space-y-2">
                <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-sm">
                  <HeartPulse className="w-4 h-4 shrink-0" />
                  <span>Suporte Bioenergético & Nutrologia</span>
                </div>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Prescrição de opções isoenergéticas, polimorfismos MTHFR, modulação de microbiota e suplementação esportiva de precisão.
                </p>
              </div>
            </div>

            {/* Free Plan Badge */}
            <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-700/60 text-xs text-purple-200 max-w-xl mx-auto flex items-center justify-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span><strong>Plano Free Incluso:</strong> 30 requisições diárias com a IA renovadas todos os dias sem custo.</span>
            </div>
          </div>
        )}

        {/* Step 3: Gestão de Pacientes & Prontuários */}
        {currentStep === 3 && (
          <div className="w-full max-w-3xl text-center space-y-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/50 border border-purple-700/60 text-fuchsia-300 text-xs font-bold shadow-inner">
              <Users className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Etapa 3 de 4 • Gestão de Pacientes & Prontuários</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Gestão Total do <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">Consultório</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed font-medium">
                Organize históricos clínicos, acompanhe a evolução antropométrica com gráficos comparativos e otimize cada consulta.
              </p>
            </div>

            {/* Visual Overview of Features in Step 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-left">
              <div className="p-5 rounded-3xl bg-[#150328] border border-purple-800/60 shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-900/50 border border-purple-700/50 flex items-center justify-center text-fuchsia-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Aba 'Pacientes & Prontuários'</h4>
                    <span className="text-[11px] text-purple-300">Acesso centralizado e dinâmico</span>
                  </div>
                </div>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Busca instantânea por nome, filtros por status (Ativo, Em Acompanhamento, Inativo) e edição completa de dados pessoais e clínicos.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#150328] border border-purple-800/60 shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-fuchsia-900/50 border border-fuchsia-700/50 flex items-center justify-center text-fuchsia-300">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Histórico Evolutivo & Bioimpedância</h4>
                    <span className="text-[11px] text-purple-300">Métricas visuais e precisas</span>
                  </div>
                </div>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Gráficos de evolução de peso, percentual de gordura e massa magra, permitindo demonstrar o progresso real ao paciente.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#150328] border border-purple-800/60 shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center text-indigo-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Prescrições & Timbrado Personalizado</h4>
                    <span className="text-[11px] text-purple-300">Exportação em PDF e Markdown</span>
                  </div>
                </div>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Emita planos alimentares, atestados e fórmulas magistrais com cabeçalho oficial do seu consultório e CRN/CRM.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#150328] border border-purple-800/60 shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Telemedicina Integrada</h4>
                    <span className="text-[11px] text-purple-300">Vídeoconsultas com NÚTRIA ao vivo</span>
                  </div>
                </div>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Convide o paciente via WhatsApp com link direto e receba transcrição e insights clínicos em tempo real na tela.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Planos & Formulário de Cadastro / Login (Final Step) */}
        {currentStep === 4 && (
          <div className="w-full max-w-4xl space-y-6 animate-fadeIn">
            
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/50 border border-purple-700/60 text-fuchsia-300 text-xs font-bold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Etapa 4 de 4 • Cadastro e Acesso Imediato</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {authMode === 'register' ? 'Cadastre-se e Comece Agora!' : 'Bem-vindo de Volta ao NutrinK'}
              </h1>
              <p className="text-xs sm:text-sm text-purple-200 max-w-xl mx-auto">
                {authMode === 'register'
                  ? 'Crie sua conta profissional gratuita e tenha acesso imediato ao painel, pacientes e à IA NÚTRIA.'
                  : 'Digite suas credenciais de acesso para entrar no seu consultório digital.'}
              </p>
            </div>

            {/* Plans Comparison Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* PLANO FREE */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#180533] border-2 border-fuchsia-500/60 shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-fuchsia-600/30 border border-fuchsia-400/50 text-fuchsia-300 font-black text-[10px] uppercase">
                  Plano Atual / Grátis
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Comece sem custos</span>
                  <h3 className="text-xl font-black text-white">PLANO FREE</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-white">R$ 0</span>
                    <span className="text-xs text-purple-300">/mês para sempre</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-purple-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>30 mensagens diárias</strong> com a IA Copiloto NÚTRIA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Gestão completa de <strong>Pacientes & Prontuários</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cálculos de TMB, GET e Metas Metabólicas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Prescrições de Manipulados e Planos Alimentares</span>
                  </li>
                </ul>
              </div>

              {/* PLANO PREMIUM */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#130325] border border-purple-800/60 shadow-xl space-y-3 relative opacity-95">
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-[10px] uppercase flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Ilimitado</span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Upgrade Opcional</span>
                  <h3 className="text-xl font-black text-white">PLANO PREMIUM</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-300">R$ 39,90</span>
                    <span className="text-xs text-purple-300">/mês ou R$ 399,90/ano</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-purple-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Acesso Ilimitado</strong> à IA Copiloto NÚTRIA 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Recursos Avançados & <strong>Telemedicina com IA ao vivo</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Exportações Ilimitadas e Suporte Prioritário</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Garantia de 7 dias com cancelamento a qualquer momento</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Register / Login Form Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#1a0533] border border-purple-800/60 shadow-2xl space-y-5">
              
              {/* Tabs Switcher: Cadastrar vs Entrar */}
              <div className="flex p-1 bg-[#120326] rounded-2xl border border-purple-800/50">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Criar Conta Grátis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Já Possuo Conta</span>
                </button>
              </div>

              {/* Quick Google Sign In */}
              <div className="space-y-3">
                <div className="flex justify-center">
                  <GoogleLoginButton
                    onSuccess={handleGoogleSuccess}
                    onError={(err) => setErrorMsg(err || 'Falha ao conectar com o Google.')}
                    buttonText={authMode === 'register' ? 'Cadastrar com Google' : 'Entrar com Google'}
                  />
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-purple-800/60 w-full" />
                  <span className="bg-[#1a0533] px-3 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                    Ou com seu e-mail profissional
                  </span>
                  <div className="border-t border-purple-800/60 w-full" />
                </div>
              </div>

              {/* FORM: CADASTRO */}
              {authMode === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  
                  {/* Nome Completo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>Nome Completo do Profissional *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Dra. Juliana Silveira"
                      className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none transition-all"
                    />
                  </div>

                  {/* E-mail Profissional */}
                  <div className="space-y-1.5">
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
                      className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Senha e Confirmar Senha */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
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
                          className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
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
                        className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Conselho e Especialidade (Opcional para personalização) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Registro Profissional</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={roleType}
                          onChange={(e) => setRoleType(e.target.value as 'CRN' | 'CRM')}
                          className="bg-[#120326] border border-purple-700/60 text-white rounded-2xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-fuchsia-400"
                        >
                          <option value="CRN">CRN</option>
                          <option value="CRM">CRM</option>
                        </select>
                        <input
                          type="text"
                          value={crnNumber}
                          onChange={(e) => setCrnNumber(e.target.value)}
                          placeholder="Ex: 12345/SP"
                          className="flex-1 bg-[#120326] border border-purple-700/60 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-fuchsia-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-purple-200">Especialidade Principal</label>
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full bg-[#120326] border border-purple-700/60 text-white rounded-2xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-fuchsia-400"
                      >
                        {SPECIALTY_OPTIONS.map((spec, i) => (
                          <option key={i} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2 pt-1 text-xs text-purple-200">
                    <input
                      type="checkbox"
                      id="terms-check"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-purple-700 text-fuchsia-600 focus:ring-fuchsia-500 bg-[#120326]"
                    />
                    <label htmlFor="terms-check" className="cursor-pointer">
                      Concordo com os{' '}
                      <button
                        type="button"
                        onClick={() => onOpenTermsDoc && onOpenTermsDoc('termos_de_uso')}
                        className="text-fuchsia-400 hover:underline font-semibold"
                      >
                        Termos de Uso
                      </button>
                      {' '}e a{' '}
                      <button
                        type="button"
                        onClick={() => onOpenTermsDoc && onOpenTermsDoc('politica_de_privacidade')}
                        className="text-fuchsia-400 hover:underline font-semibold"
                      >
                        Política de Privacidade
                      </button>.
                    </label>
                  </div>

                  {/* Action Button: Criar Conta */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-xl shadow-fuchsia-950/70 border border-fuchsia-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    id="btn-register-submit"
                  >
                    <Sparkles className="w-5 h-5 text-fuchsia-200" />
                    <span>{isSubmitting ? 'Configurando Consultório...' : 'CRIAR MINHA CONTA GRÁTIS'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* FORM: LOGIN */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  
                  {/* Login E-mail */}
                  <div className="space-y-1.5">
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
                      className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Login Senha */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>Senha de Acesso *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Sua senha cadastrada"
                        className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Action Button: Entrar */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-xl shadow-fuchsia-950/70 border border-fuchsia-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    id="btn-login-submit"
                  >
                    <Lock className="w-5 h-5 text-fuchsia-200" />
                    <span>{isSubmitting ? 'Acessando Consultório...' : 'ENTRAR NO NUTRINK'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-xs text-purple-300 hover:text-fuchsia-300 font-semibold transition-all cursor-pointer"
                    >
                      Ainda não tem cadastro? <strong>Crie sua conta grátis agora</strong>
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Bottom Step Navigation Bar */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-purple-900/40 z-10">
        
        {/* Step Indicators (1, 2, 3, 4) */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                currentStep === step
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-950/60 scale-105'
                  : currentStep > step
                  ? 'bg-purple-900/60 text-fuchsia-300 hover:bg-purple-800/60'
                  : 'bg-[#150328] text-purple-400 hover:text-purple-200 border border-purple-900/40'
              }`}
            >
              {currentStep > step ? <Check className="w-3 h-3" /> : <span>{step}</span>}
              <span className="hidden sm:inline">
                {step === 1 ? 'Apresentação' : step === 2 ? 'Copiloto IA' : step === 3 ? 'Prontuários' : 'Cadastro'}
              </span>
            </button>
          ))}
        </div>

        {/* Previous & Next Control Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-xl bg-[#1d0637] hover:bg-[#280a4d] border border-purple-800/60 text-purple-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              id="btn-onboarding-prev"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          )}

          {currentStep < 4 && (
            <button
              onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/30"
              id="btn-onboarding-next"
            >
              <span>Próximo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </footer>

    </div>
  );
};
