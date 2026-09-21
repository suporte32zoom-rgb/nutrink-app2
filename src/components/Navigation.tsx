import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Video,
  DollarSign, 
  Calculator, 
  Bot, 
  Crown, 
  Lock,
  Apple,
  Activity,
  Pill,
  Settings
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NutriaAvatar } from './NutriaAvatar';

export type ActiveTab = 
  | 'dashboard' 
  | 'patients' 
  | 'calendar' 
  | 'telemedicine' 
  | 'finance' 
  | 'nutricalc' 
  | 'nutria_hub' 
  | 'plans'
  | 'meal_plans'
  | 'exams'
  | 'prescriptions'
  | 'settings';

interface NavigationProps {
  activeTab?: string;
  currentTab?: string;
  setActiveTab?: (tab: any) => void;
  onChangeTab?: (tab: any) => void;
  onOpenSubscriptionModal?: () => void;
  unreadNutriaAlerts?: number;
  todayAppointmentsCount?: number;
  pendingAppointmentsCount?: number;
  isTelemedicineActive?: boolean;
  isSubscribed?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  currentTab,
  setActiveTab,
  onChangeTab,
  onOpenSubscriptionModal,
  todayAppointmentsCount,
  pendingAppointmentsCount,
  isTelemedicineActive,
  isSubscribed = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine active route
  const path = location.pathname;
  const isPathActive = (route: string) => {
    if (route === '/dashboard') return path === '/' || path === '/dashboard';
    return path.startsWith(route);
  };

  const navItems = [
    {
      id: 'dashboard',
      route: '/dashboard',
      label: 'Painel Clínico',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'patients',
      route: '/pacientes',
      label: 'Pacientes & Prontuários',
      icon: Users,
      badge: null
    },
    {
      id: 'calendar',
      route: '/agenda',
      label: 'Agenda & Calendário',
      icon: CalendarDays,
      badge: (todayAppointmentsCount || pendingAppointmentsCount) ? (todayAppointmentsCount || pendingAppointmentsCount) : null
    },
    {
      id: 'meal_plans',
      route: '/planos-alimentares',
      label: 'Planos Alimentares',
      icon: Apple,
      badge: 'TACO'
    },
    {
      id: 'nutricalc',
      route: '/antropometria',
      label: 'NutriCalc & Protocolos',
      icon: Calculator,
      badge: 'Cálculos'
    },
    {
      id: 'exams',
      route: '/exames',
      label: 'Exames & Biomarcadores',
      icon: Activity,
      badge: null
    },
    {
      id: 'prescriptions',
      route: '/prescricoes',
      label: 'Prescrições & Fórmulas',
      icon: Pill,
      badge: null
    },
    {
      id: 'telemedicine',
      route: '/telemedicina',
      label: 'Telemedicina & Vídeo',
      icon: Video,
      badge: isTelemedicineActive ? 'AO VIVO' : (!isSubscribed ? 'PRO' : 'HD'),
      isLive: isTelemedicineActive,
      isProLocked: !isSubscribed
    },
    {
      id: 'finance',
      route: '/financeiro',
      label: 'Financeiro & Caixa',
      icon: DollarSign,
      badge: null
    },
    {
      id: 'nutria_hub',
      route: '/nutria',
      label: 'Copiloto NÚTRIA (IA)',
      icon: Bot,
      isSpecial: true
    },
    {
      id: 'plans',
      route: '/planos',
      label: 'Planos e Assinaturas',
      icon: Crown,
      badge: 'PRO'
    },
    {
      id: 'settings',
      route: '/configuracoes',
      label: 'Configurações',
      icon: Settings,
      badge: null
    }
  ];

  const handleItemClick = (item: typeof navItems[0]) => {
    navigate(item.route);
    if (onChangeTab) onChangeTab(item.id as any);
    if (setActiveTab) setActiveTab(item.id as any);
  };

  return (
    <nav className="bg-[#140327] border-b border-purple-900/40 px-3 sm:px-6 lg:px-8 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-2 sm:py-2.5 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isPathActive(item.route) || currentTab === item.id || activeTab === item.id;
          
          if (item.id === 'nutria_hub') {
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/50' 
                    : 'bg-[#29094e] text-fuchsia-200 border border-purple-700/50 hover:bg-[#360d66] hover:text-white'
                }`}
              >
                <NutriaAvatar size="xs" className="w-4 h-4 border-fuchsia-300/80 shadow" />
                <span>{item.label}</span>
                <span className="flex h-2 w-2 rounded-full bg-fuchsia-400"></span>
              </button>
            );
          }

          if (item.id === 'plans') {
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-md cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-fuchsia-500 text-slate-950 border-2 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-950/60 font-black' 
                    : 'bg-gradient-to-r from-amber-500/25 via-[#2b0852] to-fuchsia-950/70 hover:from-amber-500/40 hover:to-fuchsia-900/90 text-amber-200 hover:text-white border border-amber-400/60 shadow-purple-950/50'
                }`}
              >
                <Crown className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950 fill-slate-950' : 'text-amber-400 fill-amber-400'}`} />
                <span className={isActive ? 'font-black text-slate-950' : 'font-extrabold text-amber-200'}>{item.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'}`}>
                  {isActive ? 'ATIVO' : 'UPGRADE'}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#26084c] text-white border border-fuchsia-500/40 shadow-sm font-bold'
                  : 'text-purple-200 hover:text-white hover:bg-[#1f063e]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-fuchsia-400' : 'text-purple-300'}`} />
              <span className={isActive ? 'text-white font-bold' : 'text-purple-200'}>{item.label}</span>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  (item as any).isLive
                    ? 'bg-rose-950 text-rose-300 border border-rose-500/80 animate-pulse flex items-center gap-1'
                    : (item as any).isProLocked
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 flex items-center gap-1'
                    : typeof item.badge === 'number'
                    ? 'bg-fuchsia-900/90 text-fuchsia-200 border border-fuchsia-500/60'
                    : 'bg-[#2e0b59] text-purple-200 border border-purple-700/50'
                }`}>
                  {(item as any).isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>}
                  {(item as any).isProLocked && <Lock className="w-2.5 h-2.5 text-amber-300" />}
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
