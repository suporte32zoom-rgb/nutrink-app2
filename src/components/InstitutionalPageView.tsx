import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  X, 
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
  ChevronLeft,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { NutriaAvatar } from './NutriaAvatar';
import { INSTITUTIONAL_PAGES, InstitutionalPage } from '../data/institutionalPages';
import { cleanMathAndLatex } from '../utils/cleanMarkdown';
import { NutrinKLogo } from './NutrinKLogo';

interface InstitutionalPageViewProps {
  pageId?: string;
  onOpenLoginModal?: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenNutriaPrompt?: (prompt: string) => void;
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

export const InstitutionalPageView: React.FC<InstitutionalPageViewProps> = ({
  pageId: propPageId,
  onOpenLoginModal,
  onOpenSubscriptionModal,
  onOpenNutriaPrompt
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ pageId?: string }>();

  // Determine current page ID from props, URL params, or pathname
  const determinePageId = (): string => {
    if (propPageId) return propPageId;
    if (params.pageId) return params.pageId;
    
    const pathname = location.pathname.replace(/^\//, '').toLowerCase();
    if (pathname === 'termos' || pathname === 'termos-de-servico') return 'termos_servico';
    if (pathname === 'privacidade' || pathname === 'lgpd') return 'privacidade_lgpd';
    if (pathname === 'sobre' || pathname === 'sobre-nos') return 'sobre';
    if (pathname === 'recursos' || pathname === 'software') return 'recursos';
    if (pathname === 'suporte' || pathname === 'ajuda' || pathname === 'contato' || pathname === 'fale-conosco') return 'fale_conosco';
    if (pathname === 'faq' || pathname === 'duvidas') return 'faq';
    if (pathname === 'metodologia' || pathname === 'tmb') return 'metodologia';
    if (pathname === 'clientes' || pathname === 'casos') return 'clientes';
    if (pathname === 'politica-uso-aceitavel' || pathname === 'uso-aceitavel') return 'politica_uso_aceitavel';
    if (pathname === 'planos' || pathname === 'precos') return 'planos';
    if (INSTITUTIONAL_PAGES[pathname]) return pathname;
    
    return 'sobre';
  };

  const initialPageId = determinePageId();
  const [selectedPageId, setSelectedPageId] = useState<string>(initialPageId);
  const [viewMode, setViewMode] = useState<'document' | 'index'>('document');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const pId = determinePageId();
    if (INSTITUTIONAL_PAGES[pId]) {
      setSelectedPageId(pId);
      setViewMode('document');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, propPageId, params.pageId]);

  const pagesList = Object.values(INSTITUTIONAL_PAGES);
  const currentPage: InstitutionalPage = INSTITUTIONAL_PAGES[selectedPageId] || INSTITUTIONAL_PAGES['sobre'] || INSTITUTIONAL_PAGES['recursos'];

  const currentIndex = pagesList.findIndex(p => p.id === currentPage.id);
  const prevPage = currentIndex > 0 ? pagesList[currentIndex - 1] : null;
  const nextPage = currentIndex < pagesList.length - 1 ? pagesList[currentIndex + 1] : null;

  const filteredPages = pagesList.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.markdownContent.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSelectDocument = (docId: string) => {
    setSelectedPageId(docId);
    setViewMode('document');
    // Update URL cleanly
    const routeMap: Record<string, string> = {
      sobre: '/sobre',
      recursos: '/recursos',
      metodologia: '/metodologia',
      clientes: '/clientes',
      faq: '/faq',
      privacidade_lgpd: '/privacidade',
      termos_servico: '/termos',
      politica_uso_aceitavel: '/politica-uso-aceitavel',
      fale_conosco: '/suporte',
      planos: '/planos',
      inicio: '/dashboard'
    };
    if (routeMap[docId]) {
      navigate(routeMap[docId]);
    }
  };

  const handleAskNutria = () => {
    navigate('/nutria');
    if (onOpenNutriaPrompt) {
      onOpenNutriaPrompt(`Explique os pontos-chave do documento oficial: "${currentPage.title}"`);
    }
  };

  const categories = [
    { key: 'all', label: 'Todos os Documentos' },
    { key: 'produto_recursos', label: 'Produto & Recursos' },
    { key: 'conteudos_sobre', label: 'Conteúdos & Sobre' },
    { key: 'central_legal_contato', label: 'Central Legal & Contato' }
  ];

  const CurrentIcon = ICON_MAP[currentPage.iconName] || FileText;

  return (
    <div className="min-h-screen bg-[#0d021d] text-slate-100 flex flex-col">
      
      {/* Top Navigation Bar */}
      <nav className="bg-[#140327] border-b border-purple-900/60 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="hover:opacity-90 transition-opacity cursor-pointer"
              title="Ir para o Consultório NutrinK"
            >
              <NutrinKLogo size="md" withGlow={true} />
            </button>
            <div className="h-5 w-px bg-purple-800/60 hidden sm:block"></div>
            <span className="text-xs font-bold text-fuchsia-300 hidden sm:inline">
              Documentação Oficial
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3.5 py-1.5 rounded-xl bg-[#230847] hover:bg-[#320c64] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-fuchsia-400" />
              <span>Voltar ao Consultório</span>
            </button>

            {onOpenLoginModal && (
              <button
                onClick={onOpenLoginModal}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Entrar / Cadastrar
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Mode Switch & Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#170530] border border-purple-900/60 rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700/60 flex items-center justify-center text-fuchsia-400 shrink-0">
              <CurrentIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white">
                  {viewMode === 'document' ? currentPage.title : 'Índice Geral de Documentos'}
                </h1>
              </div>
              <p className="text-xs text-purple-300/80">
                Categoria: <strong className="text-fuchsia-300">{currentPage.categoryLabel}</strong> • Versão Oficial 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(prev => prev === 'document' ? 'index' : 'document')}
              className="px-3 py-1.5 rounded-xl bg-[#2b0a54] hover:bg-[#3a0e70] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {viewMode === 'document' ? <BookOpen className="w-4 h-4 text-fuchsia-400" /> : <FileText className="w-4 h-4 text-fuchsia-400" />}
              <span>{viewMode === 'document' ? 'Ver Todos os Documentos' : 'Voltar ao Texto'}</span>
            </button>

            <button
              onClick={handleAskNutria}
              className="px-3 py-1.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-fuchsia-400/40"
            >
              <NutriaAvatar size="xs" className="w-3.5 h-3.5 border-white/60 shadow" />
              <span className="hidden sm:inline">Perguntar à NÚTRIA</span>
            </button>
          </div>
        </div>

        {/* VIEW MODE 1: INDEX OF ALL DOCUMENTS */}
        {viewMode === 'index' ? (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por título, termo ou palavra-chave (ex: LGPD, TMB, Honorários, Responsabilidade Técnica)..."
                  className="w-full bg-[#170530] border border-purple-800/60 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-purple-400/60 focus:outline-none focus:border-fuchsia-400 transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategoryFilter(cat.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategoryFilter === cat.key
                        ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-950/60 border border-fuchsia-400/50'
                        : 'bg-[#1a0636] text-purple-300 hover:text-white hover:bg-[#25094d] border border-purple-800/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredPages.map(page => {
                const Icon = ICON_MAP[page.iconName] || FileText;
                return (
                  <div
                    key={page.id}
                    onClick={() => handleSelectDocument(page.id)}
                    className="p-5 rounded-2xl bg-[#170530] border border-purple-800/50 hover:border-fuchsia-500/60 hover:bg-[#200743] transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-700/50 flex items-center justify-center text-fuchsia-400 group-hover:scale-110 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-fuchsia-400">
                            {page.categoryLabel}
                          </span>
                        </div>
                        <span className="text-[10px] text-purple-400/80 font-mono">
                          Oficial 2026
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-fuchsia-200 transition-colors">
                        {page.title}
                      </h3>

                      <p className="text-xs text-purple-300/80 line-clamp-2 leading-relaxed">
                        {page.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-purple-900/40 flex items-center justify-between">
                      <span className="text-xs text-fuchsia-300 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Ler Documento Completo</span>
                        <ChevronRight className="w-4 h-4 text-fuchsia-400" />
                      </span>

                      <span className="text-[10px] text-purple-400 bg-[#100322] px-2 py-0.5 rounded-md border border-purple-900/60">
                        Texto Integral
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          
          /* VIEW MODE 2: FULL DOCUMENT MARKDOWN */
          <div className="space-y-6">
            <div className="bg-[#180635] border border-purple-900/60 rounded-3xl p-6 sm:p-10 shadow-xl">
              <div className="prose prose-invert prose-purple max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white border-b border-purple-800/60 pb-3 mb-5 mt-2 flex items-center gap-2" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-lg sm:text-xl font-bold text-fuchsia-300 mt-8 mb-3 flex items-center gap-2 border-b border-purple-900/40 pb-1" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-base sm:text-lg font-semibold text-purple-200 mt-5 mb-2" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-purple-100/90 leading-relaxed my-3" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-5 rounded-2xl border border-purple-800/60 bg-[#120326] shadow-md">
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
                      <code className="bg-[#120326] text-fuchsia-300 px-1.5 py-0.5 rounded border border-purple-800/50 font-mono text-xs" {...props} />
                    )
                  }}
                >
                  {cleanMathAndLatex(currentPage.markdownContent)}
                </ReactMarkdown>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-purple-900/50">
              <button
                onClick={() => setViewMode('index')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#200742] hover:bg-[#2f0b5f] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-fuchsia-400" />
                <span>Voltar ao Índice de Documentos</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {prevPage && (
                  <button
                    onClick={() => handleSelectDocument(prevPage.id)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#190533] hover:bg-[#25084b] text-purple-300 hover:text-white border border-purple-800/50 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[140px]">{prevPage.title.split('/')[0].trim()}</span>
                  </button>
                )}

                {nextPage && (
                  <button
                    onClick={() => handleSelectDocument(nextPage.id)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#190533] hover:bg-[#25084b] text-purple-300 hover:text-white border border-purple-800/50 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="truncate max-w-[140px]">{nextPage.title.split('/')[0].trim()}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
