import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Bot, 
  Sparkles, 
  Calculator, 
  CalendarDays,
  Activity
} from 'lucide-react';
import { ActiveTab } from './Navigation';

interface BottomNavigationProps {
  currentTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenNutriaChat?: () => void;
  unreadNutriaAlerts?: number;
  todayAppointmentsCount?: number;
  isTelemedicineActive?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onChangeTab,
  onOpenNutriaChat,
  unreadNutriaAlerts = 0,
  todayAppointmentsCount = 0
}) => {
  const handleNavClick = (tab: ActiveTab) => {
    onChangeTab(tab);
  };

  const handleNutriaClick = () => {
    // If already in nutria_hub, or user wants chat, we can switch to nutria_hub and trigger chat
    onChangeTab('nutria_hub');
    if (onOpenNutriaChat) {
      onOpenNutriaChat();
    }
  };

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Painel',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'patients' as ActiveTab,
      label: 'Pacientes',
      icon: Users,
      badge: null
    },
    {
      id: 'nutria_hub' as ActiveTab,
      label: 'NÚTRIA IA',
      icon: Bot,
      isCenterHighlight: true,
      badge: unreadNutriaAlerts > 0 ? unreadNutriaAlerts : null
    },
    {
      id: 'nutricalc' as ActiveTab,
      label: 'NutriCalc',
      icon: Calculator,
      badge: null
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Agenda',
      icon: CalendarDays,
      badge: todayAppointmentsCount > 0 ? todayAppointmentsCount : null
    }
  ];

  return (
    <nav 
      aria-label="Menu de Navegação Inferior PWA"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D0B18]/90 backdrop-blur-md border-t border-purple-900/40 shadow-2xl shadow-purple-950/90 pb-[env(safe-area-inset-bottom)] transition-all duration-200"
      id="pwa-bottom-navigation"
    >
      {/* Top subtle neon light accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent pointer-events-none" />

      <div className="w-full md:max-w-[90%] lg:max-w-7xl mx-auto px-2 sm:px-6 md:px-12 lg:px-16 h-16 md:h-20 flex items-center justify-around md:justify-between relative">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const IconComponent = item.icon;

          // Central Floating Highlight Button for NÚTRIA IA
          if (item.isCenterHighlight) {
            return (
              <div key={item.id} className="relative -top-3 md:-top-4 flex flex-col items-center group px-1 md:px-4">
                <button
                  type="button"
                  onClick={handleNutriaClick}
                  className={`relative w-13 h-13 md:w-16 md:h-16 rounded-full flex items-center justify-center p-0.5 md:p-1 transition-all duration-300 transform active:scale-95 cursor-pointer shadow-lg ${
                    isActive
                      ? 'shadow-[0_0_30px_rgba(217,70,239,0.8)] ring-2 ring-fuchsia-400 ring-offset-2 ring-offset-[#0D0B18] scale-105'
                      : 'shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105'
                  }`}
                  id="btn-bottom-nav-nutria-ia"
                  title="Abrir Central e Copiloto NÚTRIA IA"
                >
                  {/* Glowing gradient background border */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-teal-400 animate-gradient-x opacity-95" />
                  
                  {/* Subtle inner dark circle */}
                  <span className="relative w-full h-full rounded-full bg-[#130728] flex items-center justify-center border border-fuchsia-400/40">
                    <IconComponent className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-200 ${
                      isActive ? 'text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'text-fuchsia-300 group-hover:text-white'
                    }`} />
                    
                    {/* Tiny sparkling icon indicator */}
                    <Sparkles className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-teal-300 absolute top-1.5 md:top-2 right-1.5 md:right-2 animate-pulse" />
                  </span>

                  {/* Pulsing ping glow */}
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 md:h-3.5 md:w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 md:h-3.5 md:w-3.5 bg-teal-400"></span>
                  </span>
                </button>

                <span className={`text-[10px] md:text-sm font-bold tracking-tight mt-0.5 md:mt-1 transition-colors ${
                  isActive ? 'text-teal-300 font-black drop-shadow-[0_0_6px_rgba(45,212,191,0.6)]' : 'text-purple-300/80 group-hover:text-purple-100'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          }

          // Standard 4 Bottom Nav Items
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex-1 max-w-[140px] md:max-w-[200px] flex flex-col items-center justify-center py-1.5 md:py-2 px-1 md:px-3 rounded-xl transition-all duration-200 relative group cursor-pointer ${
                isActive ? 'text-fuchsia-400 font-bold' : 'text-slate-400 hover:text-purple-200'
              }`}
              id={`btn-bottom-nav-${item.id}`}
            >
              {/* Active glow pill indicator on top */}
              {isActive && (
                <span className="absolute top-0.5 md:top-1 w-7 md:w-12 h-1 md:h-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-teal-400 shadow-[0_0_12px_rgba(217,70,239,0.9)] animate-fadeIn" />
              )}

              <div className="relative mt-0.5 md:mt-1">
                <IconComponent 
                  className={`w-5 h-5 md:w-7 md:h-7 transition-all duration-200 ${
                    isActive 
                      ? 'text-fuchsia-400 scale-110 drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]' 
                      : 'text-slate-400 group-hover:text-purple-300 group-hover:scale-105'
                  }`} 
                />

                {/* Badge if appointments or alerts */}
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2 md:-top-2 md:-right-3 px-1.5 md:px-2 py-0.2 md:py-0.5 rounded-full text-[9px] md:text-xs font-black bg-gradient-to-r from-fuchsia-500 to-teal-400 text-white shadow-sm shadow-purple-950 flex items-center justify-center min-w-[15px] md:min-w-[20px] h-[15px] md:h-[20px]">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] md:text-sm tracking-tight mt-1 md:mt-1.5 transition-all ${
                isActive 
                  ? 'text-fuchsia-300 font-bold md:font-extrabold drop-shadow-[0_0_6px_rgba(217,70,239,0.4)]' 
                  : 'text-slate-400 group-hover:text-purple-200'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
