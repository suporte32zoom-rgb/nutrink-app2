import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Layers, 
  Home, 
  CreditCard, 
  Info, 
  BookOpen, 
  Award, 
  LogIn, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Headphones,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Share2,
  Printer
} from 'lucide-react';
import { INSTITUTIONAL_PAGES, InstitutionalPage } from '../data/institutionalPages';
import { cleanMathAndLatex } from '../utils/cleanMarkdown';

interface InstitutionalViewProps {
  pageId: string;
  onNavigatePage: (pageId: string) => void;
  onBackToDashboard: () => void;
  onOpenNutriaWithPrompt?: (prompt: string) => void;
  onOpenSubscriptionModal?: () => void;
  onOpenLoginModal?: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Layers,
  CreditCard,
  Info,
  BookOpen,
  Award,
  LogIn,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Headphones
};

export const InstitutionalView: React.FC<InstitutionalViewProps> = ({
  pageId,
  onNavigatePage,
  onBackToDashboard,
  onOpenNutriaWithPrompt,
  onOpenSubscriptionModal,
  onOpenLoginModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showIndex, setShowIndex] = useState(false);

  // Normalize pageId
  const effectivePageId = INSTITUTIONAL_PAGES[pageId] ? pageId : 'sobre';
  const currentPage: InstitutionalPage = INSTITUTIONAL_PAGES[effectivePageId];
  const CurrentIcon = ICON_MAP[currentPage?.iconName] || FileText;

  const pagesList = Object.values(INSTITUTIONAL_PAGES);

  const categories = [
    { key: 'all', label: 'Todos os Documentos' },
    { key: 'produto_recursos', label: 'Produto & Recursos' },
    { key: 'conteudos_sobre', label: 'Conteúdos & Sobre' },
    { key: 'central_legal_contato', label: 'Central Legal & Contato' }
  ];

  const filteredPages = pagesList.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.markdownContent.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAskNutria = () => {
    if (onOpenNutriaWithPrompt && currentPage) {
      onOpenNutriaWithPrompt(`Explique os pontos-chave do documento oficial: "${currentPage.title}"`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Navigation Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#130429]/90 border border-purple-900/60 rounded-2xl px-4 sm:px-6 py-3.5 backdrop-blur-md shadow-lg shadow-purple-950/40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="px-3 py-1.5 rounded-xl bg-[#26084c] hover:bg-[#390d6e] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            id="btn-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-fuchsia-400" />
            <span>Voltar ao Painel</span>
          </button>

          <span className="text-purple-600 hidden sm:inline">/</span>

          <button
            onClick={() => setShowIndex(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
              showIndex 
                ? 'bg-fuchsia-600 text-white border-fuchsia-400/80 shadow-md shadow-fuchsia-950/60'
                : 'bg-[#1a0636] text-purple-300 hover:text-white border-purple-800/60'
            }`}
            id="btn-toggle-institutional-index"
          >
            <BookOpen className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>{showIndex ? 'Ocultar Índice' : 'Índice de Documentos'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onOpenNutriaWithPrompt && (
            <button
              onClick={handleAskNutria}
              className="px-3.5 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-950/60 transition-all border border-fuchsia-400/40 cursor-pointer"
              id="btn-ask-nutria-doc"
            >
              <Bot className="w-3.5 h-3.5 text-fuchsia-200" />
              <span className="hidden sm:inline">Perguntar à</span> NÚTRIA
            </button>
          )}

          <button
            onClick={handlePrint}
            className="p-2 bg-[#1b073b] hover:bg-[#2b0c5c] text-purple-300 hover:text-white border border-purple-800/60 rounded-xl text-xs transition-all cursor-pointer"
            title="Imprimir documento"
            id="btn-print-doc"
          >
            <Printer className="w-4 h-4 text-purple-300" />
          </button>
        </div>
      </div>

      {/* Quick Switcher Document Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-800 scrollbar-track-transparent">
        {[
          { id: 'sobre', label: 'Sobre o NutrinK', path: '/sobre' },
          { id: 'metodologia', label: 'Metodologia TMB/GET', path: '/metodologia' },
          { id: 'privacidade_lgpd', label: 'Privacidade & LGPD', path: '/privacidade' },
          { id: 'termos_servico', label: 'Termos de Serviço', path: '/termos' },
          { id: 'politica_uso_aceitavel', label: 'Uso Aceitável', path: '/uso-aceitavel' },
          { id: 'fale_conosco', label: 'Suporte & Contato', path: '/suporte' },
          { id: 'faq', label: 'FAQ', path: '/faq' },
          { id: 'recursos', label: 'Recursos & Módulos', path: '/recursos' }
        ].map(tabItem => {
          const isActive = effectivePageId === tabItem.id;
          return (
            <button
              key={tabItem.id}
              onClick={() => {
                setShowIndex(false);
                onNavigatePage(tabItem.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isActive 
                  ? 'bg-fuchsia-600 text-white border-fuchsia-400/80 shadow-md shadow-fuchsia-950/60'
                  : 'bg-[#15042a] text-purple-300 hover:text-white hover:bg-[#200742] border-purple-900/50'
              }`}
            >
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {/* INDEX DRAWER / CARDS (if toggled) */}
      {showIndex && (
        <div className="bg-[#120426] border border-purple-800/70 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por título, termo ou palavra-chave..."
                className="w-full bg-[#170530] border border-purple-800/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-fuchsia-400 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategoryFilter(cat.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedCategoryFilter === cat.key
                      ? 'bg-fuchsia-600 text-white border border-fuchsia-400/50'
                      : 'bg-[#1a0636] text-purple-300 hover:text-white border border-purple-800/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {filteredPages.map(page => {
              const Icon = ICON_MAP[page.iconName] || FileText;
              const isCurrent = page.id === effectivePageId;
              return (
                <div
                  key={page.id}
                  onClick={() => {
                    setShowIndex(false);
                    onNavigatePage(page.id);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isCurrent
                      ? 'bg-[#240845] border-fuchsia-500/80 shadow-md shadow-fuchsia-950/60 ring-1 ring-fuchsia-400/50'
                      : 'bg-[#170530] border-purple-800/50 hover:border-fuchsia-500/60 hover:bg-[#200743]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-700/50 flex items-center justify-center text-fuchsia-400">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-fuchsia-400">
                          {page.categoryLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-purple-400/80 font-mono">2026</span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{page.title}</h4>
                    <p className="text-[11px] text-purple-300/80 line-clamp-2 leading-relaxed">{page.shortDescription}</p>
                  </div>

                  <div className="pt-2 border-t border-purple-900/40 flex items-center justify-between text-[11px] text-fuchsia-300 font-bold">
                    <span>Acessar</span>
                    <ChevronRight className="w-3.5 h-3.5 text-fuchsia-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DOCUMENT VIEW */}
      <div className="bg-[#120426] border border-purple-800/60 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Document Header Banner */}
        <div className="bg-[#180536] border-b border-purple-900/60 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-700/60 flex items-center justify-center text-fuchsia-400 shrink-0 shadow-md">
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-purple-950/80 text-fuchsia-300 border border-purple-700/60">
                  {currentPage.categoryLabel}
                </span>
                <span className="text-[11px] text-purple-400 font-mono">Oficial NutrinK • 2026</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-white mt-1">
                {currentPage.title}
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/90 mt-1 max-w-3xl">
                {currentPage.shortDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentPage.id === 'planos' && onOpenSubscriptionModal && (
              <button
                onClick={onOpenSubscriptionModal}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Assinar Plano PRO
              </button>
            )}

            {currentPage.id === 'acessar' && onOpenLoginModal && (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Acessar Consultório
              </button>
            )}
          </div>
        </div>

        {/* Markdown Body */}
        <div className="p-6 sm:p-10 lg:p-12 bg-[#14042c]/90">
          <div className="prose prose-invert prose-purple max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white border-b border-purple-800/60 pb-3 mb-6 mt-2 flex items-center gap-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg sm:text-xl font-bold text-fuchsia-300 mt-8 mb-4 flex items-center gap-2 border-b border-purple-900/40 pb-1.5" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base sm:text-lg font-semibold text-purple-200 mt-6 mb-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-purple-100/90 leading-relaxed my-3" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6 rounded-2xl border border-purple-800/60 bg-[#100222] shadow-md">
                    <table className="w-full text-xs sm:text-sm text-left border-collapse" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-[#23094b] text-purple-200 uppercase font-bold text-[11px] border-b border-purple-800/80" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="p-3.5 font-extrabold border-r border-purple-900/40 last:border-r-0 text-white" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="p-3.5 border-b border-purple-900/40 border-r border-purple-900/40 last:border-r-0 text-purple-200" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-fuchsia-500 bg-purple-950/40 px-5 py-4 rounded-r-2xl italic text-purple-200 my-5 shadow-sm" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-6 space-y-2 text-purple-100 my-3" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-6 space-y-2 text-purple-100 my-3" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-sm sm:text-base leading-relaxed" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="border-purple-800/50 my-8" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-extrabold text-white" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code className="bg-[#100222] text-fuchsia-300 px-1.5 py-0.5 rounded border border-purple-800/50 font-mono text-xs" {...props} />
                )
              }}
            >
              {cleanMathAndLatex(currentPage.markdownContent)}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer info within document card */}
        <div className="bg-[#180536] border-t border-purple-900/60 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-300/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Documento oficial de conformidade técnica, ética e jurídica NutrinK</span>
          </div>

          <button
            onClick={onBackToDashboard}
            className="text-fuchsia-400 hover:text-fuchsia-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Retornar ao Painel Clínico</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

      </div>

    </div>
  );
};
