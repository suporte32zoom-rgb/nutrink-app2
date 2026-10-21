import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NutriaAvatar } from './NutriaAvatar';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Bot, 
  Activity, 
  ChevronRight, 
  Flame,
  UserPlus,
  CalendarPlus,
  ShieldCheck,
  FileSpreadsheet,
  Stethoscope,
  Apple,
  Award,
  Sun,
  Moon,
  Sunset,
  BookOpen
} from 'lucide-react';
import { Patient, Appointment, FinancialTransaction, UserAccount } from '../types';
import { 
  getBrasiliaTodayISODate, 
  formatBrasiliaFullDate, 
  getGreetingByTime, 
  getBrasiliaTimeString 
} from '../utils/dateUtils';
import { INITIAL_BLOG_POSTS, BlogPost } from '../data/blogData';
import { BlogArticleDetailModal } from './BlogArticleDetailModal';

interface DashboardViewProps {
  patients: Patient[];
  appointments: Appointment[];
  transactions: FinancialTransaction[];
  userAccount?: UserAccount;
  onSelectPatient: (patientId: string) => void;
  onOpenNewPatient: () => void;
  onOpenNewAppointment: () => void;
  onOpenNewTransaction: () => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
  onUpdateAppointmentStatus: (aptId: string, newStatus: Appointment['status']) => void;
  onOpenProfileModal?: () => void;
  onOpenAppointmentDetails?: (appointment: Appointment) => void;
  onOpenSubscriptionModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  appointments,
  transactions,
  userAccount,
  onSelectPatient,
  onOpenNewPatient,
  onOpenNewAppointment,
  onOpenNewTransaction,
  onOpenNutriaWithPrompt,
  onUpdateAppointmentStatus,
  onOpenProfileModal,
  onOpenAppointmentDetails,
  onOpenSubscriptionModal
}) => {
  const navigate = useNavigate();
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  // Progressive Onboarding Tour (Sistema de Degustação / Tour Guiado)
  const [hasTestedNutria, setHasTestedNutria] = useState(() => {
    return localStorage.getItem('nutrink_onboarding_step_nutria') === 'true';
  });
  const [hasViewedPatient, setHasViewedPatient] = useState(() => {
    return localStorage.getItem('nutrink_onboarding_step_patient') === 'true';
  });
  const isPlanSubscribed = Boolean(
    userAccount?.isSubscribed || userAccount?.plan === 'pro' || userAccount?.plan === 'anual' || userAccount?.plan === 'premium_mensal' || userAccount?.plan === 'premium_anual'
  );

  const completedStepsCount = (hasTestedNutria ? 1 : 0) + (hasViewedPatient ? 1 : 0) + (isPlanSubscribed ? 1 : 0);
  const progressPercentage = Math.round((completedStepsCount / 3) * 100);

  const handleStepTestNutria = () => {
    localStorage.setItem('nutrink_onboarding_step_nutria', 'true');
    setHasTestedNutria(true);
    onOpenNutriaWithPrompt('Olá NÚTRIA! Sou profissional de saúde e estou conhecendo a plataforma NutrinK. Apresente-se e explique como você analisa prontuários clínicos e calcula a TACO em segundos.');
  };

  const handleStepViewPatient = () => {
    localStorage.setItem('nutrink_onboarding_step_patient', 'true');
    setHasViewedPatient(true);
    const targetPatient = patients.find(p => p.id === 'paciente-exemplo-demo') || patients[0];
    if (targetPatient) {
      onSelectPatient(targetPatient.id);
    } else {
      navigate('/pacientes');
    }
  };

  const handleStepSubscribePlan = () => {
    if (onOpenSubscriptionModal) {
      onOpenSubscriptionModal();
    } else {
      navigate('/planos');
    }
  };

  const currentDateStr = getBrasiliaTodayISODate();
  const formattedToday = formatBrasiliaFullDate();
  const greeting = getGreetingByTime();
  const currentTime = getBrasiliaTimeString();
  
  // Professional identity determination
  const isDoctor = userAccount?.crn?.includes('CRM') || userAccount?.specialty?.toLowerCase().includes('nutrolog') || userAccount?.name?.toLowerCase().includes('dr.');
  const professionalRoleLabel = userAccount?.crn?.includes('CRM') 
    ? 'Médico Nutrólogo' 
    : userAccount?.specialty?.toLowerCase().includes('nutrolog') 
    ? 'Nutrólogo(a)' 
    : 'Nutricionista Clínico(a)';

  // Calculations (Automated Billing based on Paid Appointments and Financial Transactions)
  const todayAppointments = appointments.filter(a => a.date === currentDateStr);
  
  // Paid appointments: sum all appointments marked as "(Pago)" or completed
  const paidAppointments = appointments.filter(a => 
    a.paymentStatus === 'pago' || (a.status === 'realizada' && a.paymentStatus !== 'cancelado')
  );
  const appointmentsRevenue = paidAppointments.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  // Standalone revenue transactions (excluding duplicates)
  const transactionsRevenue = transactions
    .filter(t => t.type === 'receita' && t.status === 'concluido' && !paidAppointments.some(a => a.id === t.id))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRevenue = appointmentsRevenue + transactionsRevenue;

  const totalExpenses = transactions
    .filter(t => t.type === 'despesa' && t.status === 'concluido')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netIncome = totalRevenue - totalExpenses;
  
  // Number of paid appointments / services in the period
  const totalPaidCount = paidAppointments.length + transactions
    .filter(t => t.type === 'receita' && t.status === 'concluido' && !paidAppointments.some(a => a.id === t.id)).length;

  const averageTicket = totalRevenue > 0 && totalPaidCount > 0 
    ? totalRevenue / totalPaidCount 
    : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / NUTRIA Pulse Bar with Active Service Mode and Professional Registration */}
      <div className="bg-gradient-to-r from-[#1b0434] via-[#2a084e] to-[#17032c] border border-purple-800/50 rounded-3xl p-5 sm:p-7 shadow-xl shadow-purple-950/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-purple-600/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              {/* Active Service Mode Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Modo de Atendimento Ativo</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/50 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                Copiloto NÚTRIA • NutrinK AI
              </span>

              {/* Time & Brasilia Date Indicator */}
              <span className="inline-flex items-center gap-1 text-xs text-purple-200 bg-[#16032a] px-3 py-1 rounded-full border border-purple-800/60">
                <Clock className="w-3.5 h-3.5 text-purple-300" />
                <span className="capitalize">{formattedToday}</span>
                <span className="text-fuchsia-300 font-bold ml-1">({currentTime} • Horário de Brasília)</span>
              </span>
            </div>

            {/* Welcome greeting with registered professional name */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex flex-wrap items-center gap-2">
              <span>{greeting}, {userAccount?.name || 'Profissional de Saúde'}!</span>
            </h1>

            {/* Professional Role & Registry Tag in Office Banner */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-fuchsia-200 bg-[#250849] px-2.5 py-1 rounded-lg border border-purple-700/60">
                {isDoctor ? <Stethoscope className="w-3.5 h-3.5 text-cyan-300" /> : <Apple className="w-3.5 h-3.5 text-fuchsia-300" />}
                <span>{professionalRoleLabel}</span>
              </span>

              {userAccount?.crn && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 bg-[#190432] px-2.5 py-1 rounded-lg border border-purple-800/50">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Registro: {userAccount.crn}</span>
                </span>
              )}

              {userAccount?.specialty && (
                <span className="text-xs text-purple-200/80 hidden sm:inline">
                  • {userAccount.specialty}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed max-w-2xl">
              {patients.length === 0 ? (
                <span>Bem-vindo(a) ao seu consultório inteligente. Seu prontuário eletrônico está pronto para receber os dados do seu primeiro paciente e emitir laudos com a inteligência clínica da NÚTRIA.</span>
              ) : (
                <span>Você tem <strong className="text-fuchsia-300">{todayAppointments.length} consulta(s) hoje</strong> e <strong className="text-white">{patients.length} paciente(s) ativo(s)</strong> sob seu acompanhamento clínico no consultório.</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenNutriaWithPrompt(
                patients.length === 0 
                  ? `NÚTRIA, como você pode me auxiliar na anamnese e prescrição dietoterápica do meu primeiro paciente como ${professionalRoleLabel}?`
                  : `NÚTRIA, faça um briefing rápido das consultas de hoje (${currentTime} em Brasília) com o resumo de cada paciente.`
              )}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40 transition-all hover:scale-[1.02]"
              id="btn-nutria-briefing-dashboard"
            >
              <NutriaAvatar size="xs" className="w-4 h-4 border-white/60 shadow" />
              <span>{patients.length === 0 ? 'Iniciar com a NÚTRIA' : 'Briefing do Dia com NÚTRIA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BANNER DISCRETO: ONBOARDING PROGRESSIVO (SISTEMA DE DEGUSTAÇÃO / TOUR)   */}
      {/* ========================================================================= */}
      {!isBannerDismissed && (
        <div className="bg-gradient-to-r from-[#1c0638] via-[#2a0852] to-[#16032d] border border-fuchsia-500/40 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden transition-all animate-fadeIn">
          {/* Linha Superior com Título, Status e Barra de Progresso */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-purple-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-fuchsia-950/60 border border-fuchsia-400/40">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">
                    Degustação & Tour Guiado: Complete seu perfil no NutrinK
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Acesso 100% Liberado</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-purple-200/90 mt-0.5">
                  Complete seu perfil no NutrinK: <strong>1. Teste a NÚTRIA IA</strong> | <strong>2. Veja o Paciente Exemplo</strong> | <strong>3. Assine um Plano</strong>
                </p>
              </div>
            </div>

            {/* Barra de Progresso Interativa */}
            <div className="flex items-center gap-3 self-stretch md:self-auto shrink-0">
              <div className="w-full md:w-36 bg-[#110121] rounded-full h-3 overflow-hidden border border-purple-800/60 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPercentage, 12)}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-fuchsia-200 whitespace-nowrap">
                {completedStepsCount} de 3 ({progressPercentage}%)
              </span>
              <button
                type="button"
                onClick={() => setIsBannerDismissed(true)}
                className="text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition-colors ml-1 cursor-pointer text-xs"
                title="Minimizar banner de degustação"
                aria-label="Minimizar banner de degustação"
                id="btn-dismiss-onboarding-banner"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 3 Passos Clicáveis e Guiados */}
          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Passo 1: Teste a NÚTRIA IA */}
            <button
              type="button"
              onClick={handleStepTestNutria}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                hasTestedNutria
                  ? 'bg-[#1e0a3b] border-emerald-500/50 text-white'
                  : 'bg-[#17032c] hover:bg-[#230745] border-purple-700/60 hover:border-fuchsia-500/60 text-purple-100'
              }`}
              id="btn-onboarding-step-1"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  hasTestedNutria ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white'
                }`}>
                  {hasTestedNutria ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold truncate">1. Teste a NÚTRIA IA</div>
                  <div className="text-[10px] text-purple-300">Copiloto de cálculos clínicos</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
            </button>

            {/* Passo 2: Veja o Paciente Exemplo */}
            <button
              type="button"
              onClick={handleStepViewPatient}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                hasViewedPatient
                  ? 'bg-[#1e0a3b] border-emerald-500/50 text-white'
                  : 'bg-[#17032c] hover:bg-[#230745] border-purple-700/60 hover:border-fuchsia-500/60 text-purple-100'
              }`}
              id="btn-onboarding-step-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  hasViewedPatient ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white'
                }`}>
                  {hasViewedPatient ? <CheckCircle2 className="w-3.5 h-3.5" /> : '2'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold truncate">2. Veja o Paciente Exemplo</div>
                  <div className="text-[10px] text-purple-300">Mariana Duarte (Prontuário TACO)</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
            </button>

            {/* Passo 3: Assine um Plano */}
            <button
              type="button"
              onClick={handleStepSubscribePlan}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                isPlanSubscribed
                  ? 'bg-[#1e0a3b] border-emerald-500/50 text-white'
                  : 'bg-gradient-to-r from-amber-500/20 via-[#220542] to-purple-950/80 hover:from-amber-500/30 border-amber-400/60 text-amber-200'
              }`}
              id="btn-onboarding-step-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isPlanSubscribed ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black'
                }`}>
                  {isPlanSubscribed ? <CheckCircle2 className="w-3.5 h-3.5" /> : '3'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold truncate text-white">3. Assine um Plano</div>
                  <div className="text-[10px] text-amber-300/90">Pix Pro R$ 89,90 ou Anual</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pacientes Ativos */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-2xl p-5 hover:border-fuchsia-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Pacientes Ativos</span>
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-fuchsia-300 flex items-center justify-center border border-purple-700/60 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{patients.length}</span>
            {patients.length > 0 ? (
              <span className="text-xs font-bold text-fuchsia-300 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Ativos
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-purple-300">
                Aguardando pacientes
              </span>
            )}
          </div>
          <p className="text-xs text-purple-200/90 mt-1">
            {patients.length === 0 ? 'Base pronta para primeiro cadastro' : 'Base clínica sob monitoramento'}
          </p>
        </div>

        {/* Card 2: Agenda Hoje */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-2xl p-5 hover:border-fuchsia-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Consultas Hoje</span>
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-300 flex items-center justify-center border border-purple-700/60 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{todayAppointments.length}</span>
            <span className="text-xs font-semibold text-purple-200">
              {todayAppointments.length > 0 
                ? `${todayAppointments.filter(a => a.status === 'confirmada').length} confirmadas` 
                : 'Nenhum agendamento'}
            </span>
          </div>
          <p className="text-xs text-purple-200/90 mt-1">
            {todayAppointments.length > 0 
              ? `Próxima às ${todayAppointments[0]?.time}` 
              : 'Nenhuma consulta agendada para hoje'}
          </p>
        </div>

        {/* Card 3: Faturamento Líquido */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-2xl p-5 hover:border-fuchsia-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Faturamento (Mês)</span>
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-fuchsia-300 flex items-center justify-center border border-purple-700/60 shadow-inner">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-fuchsia-300 mt-1 font-bold">
            Saldo Líquido: R$ {netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Card 4: Ticket Médio */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-2xl p-5 hover:border-fuchsia-500/40 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Ticket Médio</span>
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-amber-300 flex items-center justify-center border border-purple-700/60 shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-purple-200">por atendimento</span>
          </div>
          <p className="text-xs text-purple-200/90 mt-1">
            {totalPaidCount > 0 
              ? `${totalPaidCount} atendimento${totalPaidCount > 1 ? 's' : ''} pago${totalPaidCount > 1 ? 's' : ''} no período` 
              : appointments.length > 0 
              ? `${appointments.length} consulta${appointments.length > 1 ? 's' : ''} agendada${appointments.length > 1 ? 's' : ''}`
              : 'Sem atendimentos no período'}
          </p>
        </div>

      </div>

      {/* Main Grid: Agenda do Dia + Alertas da NUTRIA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Agenda de Atendimento Hoje */}
        <div className="lg:col-span-2 bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-fuchsia-400" />
                  Atendimentos de Hoje
                </h2>
                <p className="text-xs text-purple-200 mt-0.5">Grade diária de atendimentos presenciais e online</p>
              </div>
              <button
                onClick={onOpenNewAppointment}
                aria-label="Cadastrar novo agendamento de consulta"
                className="inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2.5 min-h-[44px] bg-[#25074a] hover:bg-[#340c66] text-fuchsia-300 border border-purple-700/60 rounded-xl transition-all shadow-sm cursor-pointer"
                id="btn-quick-schedule"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agendar</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {todayAppointments.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl bg-[#1d0637]/50 border border-purple-800/30">
                  <div className="w-12 h-12 rounded-2xl bg-[#28094f] text-purple-300 flex items-center justify-center mx-auto mb-3 border border-purple-700/50">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Nenhuma consulta agendada para hoje.
                  </h3>
                  <p className="text-xs text-purple-200 max-w-md mx-auto mb-4">
                    Clique em <strong>[+ Agendar]</strong> para cadastrar um horário ou utilize a <strong>NUTRIA</strong> para simular distribuições de horários e lembretes de WhatsApp.
                  </p>
                  <button
                    onClick={onOpenNewAppointment}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                    id="btn-empty-state-schedule"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>+ Agendar Primeira Consulta</span>
                  </button>
                </div>
              ) : (
                todayAppointments.map((apt, aptIdx) => {
                  return (
                    <div
                      key={apt.id ? `apt-${apt.id}` : `apt-idx-${aptIdx}`}
                      className="p-4 rounded-2xl bg-[#1d0637] border border-purple-800/40 hover:border-fuchsia-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-950/90 text-fuchsia-300 font-black text-sm flex flex-col items-center justify-center border border-fuchsia-500/30 shrink-0 shadow-inner">
                          <span>{apt.time}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => apt.patientId && onSelectPatient(apt.patientId)}
                              className="font-bold text-sm text-white hover:text-fuchsia-300 transition-colors text-left"
                            >
                              {apt.patientName}
                            </button>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#2e0b59] text-fuchsia-200 border border-purple-700/60">
                              {apt.type === 'primeira_consulta' ? '1ª Consulta' : apt.type === 'retorno' ? 'Retorno' : 'Avaliação'}
                            </span>
                          </div>
                          <p className="text-xs text-purple-200 mt-0.5 font-medium">
                            {apt.location === 'presencial_consultorio' ? 'Consultório Presencial' : 'Vídeo Online'} • R$ {apt.price} ({apt.paymentStatus === 'pago' ? 'Pago' : 'Pendente'})
                          </p>
                          {apt.notes && (
                            <p className="text-xs text-fuchsia-300 mt-1 italic font-medium">
                              "{apt.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                        <select
                          value={apt.status}
                          onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as Appointment['status'])}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none transition-colors ${
                            apt.status === 'realizada'
                              ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-600'
                              : apt.status === 'confirmada'
                              ? 'bg-purple-950 text-purple-200 border-purple-500'
                              : apt.status === 'cancelada'
                              ? 'bg-rose-950 text-rose-300 border-rose-700'
                              : 'bg-amber-950 text-amber-200 border-amber-600'
                          }`}
                        >
                          <option value="confirmada">Confirmada</option>
                          <option value="realizada">Realizada</option>
                          <option value="pendente">Pendente</option>
                          <option value="cancelada">Cancelada</option>
                        </select>

                        {onOpenAppointmentDetails && (
                          <button
                            onClick={() => onOpenAppointmentDetails(apt)}
                            className="px-3 py-2 min-h-[44px] bg-gradient-to-r from-fuchsia-600/90 to-purple-600/90 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all border border-fuchsia-400/30 cursor-pointer"
                            title="Ver detalhes da consulta"
                            aria-label={`Ver detalhes da consulta de ${apt.patientName}`}
                            id={`btn-dash-details-apt-${apt.id}`}
                          >
                            <span>Ver detalhes &gt;</span>
                          </button>
                        )}

                        <button
                          onClick={() => apt.patientId ? onSelectPatient(apt.patientId) : null}
                          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-purple-300 hover:text-white rounded-lg hover:bg-[#2c0a54] transition-colors cursor-pointer"
                          title="Ver Prontuário"
                          aria-label={`Abrir prontuário completo de ${apt.patientName}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Alertas & Insights Clínicos da NÚTRIA */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <NutriaAvatar size="xs" className="w-5 h-5 border-fuchsia-400/60 shadow" />
                Insights Clínicos NÚTRIA
              </h2>
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {patients.length === 0 ? (
                <>
                  <div className="p-3.5 rounded-2xl bg-[#1d0637] border border-purple-800/40 shadow-sm space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-fuchsia-300">
                      <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
                      Ecossistema Clínico Pronto
                    </div>
                    <p className="text-purple-100 leading-relaxed font-medium">
                      O motor da NÚTRIA analisará automaticamente taxas de TMB/GET (Mifflin & Harris-Benedict), dobras cutâneas e alertas de micronutrientes assim que os primeiros pacientes forem inseridos.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1d0637] border border-purple-800/40 shadow-sm space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      Prontuário Seguro & LGPD
                    </div>
                    <p className="text-purple-100 leading-relaxed font-medium">
                      Todos os registros, anamneses, condutas e prescrições são armazenados com criptografia de ponta a ponta e sigilo médico-nutricional.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1d0637] border border-purple-800/40 shadow-sm space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-purple-200">
                      <FileSpreadsheet className="w-4 h-4 text-purple-300 shrink-0" />
                      Tabela TACO & NutriCalc Integrados
                    </div>
                    <p className="text-purple-100 leading-relaxed font-medium">
                      Mais de 20 alimentos fundamentais cadastrados com valores de macro e micronutrientes para cálculo dietético imediato.
                    </p>
                  </div>
                </>
              ) : (
                patients.slice(0, 3).map((patient, pIdx) => (
                  <div key={`insight-${patient.id || pIdx}`} className="p-3.5 rounded-2xl bg-[#1d0637] border border-purple-800/40 shadow-sm">
                    <div className="flex items-center gap-1.5 font-bold text-fuchsia-300 mb-1">
                      <Flame className="w-4 h-4 text-fuchsia-400" />
                      Acompanhamento: {patient.name}
                    </div>
                    <p className="text-purple-100 leading-relaxed font-medium">
                      Objetivo: <strong>{patient.objective.replace('_', ' ')}</strong>. Peso Atual: <strong>{patient.currentWeightKg} kg</strong> (IMC: {patient.bmi}).
                    </p>
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="mt-2 text-[11px] font-bold text-fuchsia-300 hover:text-fuchsia-200 hover:underline inline-flex items-center gap-1"
                    >
                      Abrir ficha completa <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-purple-900/40">
            <button
              onClick={() => onOpenNutriaWithPrompt(
                patients.length === 0
                  ? "Nútria, como você recomenda estruturar a primeira consulta nutricional para maximizar a retenção do paciente?"
                  : "Nútria, sugira 3 intervenções clínicas prioritárias para os pacientes cadastrados."
              )}
              className="w-full py-2.5 px-3 rounded-xl bg-[#29094e] hover:bg-[#360c67] text-purple-100 font-bold text-xs border border-purple-700/60 flex items-center justify-center gap-2 transition-all hover:text-white shadow-sm"
              id="btn-nutria-ai-action-dash"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>{patients.length === 0 ? 'Pedir Dicas de Consulta à NÚTRIA' : 'Solicitar Análise Global à NÚTRIA'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section: Prontuários Recentes */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-fuchsia-400" />
              Prontuários Recentes
            </h2>
            <p className="text-xs text-purple-200 mt-0.5">Acesso rápido aos pacientes cadastrados na clínica</p>
          </div>
          <button
            onClick={onOpenNewPatient}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl shadow-sm transition-all border border-fuchsia-400/40"
            id="btn-top-add-patient-dash"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Novo Paciente</span>
          </button>
        </div>

        {patients.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-[#1d0637]/40 border border-purple-800/30 mt-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-fuchsia-600/20 to-purple-600/20 border border-fuchsia-500/40 text-fuchsia-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <UserPlus className="w-7 h-7 text-fuchsia-300" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Nenhum paciente cadastrado no prontuário ainda
            </h3>
            <p className="text-xs text-purple-200 max-w-md mx-auto mb-5 leading-relaxed">
              Inicie seu consultório cadastrando o primeiro paciente. O NutrinK calculará automaticamente TMB, GET, IMC e gerará planos alimentares personalizados com a ajuda da NÚTRIA.
            </p>
            <button
              onClick={onOpenNewPatient}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/50 transition-all hover:scale-[1.02]"
              id="btn-cadastrar-primeiro-paciente"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Cadastrar Primeiro Paciente</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.slice(0, 6).map((patient, pIdx) => (
              <div
                key={patient.id ? `patient-card-${patient.id}` : `pat-card-idx-${pIdx}`}
                onClick={() => onSelectPatient(patient.id)}
                className="p-4 rounded-2xl bg-[#1d0637] border border-purple-800/40 hover:border-fuchsia-500/60 cursor-pointer transition-all hover:translate-y-[-2px] group shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-fuchsia-300 transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-purple-200 mt-0.5 font-medium">
                      {patient.age} anos • {patient.gender === 'masculino' ? 'Masc' : 'Fem'} • {patient.currentWeightKg} kg
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#2c0a52] text-fuchsia-200 border border-purple-700/60">
                    {patient.objective.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-purple-200 font-medium">
                  <div>
                    IMC: <span className="font-bold text-white">{patient.bmi}</span>
                  </div>
                  <div>
                    %Gord: <span className="font-bold text-white">{patient.bodyFatPercentage}%</span>
                  </div>
                  <div>
                    GET: <span className="font-bold text-white">{patient.get} kcal</span>
                  </div>
                </div>

                {patient.tags && patient.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {patient.tags.slice(0, 2).map((t, idx) => (
                      <span key={`${patient.id || pIdx}-tag-${idx}-${t}`} className="text-[10px] font-semibold px-2 py-0.5 bg-[#29094e] text-purple-200 rounded-md border border-purple-800/40">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 📰 Destaques & Artigos Clínicos (Blog NutrinK)             */}
      {/* ======================================================== */}
      <section className="bg-[#18042f] border border-purple-800/40 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 animate-fadeIn">
        {/* Cabeçalho da Seção com Título e Botão de Ação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl" role="img" aria-label="Jornal">📰</span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Destaques & Artigos Clínicos (Blog NutrinK)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-600/50">
                  Novo
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-purple-200/80">
              Protocolos clínicos atualizados, receitas funcionais com tabela nutricional e novidades da NÚTRIA IA.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40 transition-all hover:scale-[1.02] cursor-pointer"
            id="btn-ver-todos-artigos-blog"
          >
            <span>Ver Todos os Artigos no Blog →</span>
          </button>
        </div>

        {/* Grid de Artigos Clínicos e Receitas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INITIAL_BLOG_POSTS.slice(0, 3).map((post) => (
            <article
              key={post.id}
              onClick={() => {
                setSelectedBlogPost(post);
                setIsBlogModalOpen(true);
              }}
              className="group bg-[#150228] border border-purple-800/40 hover:border-fuchsia-500/60 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-fuchsia-950/30 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                {/* Imagem Realista com Overlay e Badges */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#240645]">
                  <img
                    src={post.featuredImage}
                    alt={post.imageAlt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#150228] via-transparent to-transparent opacity-80"></div>
                  
                  {/* Tag Categoria */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-fuchsia-950/90 text-fuchsia-200 border border-fuchsia-500/60 backdrop-blur-sm shadow-md">
                      {post.categoryLabel}
                    </span>
                  </div>

                  {/* Tempo de Leitura */}
                  <div className="absolute bottom-2.5 right-3">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-200 bg-[#120224]/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-purple-800/50">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{post.readTimeMinutes} min de leitura</span>
                    </span>
                  </div>
                </div>

                {/* Título e Resumo Rápido */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-fuchsia-300 transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-purple-200/80 line-clamp-3 leading-relaxed font-normal">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Rodapé do Card com Autor e Ação "Ler Artigo" */}
              <div className="p-4 sm:p-5 pt-0 mt-1 border-t border-purple-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full object-cover border border-purple-600/50"
                  />
                  <span className="text-[11px] font-semibold text-purple-200 truncate max-w-[130px]">
                    {post.author.name}
                  </span>
                </div>

                <span className="text-xs font-bold text-fuchsia-400 group-hover:text-white flex items-center gap-1 transition-colors">
                  <span>Ler Artigo</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Rodapé da Seção com Banner de Acesso Rápido */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-300/80 bg-[#130222] p-4 rounded-2xl border border-purple-900/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Explore protocolos de DRC, SIBO, Diabetes Tipo 2, receitas Low-Carb e inteligência clínica aplicada.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="text-fuchsia-300 hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <span>Ver Todos os Artigos no Blog →</span>
          </button>
        </div>
      </section>

      {/* Modal Leitor de Artigo Clínico Completo */}
      {selectedBlogPost && (
        <BlogArticleDetailModal
          post={selectedBlogPost}
          isOpen={isBlogModalOpen}
          onClose={() => {
            setIsBlogModalOpen(false);
            setSelectedBlogPost(null);
          }}
          onSelectPost={(post) => setSelectedBlogPost(post)}
          allPosts={INITIAL_BLOG_POSTS}
          onOpenSubscriptionModal={onOpenSubscriptionModal}
          onOpenNutriaPrompt={onOpenNutriaWithPrompt}
        />
      )}

    </div>
  );
};
