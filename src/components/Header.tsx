import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  UserPlus, 
  DollarSign, 
  Search, 
  Bot, 
  Crown, 
  UserCheck, 
  LogIn, 
  ShieldCheck, 
  ChevronDown, 
  Boxes,
  Menu,
  X,
  LayoutDashboard,
  Users,
  CalendarDays,
  Video,
  Calculator,
  Apple,
  Activity,
  Pill,
  Settings
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NutrinKLogo } from './NutrinKLogo';
import { UserAccount } from '../types';

import { NutriaAvatar } from './NutriaAvatar';

interface HeaderProps {
  onOpenNutriaChat: () => void;
  onOpenNewPatient: () => void;
  onOpenNewAppointment: () => void;
  onOpenNewTransaction: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenProfileModal?: () => void;
  onOpenLoginModal?: () => void;
  userAccount?: UserAccount;
  globalSearch?: string;
  setGlobalSearch?: (q: string) => void;
  activePatientCount?: number;
  currentTab?: string;
  onChangeTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNutriaChat,
  onOpenNewPatient,
  onOpenNewAppointment,
  onOpenNewTransaction,
  onOpenSubscriptionModal,
  onOpenProfileModal,
  onOpenLoginModal,
  userAccount,
  globalSearch = '',
  setGlobalSearch,
  activePatientCount,
  currentTab,
  onChangeTab
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isFree = !userAccount || userAccount.plan === 'free';
  const planLabel = userAccount?.plan === 'premium_anual' 
    ? 'ANUAL PRO' 
    : userAccount?.plan === 'premium_mensal' 
    ? 'MENSAL PRO' 
    : 'FREE';

  const handleNavClick = (route: string, tabId: string) => {
    navigate(route);
    if (onChangeTab) {
      onChangeTab(tabId);
    }
    setIsMobileMenuOpen(false);
  };

  const navMenuItems = [
    { id: 'dashboard', route: '/dashboard', label: 'Painel Clínico', icon: LayoutDashboard },
    { id: 'patients', route: '/pacientes', label: 'Pacientes & Prontuários', icon: Users },
    { id: 'calendar', route: '/agenda', label: 'Agenda & Calendário', icon: CalendarDays },
    { id: 'meal_plans', route: '/planos-alimentares', label: 'Planos Alimentares', icon: Apple },
    { id: 'nutricalc', route: '/antropometria', label: 'NutriCalc & Protocolos', icon: Calculator },
    { id: 'exams', route: '/exames', label: 'Exames & Biomarcadores', icon: Activity },
    { id: 'prescriptions', route: '/prescricoes', label: 'Prescrições & Fórmulas', icon: Pill },
    { id: 'telemedicine', route: '/telemedicina', label: 'Telemedicina & Vídeo', icon: Video },
    { id: 'finance', route: '/financeiro', label: 'Financeiro & Faturamento', icon: DollarSign },
    { id: 'nutria_hub', route: '/nutria', label: 'Copiloto NÚTRIA (IA)', icon: Bot },
    { id: 'plans', route: '/planos', label: 'Planos & Assinaturas', icon: Crown },
    { id: 'settings', route: '/configuracoes', label: 'Configurações', icon: Settings }
  ];

  return (
    <header 
      className="bg-[#120326] text-white border-b border-purple-900/50 sticky top-0 shadow-lg shadow-purple-950/40 pt-2 sm:pt-3 pb-2 sm:pb-3 px-2 sm:px-6 lg:px-8 transition-all overflow-x-hidden"
      style={{ zIndex: 1000 }}
    >
      <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
        <div className="flex items-center justify-between w-full overflow-x-hidden gap-1 sm:gap-3 min-h-[3rem] sm:min-h-[3.25rem]">
          
          {/* Mobile Hamburger Menu Button (z-index: 1000) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            style={{ zIndex: 1000 }}
            className="md:hidden p-2 min-h-[44px] min-w-[44px] rounded-lg sm:rounded-xl bg-[#220743] hover:bg-[#2e0b59] text-purple-200 hover:text-white border border-purple-700/60 transition-all flex items-center justify-center cursor-pointer shrink-0 flex-shrink-0"
            aria-label={isMobileMenuOpen ? "Fechar Menu de Navegação" : "Abrir Menu de Navegação"}
            title="Menu Principal"
            id="btn-header-hamburger-menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-fuchsia-400" /> : <Menu className="w-5 h-5 text-purple-200" />}
          </button>

          {/* Official NutrinK Original Logo: [Ícone NK] [Nutrink] */}
          <div className="flex items-center gap-2 shrink-0 flex-shrink-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="cursor-pointer hover:opacity-90 transition-opacity flex items-center min-h-[44px]"
              title="NutrinK • Ir para o Dashboard"
              aria-label="NutrinK - Ir para o Painel Principal"
            >
              <NutrinKLogo size="md" withGlow={true} className="shrink-0 flex-shrink-0" />
            </button>
            
            {/* Plan Badge (Desktop/Tablet) */}
            {isFree ? (
              <button
                type="button"
                onClick={() => navigate('/planos')}
                aria-label="Plano Gratuito: Clique para fazer upgrade para PRO"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50 hover:bg-amber-900/80 transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                title="Plano Gratuito • Clique para fazer Upgrade"
                id="header-plan-badge-free"
              >
                <span>FREE ({userAccount?.dailyMessageCount || 0}/{userAccount?.dailyMessageLimit || 30})</span>
                <span className="text-amber-400 font-extrabold underline">Upgrade</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/planos')}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-fuchsia-950 via-purple-950 to-indigo-950 text-fuchsia-300 border border-fuchsia-500/50 hover:border-fuchsia-400 transition-all uppercase tracking-wider shadow-sm cursor-pointer"
                title="Plano Premium Ativo • Clique para gerenciar"
                id="header-plan-badge-premium"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>{planLabel}</span>
              </button>
            )}

            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-purple-200 border-l border-purple-800/60 pl-3">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></span>
              <span>Copiloto <strong>NÚTRIA</strong> Ativo</span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
                placeholder="Buscar paciente, prontuário..."
                className="w-full bg-[#1e073c] border border-purple-700/50 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-purple-300/60 focus:outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400/50 transition-all"
              />
            </div>
          </div>

          {/* Quick Action Buttons & User Header Identity */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 flex-shrink-0">
            
            {/* Botão de Destaque Superior: FAZER UPGRADE / PLANOS E ASSINATURAS */}
            <button
              type="button"
              onClick={() => navigate('/planos')}
              className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-black rounded-lg sm:rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex-shrink-0 border bg-gradient-to-r from-amber-400 via-amber-300 to-fuchsia-500 hover:from-amber-300 hover:to-fuchsia-400 text-slate-950 border-amber-200/90 shadow-amber-950/50 hover:shadow-amber-500/30 ring-1 sm:ring-2 ring-amber-400/60 animate-pulse hover:animate-none cursor-pointer"
              title="Ver Planos e Assinaturas - Fazer Upgrade"
              id="btn-header-upgrade-cta"
            >
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 fill-slate-950 shrink-0" />
              <span className="hidden sm:inline font-black tracking-tight">Fazer Upgrade</span>
              <span className="sm:hidden font-black text-[11px] tracking-tight">Upgrade</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-950 hidden md:inline-block shrink-0" />
            </button>

            <button
              type="button"
              onClick={onOpenNewPatient}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#220743] hover:bg-[#2e0b59] text-purple-100 border border-purple-700/60 rounded-xl transition-all shadow-sm hover:border-fuchsia-400/50 shrink-0 flex-shrink-0 cursor-pointer"
              title="Cadastrar Novo Paciente"
            >
              <UserPlus className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>Paciente</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewAppointment}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#220743] hover:bg-[#2e0b59] text-purple-100 border border-purple-700/60 rounded-xl transition-all shadow-sm hover:border-fuchsia-400/50 shrink-0 flex-shrink-0 cursor-pointer"
              title="Agendar Consulta"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-300" />
              <span>Consulta</span>
            </button>

            {/* NUTRIA Assistant Trigger Button with original brand gradient */}
            <button
              type="button"
              onClick={onOpenNutriaChat}
              aria-label="Falar com Copiloto IA NÚTRIA"
              className="relative inline-flex items-center justify-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 min-h-[44px] rounded-lg sm:rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-fuchsia-950/50 transition-all transform hover:scale-[1.03] active:scale-[0.98] border border-fuchsia-400/40 shrink-0 flex-shrink-0 cursor-pointer"
              title="Falar com Copiloto IA NÚTRIA"
              id="btn-header-nutria-chat"
            >
              <NutriaAvatar size="xs" className="w-4 h-4 border-white/60 shadow shrink-0" />
              <span className="hidden sm:inline">NÚTRIA</span>
              <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-fuchsia-200"></span>
              </span>
            </button>

            {/* User Profile Badge if authenticated, or Cadastrar/Entrar button if guest */}
            {userAccount && userAccount.email && userAccount.id !== 'usr-unauthenticated' ? (
              <button
                type="button"
                onClick={() => navigate('/configuracoes')}
                aria-label={`Perfil do profissional: ${userAccount.name}, ${userAccount.crn || ''}`}
                className="flex items-center gap-1 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 min-h-[44px] rounded-lg sm:rounded-xl bg-[#220743] hover:bg-[#2e0b59] border border-purple-700/60 text-purple-200 hover:text-white transition-all shadow-sm group shrink-0 flex-shrink-0 cursor-pointer"
                title={`Profissional: ${userAccount.name} • ${userAccount.crn} • ${userAccount.specialty}`}
                id="btn-header-user-profile"
              >
                {userAccount.avatarUrl ? (
                  <img
                    src={userAccount.avatarUrl}
                    alt={userAccount.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover border border-fuchsia-400 shadow-sm shrink-0 flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm border border-fuchsia-400/30 shrink-0 flex-shrink-0">
                    {userAccount.name.charAt(0)}
                  </div>
                )}
                
                {/* Professional Name, Title (Nutrólogo/Nutricionista), Registry and Plan Tag */}
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <div className="font-bold text-white truncate max-w-[130px] flex items-center gap-1">
                    <span>{userAccount.name.split(' ')[0]} {userAccount.name.split(' ')[1] || ''}</span>
                  </div>
                  <div className="text-[10px] text-purple-300 font-medium flex items-center gap-1.5">
                    <span className="truncate max-w-[95px] text-fuchsia-300 font-semibold">
                      {userAccount.crn?.includes('CRM') ? 'Nutrólogo' : 'Nutricionista'}
                    </span>
                    <span className={`px-1 rounded text-[8px] font-extrabold uppercase ${
                      userAccount.plan === 'premium_anual' ? 'bg-amber-950 text-amber-300 border border-amber-500/50' :
                      userAccount.plan === 'premium_mensal' ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50' :
                      'bg-slate-900 text-slate-400 border border-slate-700'
                    }`}>
                      {planLabel}
                    </span>
                  </div>
                </div>

                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400 group-hover:text-fuchsia-300 transition-transform shrink-0 flex-shrink-0" />
              </button>
            ) : onOpenLoginModal ? (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 border border-purple-500/50 transition-all shadow-md shrink-0 flex-shrink-0 active:scale-95 cursor-pointer"
                title="Cadastrar ou acessar sua conta profissional"
                id="btn-header-login-prompt"
              >
                <LogIn className="w-3.5 h-3.5 text-fuchsia-300 shrink-0 flex-shrink-0" />
                <span className="hidden sm:inline">Entrar / Cadastrar</span>
                <span className="sm:hidden font-bold text-xs">Entrar</span>
              </button>
            ) : null}

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu (z-index: 1000) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden mt-3 pt-3 border-t border-purple-800/60 space-y-2 bg-[#17042f]/95 p-3 rounded-2xl shadow-2xl backdrop-blur-md animate-fadeIn"
          style={{ zIndex: 1000 }}
        >
          {/* Quick Search on Mobile */}
          <div className="relative w-full mb-3">
            <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
              placeholder="Buscar paciente, prontuário..."
              className="w-full bg-[#1e073c] border border-purple-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-300/60 focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.route);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.route, item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold shadow-md shadow-fuchsia-950/40' 
                      : 'bg-[#220743]/80 hover:bg-[#2d0959] text-purple-200'
                  }`}
                >
                  {item.id === 'nutria_hub' ? (
                    <NutriaAvatar size="xs" className="w-4 h-4 border-white/60 shadow shrink-0" />
                  ) : (
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-fuchsia-400'}`} />
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Buttons inside Mobile Menu */}
          <div className="pt-2 border-t border-purple-800/40 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onOpenNewPatient();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 min-w-[120px] py-2 px-2.5 rounded-xl bg-[#220743] hover:bg-[#2d0959] text-purple-100 border border-purple-700/50 flex items-center justify-center gap-1.5 font-semibold cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>+ Paciente</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenNewAppointment();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 min-w-[120px] py-2 px-2.5 rounded-xl bg-[#220743] hover:bg-[#2d0959] text-purple-100 border border-purple-700/50 flex items-center justify-center gap-1.5 font-semibold cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-300" />
              <span>+ Consulta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenNewTransaction();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 min-w-[120px] py-2 px-2.5 rounded-xl bg-[#220743] hover:bg-[#2d0959] text-purple-100 border border-purple-700/50 flex items-center justify-center gap-1.5 font-semibold cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
              <span>+ Receita</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
