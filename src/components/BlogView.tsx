import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  HeartPulse, 
  Utensils, 
  Bot, 
  TrendingUp, 
  Activity, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Crown, 
  Zap, 
  QrCode, 
  ChevronRight, 
  Filter, 
  Check, 
  Share2, 
  ExternalLink 
} from 'lucide-react';
import { BlogPost, BLOG_CATEGORIES, INITIAL_BLOG_POSTS } from '../data/blogData';
import { BlogArticleDetailModal } from './BlogArticleDetailModal';
import { NutriaAvatar } from './NutriaAvatar';
import { NutrinKLogo } from './NutrinKLogo';

interface BlogViewProps {
  initialSlug?: string | null;
  onOpenSubscriptionModal?: () => void;
  onOpenNutriaPrompt?: (prompt: string) => void;
  onOpenLoginModal?: (tab?: 'login' | 'register') => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  initialSlug,
  onOpenSubscriptionModal,
  onOpenNutriaPrompt,
  onOpenLoginModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Set default page SEO meta when mounting BlogView
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Blog NutrinK — Nutrição Clínica, Receitas Saudáveis & NÚTRIA IA';

    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc?.getAttribute('content') || '';
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Blog e Hub de Conteúdo NutrinK: Protocolos clínicos de DRC, SIBO, Diabetes Tipo 2, receitas funcionais com macronutrientes e a revolução da NÚTRIA IA.'
      );
    }

    // Schema.org Blog/CollectionPage
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'blog-collection-json-ld';
    schemaScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog NutrinK — Inteligência Clínica Digital',
      description: 'Artigos clínicos, receitas funcionais e guias de gestão para nutricionistas e nutrólogos.',
      url: 'https://nutrink.com.br/blog',
      publisher: {
        '@type': 'Organization',
        name: 'NutrinK',
        logo: 'https://i.ibb.co/6y40Fbd/nutrink-logo.png'
      }
    });
    document.head.appendChild(schemaScript);

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.setAttribute('content', originalDesc);
      const el = document.getElementById('blog-collection-json-ld');
      if (el) el.remove();
    };
  }, []);

  // Handle direct navigation via slug if provided
  useEffect(() => {
    if (initialSlug) {
      const match = INITIAL_BLOG_POSTS.find(p => p.slug === initialSlug);
      if (match) {
        setSelectedPost(match);
        setIsModalOpen(true);
      }
    }
  }, [initialSlug]);

  const handleOpenPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    // Push slug to window history cleanly
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', `/blog/${post.slug}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/blog');
    }
  };

  // Filtered posts based on category and search
  const filteredPosts = useMemo(() => {
    return INITIAL_BLOG_POSTS.filter(post => {
      const matchesCategory = selectedCategory === 'todas' || post.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = post.title.toLowerCase().includes(q);
      const inExcerpt = post.excerpt.toLowerCase().includes(q);
      const inTags = post.tags.some(t => t.toLowerCase().includes(q));
      const inAuthor = post.author.name.toLowerCase().includes(q);

      return inTitle || inExcerpt || inTags || inAuthor;
    });
  }, [selectedCategory, searchQuery]);

  // Featured post
  const featuredPost = useMemo(() => {
    return INITIAL_BLOG_POSTS.find(p => p.isFeatured) || INITIAL_BLOG_POSTS[0];
  }, []);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'Bot': return <Bot className="w-4 h-4" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12" id="nutrink-blog-hub">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION & PESQUISA INTELIGENTE                   */}
      {/* ======================================================== */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1d0537] via-[#2d0752] to-[#120224] border border-purple-800/80 shadow-2xl p-6 sm:p-10 text-center lg:text-left">
        {/* Glow decorative blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto lg:mx-0 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-fuchsia-300 text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hub de Conteúdo Clínico • NutrinK Insights</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Ciência Nutricional, Protocolos Clínicos & <span className="text-[#15DEC0]">NÚTRIA IA</span>
          </h1>

          <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed max-w-2xl font-normal">
            Atualizações baseadas em evidências para nutricionistas e nutrólogos: condutas diagnósticas, 
            gastronomia funcional com cálculo de macronutrientes e a tecnologia mais avançada para a sua prática médica.
          </p>

          {/* Search Bar */}
          <div className="pt-3 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-purple-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por DRC, Low-FODMAP, NÚTRIA IA, receitas, autor..."
                className="w-full bg-[#140226]/90 border border-purple-700/80 focus:border-fuchsia-500 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-purple-400/70 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 px-2 py-1 text-xs text-purple-300 hover:text-white bg-purple-900/60 rounded-lg cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CATEGORY SELECTOR PILLS                               */}
      {/* ======================================================== */}
      <section className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {BLOG_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-950/70 border border-fuchsia-400/50'
                  : 'bg-[#17032c] hover:bg-[#250747] text-purple-200 hover:text-white border border-purple-800/60'
              }`}
            >
              <span className={isSelected ? 'text-amber-300' : 'text-purple-400'}>
                {getCategoryIcon(cat.icon)}
              </span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </section>

      {/* ======================================================== */}
      {/* 3. ARTIGO DE DESTAQUE HERO (quando filtro for 'todas')    */}
      {/* ======================================================== */}
      {selectedCategory === 'todas' && !searchQuery.trim() && featuredPost && (
        <section 
          onClick={() => handleOpenPost(featuredPost)}
          className="relative rounded-3xl overflow-hidden bg-[#18042f] border-2 border-fuchsia-500/60 shadow-2xl hover:border-fuchsia-400 transition-all cursor-pointer group"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto overflow-hidden">
              <img
                src={featuredPost.featuredImage}
                alt={featuredPost.imageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#18042f] via-transparent to-transparent opacity-90 lg:opacity-70"></div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Matéria de Destaque</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-fuchsia-950/80 border border-fuchsia-500/60 text-fuchsia-300 font-bold uppercase text-[10px]">
                    {featuredPost.categoryLabel}
                  </span>
                  <span className="text-purple-400">•</span>
                  <span className="text-purple-300 flex items-center gap-1 text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{featuredPost.readTimeMinutes} min de leitura</span>
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-fuchsia-300 transition-colors leading-snug">
                  {featuredPost.title}
                </h2>

                <p className="text-xs sm:text-sm text-purple-200/90 line-clamp-3 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-2 border-t border-purple-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-8 h-8 rounded-full object-cover border border-fuchsia-400/50"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">{featuredPost.author.name}</span>
                    <span className="text-[10px] text-purple-300 block">{featuredPost.author.role}</span>
                  </div>
                </div>

                <span className="text-xs font-bold text-fuchsia-400 group-hover:text-white flex items-center gap-1 transition-colors">
                  <span>Ler Artigo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 4. GRID DE ARTIGOS                                       */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-fuchsia-400" />
            <span>
              {selectedCategory === 'todas' ? 'Todos os Artigos Clínicos' : BLOG_CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </span>
          </h2>
          <span className="text-xs text-purple-300 font-medium">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'artigo disponível' : 'artigos disponíveis'}
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-[#17032c] rounded-3xl border border-purple-800/60 p-6 space-y-3">
            <BookOpen className="w-12 h-12 text-purple-400/50 mx-auto" />
            <h3 className="text-lg font-bold text-white">Nenhum artigo encontrado</h3>
            <p className="text-xs text-purple-300 max-w-sm mx-auto">
              Não encontramos matérias para o termo buscado. Tente pesquisar por outros termos ou limpe o filtro.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('todas');
              }}
              className="px-4 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Ver todos os artigos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                
                {/* Article Card */}
                <article
                  onClick={() => handleOpenPost(post)}
                  className="bg-[#17032c] hover:bg-[#220641] border border-purple-800/70 hover:border-fuchsia-500/60 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-950/80 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden bg-purple-950">
                      <img
                        src={post.featuredImage}
                        alt={post.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#17032c] via-transparent to-transparent opacity-80"></div>
                      
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#130225]/85 backdrop-blur-md border border-purple-600/60 text-fuchsia-300 font-bold uppercase text-[10px] tracking-wider shadow">
                          {post.categoryLabel}
                        </span>
                      </div>

                      {post.recipeDetails && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full bg-amber-950/85 backdrop-blur-md border border-amber-400/50 text-amber-300 font-bold text-[10px] flex items-center gap-1 shadow">
                            <Utensils className="w-3 h-3" />
                            <span>{post.recipeDetails.calories} kcal</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-[11px] text-purple-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{post.readTimeMinutes} min</span>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-fuchsia-300 transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-purple-200/80 line-clamp-3 leading-relaxed font-normal">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.slice(0, 3).map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Author */}
                  <div className="p-5 pt-0 mt-2 border-t border-purple-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-7 h-7 rounded-full object-cover border border-purple-600/50"
                      />
                      <span className="text-xs font-semibold text-purple-200 truncate max-w-[130px]">
                        {post.author.name}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-fuchsia-400 group-hover:text-white flex items-center gap-1 transition-colors">
                      <span>Ler</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </article>

                {/* Promotional Banner Inserted after the 3rd card for high conversion */}
                {index === 2 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 my-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#240544] via-[#370868] to-[#1d0337] border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center lg:text-left">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Acelere sua Prática Clínica com o NutrinK</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        Prontuário Eletrônico Ilimitado, Cálculos TACO & NÚTRIA IA
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
                        Mais de 2.000 profissionais de nutrição e nutrologia já economizam 15 horas semanais. 
                        Aproveite nossos planos oficiais com ativação imediata via Pix:
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs">
                        <span className="bg-[#16022b] px-3.5 py-1.5 rounded-xl border border-purple-700 font-bold text-purple-100">
                          Plano Mensal Pro: <strong className="text-emerald-400">R$ 89,90/mês</strong> (sem fidelidade)
                        </span>
                        <span className="bg-[#16022b] px-3.5 py-1.5 rounded-xl border border-amber-500/40 font-bold text-amber-300">
                          Plano Anual com Desconto: <strong className="text-white">R$ 899,00</strong> à vista
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full lg:w-auto">
                      <button
                        type="button"
                        onClick={onOpenSubscriptionModal}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/80 border border-emerald-400/50 transition-all cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-amber-300" />
                        <span>Pagar com Pix Oficial</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenNutriaPrompt) {
                            onOpenNutriaPrompt('Olá NÚTRIA! Gostaria de conhecer suas capacidades clínicas de copiloto.');
                          }
                        }}
                        className="px-5 py-3 rounded-2xl bg-[#1b0333] hover:bg-[#28064d] text-purple-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-purple-700 transition-all cursor-pointer"
                      >
                        <Bot className="w-4 h-4 text-fuchsia-400" />
                        <span>Testar a NÚTRIA IA Agora</span>
                      </button>
                    </div>
                  </div>
                )}

              </React.Fragment>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 5. NEWSLETTER & CLINICAL UPDATES SECTION                  */}
      {/* ======================================================== */}
      <section className="rounded-3xl bg-[#150328] border border-purple-800/80 p-6 sm:p-8 text-center space-y-4 shadow-xl">
        <div className="max-w-xl mx-auto space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center mx-auto text-fuchsia-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-white">
            Receba Protocolos Clínicos e Atualizações em Primeira Mão
          </h3>
          <p className="text-xs text-purple-200/90 leading-relaxed">
            Cadastre-se na newsletter científica do NutrinK. Diretrizes comentadas, novidades da NÚTRIA IA e tabelas nutricionais práticas direto no seu e-mail semanal.
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            alert('Obrigado por se inscrever na Newsletter Científica NutrinK!');
          }}
          className="max-w-md mx-auto flex flex-col sm:flex-row gap-2"
        >
          <input
            type="email"
            required
            placeholder="Seu e-mail profissional (ex: doutor@clinica.com)"
            className="flex-1 bg-[#1c0536] border border-purple-700/70 rounded-xl px-4 py-2.5 text-xs text-white placeholder-purple-400 focus:outline-none focus:border-fuchsia-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
          >
            Inscrever-se
          </button>
        </form>
      </section>

      {/* Article Detail Modal */}
      <BlogArticleDetailModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectPost={handleOpenPost}
        allPosts={INITIAL_BLOG_POSTS}
        onOpenSubscriptionModal={onOpenSubscriptionModal}
        onOpenNutriaPrompt={onOpenNutriaPrompt}
      />

    </div>
  );
};
