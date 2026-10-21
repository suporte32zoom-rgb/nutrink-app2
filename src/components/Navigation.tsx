import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  Boxes,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight
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
  | 'inventory'
  | 'blog'
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
    if (route === '/') return path === '/';
    return path.startsWith(route);
  };

  const navItems = [
    {
      id: 'dashboard',
      route: '/',
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
      id: 'inventory',
      route: '/estoque',
      label: 'Estoque & Insumos',
      icon: Boxes,
      badge: 'Novo'
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
      id: 'blog',
      route: '/blog',
      label: 'Blog & Conteúdo',
      icon: BookOpen,
      badge: 'Artigos'
    },
    {
      id: 'settings',
      route: '/configuracoes',
      label: 'Configurações',
      icon: Settings,
      badge: null
    }
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    // Enable left if scrolled more than 5px
    setCanScrollLeft(scrollLeft > 5);
    // Enable right if there is still room to scroll
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollability();

    const timer = setTimeout(checkScrollability, 200);
    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  // Smooth scroll by +/- 200px
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const amount = direction === 'left' ? -200 : 200;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScrollability, 300);
  };

  const handleItemClick = (item: typeof navItems[0]) => {
    navigate(item.route);
    if (onChangeTab) onChangeTab(item.id as any);
    if (setActiveTab) setActiveTab(item.id as any);
  };

  return (
    <nav className="bg-[#140327] border-b border-purple-900/40 px-2 sm:px-4 lg:px-6 shadow-inner select-none relative">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2">
        {/* Seta Direcional Esquerda [ < ] */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className={`shrink-0 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
            canScrollLeft
              ? 'bg-[#290852] hover:bg-fuchsia-600 text-fuchsia-200 hover:text-white border-fuchsia-500/60 shadow-md shadow-fuchsia-950/50 active:scale-95'
              : 'bg-[#18042f]/80 text-purple-400/50 border-purple-900/50 hover:bg-[#220642] hover:text-purple-200'
          }`}
          aria-label="Rolar menu para a esquerda"
          title="Rolar menu para a esquerda"
          id="btn-nav-scroll-left"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Barra de Navegação Horizontal com Scroll Suave e Barra Nativa Oculta */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-2 sm:py-2.5 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollBehavior: 'smooth'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isPathActive(item.route) || currentTab === item.id || activeTab === item.id;
            
            if (item.id === 'nutria_hub') {
              return (
                <button
                  key={item.id}
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
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
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-md cursor-pointer shrink-0 ${
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
                data-active={isActive ? 'true' : 'false'}
                onClick={() => handleItemClick(item)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
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

        {/* Seta Direcional Direita [ > ] */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className={`shrink-0 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
            canScrollRight
              ? 'bg-[#290852] hover:bg-fuchsia-600 text-fuchsia-200 hover:text-white border-fuchsia-500/60 shadow-md shadow-fuchsia-950/50 active:scale-95'
              : 'bg-[#18042f]/80 text-purple-400/50 border-purple-900/50 hover:bg-[#220642] hover:text-purple-200'
          }`}
          aria-label="Rolar menu para a direita"
          title="Rolar menu para a direita"
          id="btn-nav-scroll-right"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </div>
    </nav>
  );
};
