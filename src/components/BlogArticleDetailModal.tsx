import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Share2, 
  Check, 
  Copy, 
  BookOpen, 
  HeartPulse, 
  Sparkles, 
  Bot, 
  Crown, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Utensils, 
  ChefHat, 
  Flame, 
  Dna, 
  AlertCircle,
  FileText,
  BookmarkCheck,
  ChevronRight,
  Zap,
  QrCode
} from 'lucide-react';
import { BlogPost } from '../data/blogData';
import { NutrinKLogo } from './NutrinKLogo';
import { NutriaAvatar } from './NutriaAvatar';

interface BlogArticleDetailModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPost?: (post: BlogPost) => void;
  allPosts?: BlogPost[];
  onOpenSubscriptionModal?: () => void;
  onOpenNutriaPrompt?: (prompt: string) => void;
}

export const BlogArticleDetailModal: React.FC<BlogArticleDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onSelectPost,
  allPosts = [],
  onOpenSubscriptionModal,
  onOpenNutriaPrompt
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen && post) {
      const originalTitle = document.title;
      document.title = `${post.title} — Blog NutrinK`;

      // Update or insert canonical meta description for SEO
      let metaDesc = document.querySelector('meta[name="description"]');
      const originalDesc = metaDesc?.getAttribute('content') || '';
      if (metaDesc) {
        metaDesc.setAttribute('content', post.excerpt);
      }

      // Add Schema.org JSON-LD for this article
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.id = 'article-json-ld';
      schemaScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': post.recipeDetails ? 'Recipe' : 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: [post.featuredImage],
        datePublished: post.publishedAt,
        author: {
          '@type': 'Person',
          name: post.author.name,
          jobTitle: post.author.role
        },
        publisher: {
          '@type': 'Organization',
          name: 'NutrinK — Sistema de Inteligência Clínica',
          logo: {
            '@type': 'ImageObject',
            url: 'https://i.ibb.co/6y40Fbd/nutrink-logo.png'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://nutrink.com.br/blog/${post.slug}`
        }
      });
      document.head.appendChild(schemaScript);

      return () => {
        document.title = originalTitle;
        if (metaDesc) metaDesc.setAttribute('content', originalDesc);
        const el = document.getElementById('article-json-ld');
        if (el) el.remove();
      };
    }
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/blog/${post.slug}` 
    : `https://nutrink.com.br/blog/${post.slug}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Confira este artigo clínico no Blog NutrinK:\n\n*${post.title}*\n\n${post.excerpt}\n\nAcesse: ${currentUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${post.title} | NutrinK Blog`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const relatedPosts = allPosts
    .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
    .slice(0, 3);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      id="blog-article-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
    >
      <article className="bg-[#150328] border border-purple-800/80 rounded-3xl max-w-4xl w-full text-white shadow-2xl overflow-hidden relative max-h-[94vh] flex flex-col my-auto shadow-purple-950/90">
        
        {/* Sticky Top Bar with Navigation and Share actions */}
        <header className="bg-[#1e053a]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-purple-800/50 flex items-center justify-between shrink-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-bold text-purple-200 hover:text-white bg-[#28084f] hover:bg-[#390d6e] px-3 py-1.5 rounded-xl border border-purple-700/60 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Blog</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-purple-300 font-medium">Compartilhar:</span>
            
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-all cursor-pointer"
              title="Compartilhar no WhatsApp"
              aria-label="Compartilhar no WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#2a0952] hover:bg-[#3d0e74] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-semibold transition-all cursor-pointer"
              title="Copiar Link Permanente"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 text-[11px]">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-300" />
                  <span className="text-[11px]">Copiar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-purple-300 hover:text-white hover:bg-purple-800/50 rounded-xl transition-all cursor-pointer ml-1"
              aria-label="Fechar artigo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Article Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 space-y-6">
          
          {/* Breadcrumb & Metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-fuchsia-950/80 border border-fuchsia-500/60 text-fuchsia-300 font-bold uppercase tracking-wider text-[11px]">
                {post.categoryLabel}
              </span>
              <span className="flex items-center gap-1 text-purple-300">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </span>
              <span className="text-purple-600">•</span>
              <span className="flex items-center gap-1 text-purple-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{post.readTimeMinutes} min de leitura</span>
              </span>
            </div>

            <h1 
              id="article-modal-title" 
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight"
            >
              {post.title}
            </h1>

            <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed font-normal">
              {post.excerpt}
            </p>
          </div>

          {/* Featured Image */}
          <div className="relative rounded-2xl overflow-hidden border border-purple-800/60 shadow-xl bg-purple-950/50">
            <img
              src={post.featuredImage}
              alt={post.imageAlt}
              className="w-full h-64 sm:h-96 object-cover select-none"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#150328] via-transparent to-transparent opacity-80 pointer-events-none"></div>
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-purple-300/80">
              <span className="truncate max-w-md">{post.imageAlt}</span>
              <span className="shrink-0 bg-black/60 px-2 py-0.5 rounded text-[10px]">Unsplash High-Res</span>
            </div>
          </div>

          {/* Author Card & Scientific Validation Badge */}
          <div className="bg-[#1c0536] border border-purple-800/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-fuchsia-500/60 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm sm:text-base">{post.author.name}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verificado</span>
                  </span>
                </div>
                <p className="text-xs text-purple-300 font-medium">{post.author.role}</p>
                {post.author.crmCrn && (
                  <p className="text-[11px] text-amber-300/90 font-mono mt-0.5">{post.author.crmCrn}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-purple-300 bg-[#250746] px-3.5 py-2 rounded-xl border border-purple-700/50 w-full sm:w-auto">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px]">Revisado pela Equipe Clínica NutrinK & NÚTRIA IA</span>
            </div>
          </div>

          {/* Recipe Details Card (if article has recipe) */}
          {post.recipeDetails && (
            <section className="bg-gradient-to-br from-[#1a0433] via-[#240647] to-[#1a0433] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-800/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Ficha Técnica & Tabela Nutricional</h3>
                    <p className="text-xs text-amber-200/90">Valores calculados com base na Tabela TACO / USDA</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-purple-200">
                  <span className="bg-purple-900/60 px-3 py-1 rounded-xl border border-purple-700/50 font-semibold">
                    Preparo: {post.recipeDetails.prepTime}
                  </span>
                  <span className="bg-purple-900/60 px-3 py-1 rounded-xl border border-purple-700/50 font-semibold">
                    Rendimento: {post.recipeDetails.servings}
                  </span>
                </div>
              </div>

              {/* Macronutrient Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 bg-[#130225] rounded-2xl border border-amber-500/30 text-center">
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Calorias</span>
                  <span className="text-xl font-black text-white">{post.recipeDetails.calories}</span>
                  <span className="text-[10px] text-purple-400 block">kcal</span>
                </div>
                <div className="p-3 bg-[#130225] rounded-2xl border border-emerald-500/30 text-center">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Proteínas</span>
                  <span className="text-xl font-black text-emerald-400">{post.recipeDetails.proteinGrams}g</span>
                  <span className="text-[10px] text-purple-400 block">alto VB</span>
                </div>
                <div className="p-3 bg-[#130225] rounded-2xl border border-sky-500/30 text-center">
                  <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider block">Carboidratos</span>
                  <span className="text-xl font-black text-sky-400">{post.recipeDetails.carbsGrams}g</span>
                  <span className="text-[10px] text-purple-400 block">baixo IG</span>
                </div>
                <div className="p-3 bg-[#130225] rounded-2xl border border-purple-500/30 text-center">
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">Lipídios</span>
                  <span className="text-xl font-black text-purple-300">{post.recipeDetails.fatsGrams}g</span>
                  <span className="text-[10px] text-purple-400 block">gorduras boas</span>
                </div>
                <div className="p-3 bg-[#130225] rounded-2xl border border-fuchsia-500/30 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-wider block">Fibras</span>
                  <span className="text-xl font-black text-fuchsia-300">{post.recipeDetails.fiberGrams}g</span>
                  <span className="text-[10px] text-purple-400 block">prebióticas</span>
                </div>
              </div>

              {/* Ingredients & Instructions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                    <Utensils className="w-4 h-4 text-amber-400" />
                    <span>Ingredientes Selecionados</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-purple-100">
                    {post.recipeDetails.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#17032c] p-2.5 rounded-xl border border-purple-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                    <Flame className="w-4 h-4 text-emerald-400" />
                    <span>Modo de Preparo Passo a Passo</span>
                  </h4>
                  <ol className="space-y-2.5 text-xs text-purple-100">
                    {post.recipeDetails.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 bg-[#17032c] p-2.5 rounded-xl border border-purple-800/50">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-500/40">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Substitutions */}
              {post.recipeDetails.substitutions && post.recipeDetails.substitutions.length > 0 && (
                <div className="p-3.5 bg-[#140224] rounded-2xl border border-purple-800/60 space-y-2">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Substituições para Intolerantes e Alérgicos</span>
                  </span>
                  <ul className="text-xs text-purple-200/90 space-y-1">
                    {post.recipeDetails.substitutions.map((sub, idx) => (
                      <li key={idx}>• {sub}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Clinical Protocol Details Box (if article is clinical) */}
          {post.clinicalProtocol && (
            <section className="bg-gradient-to-br from-[#120524] via-[#1a0833] to-[#120524] border-2 border-sky-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 border-b border-purple-800/60 pb-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Quadro Resumo de Conduta Clínica</h3>
                  <p className="text-xs text-sky-200">{post.clinicalProtocol.guidelinesSource}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider block">
                  Recomendações Práticas Fundamentais:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {post.clinicalProtocol.keyRecommendations.map((rec, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#17032b] border border-sky-500/20 text-purple-100 flex items-start gap-2">
                      <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {post.clinicalProtocol.contraindications && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl space-y-1 text-xs">
                  <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Contraindicações & Cuidados:</span>
                  </span>
                  <ul className="text-rose-200/90 text-xs space-y-0.5">
                    {post.clinicalProtocol.contraindications.map((contra, idx) => (
                      <li key={idx}>• {contra}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Main Article Content Sections */}
          <div className="space-y-6 pt-2">
            {post.sections.map((section, idx) => (
              <section key={idx} className="space-y-3.5 text-purple-100/90 leading-relaxed text-sm sm:text-base">
                {section.heading && (
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-2 border-l-4 border-fuchsia-500 pl-3">
                    {section.heading}
                  </h2>
                )}

                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-purple-100/90 leading-relaxed font-normal">
                    {p}
                  </p>
                ))}

                {section.quote && (
                  <blockquote className="my-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#27064d] to-purple-950/80 border-l-4 border-fuchsia-400 italic text-purple-100 text-sm sm:text-base font-medium shadow-inner">
                    "{section.quote}"
                  </blockquote>
                )}

                {section.callout && (
                  <div className={`p-4 rounded-2xl border ${
                    section.callout.type === 'alert'
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-100'
                      : section.callout.type === 'protocol'
                      ? 'bg-sky-950/40 border-sky-500/50 text-sky-100'
                      : 'bg-purple-950/40 border-purple-500/50 text-purple-100'
                  } space-y-1 my-3 shadow-md`}>
                    <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-white">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{section.callout.title}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed">{section.callout.text}</p>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Promotional Sales Banner Inside Article (NutrinK Plans & NÚTRIA IA) */}
          <div className="my-8 p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#2a0752] via-[#3a0972] to-[#1a0333] border-2 border-fuchsia-500/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-950/80 border border-fuchsia-400/50 text-fuchsia-300 text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tecnologia Oficial NutrinK</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Prescreva este protocolo em segundos com a <span className="text-[#15DEC0]">NÚTRIA IA</span>
                </h3>
                <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
                  Automatize anamneses, planos alimentares com tabela TACO, interações de fármacos e gestão de consultório. 
                  Escolha o plano ideal para a sua prática clínica:
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs">
                  <div className="bg-[#1c0536] px-3 py-1.5 rounded-xl border border-purple-700/60 font-semibold text-purple-200">
                    <strong className="text-white">Plano Mensal Pro:</strong> R$ 89,90/mês
                  </div>
                  <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/50 font-semibold text-emerald-300">
                    <strong className="text-amber-300">Plano Anual:</strong> R$ 899,00 à vista (Economize R$ 179)
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenSubscriptionModal) onOpenSubscriptionModal();
                  }}
                  className="w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/80 border border-emerald-400/50 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-amber-300" />
                  <span>Assinar NutrinK com Pix</span>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenNutriaPrompt) {
                      onOpenNutriaPrompt(`Olá NÚTRIA! Gostaria de aplicar o protocolo do artigo "${post.title}" em um paciente.`);
                    }
                  }}
                  className="w-full px-5 py-2.5 rounded-2xl bg-[#1f053d] hover:bg-[#2b0854] text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-purple-700/60 transition-all cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-fuchsia-400" />
                  <span>Testar na NÚTRIA IA Agora</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scientific References */}
          {post.references && post.references.length > 0 && (
            <div className="p-4 bg-[#140224] rounded-2xl border border-purple-800/60 space-y-2">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-fuchsia-400" />
                <span>Referências Bibliográficas & Diretrizes Oficiais</span>
              </h4>
              <ul className="text-xs text-purple-300/80 space-y-1 font-mono">
                {post.references.map((ref, idx) => (
                  <li key={idx} className="leading-relaxed">[{idx + 1}] {ref}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-purple-400 font-semibold">Tópicos relacionados:</span>
            {post.tags.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-900/50 text-purple-200 border border-purple-800/50 text-xs">
                #{tag}
              </span>
            ))}
          </div>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-purple-800/60 pt-6 space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-fuchsia-400" />
                <span>Artigos Relacionados Recomendados</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedPosts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectPost && onSelectPost(rel)}
                    className="p-3 bg-[#190432] hover:bg-[#250747] border border-purple-800/60 hover:border-fuchsia-500/50 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group space-y-2"
                  >
                    <img
                      src={rel.featuredImage}
                      alt={rel.imageAlt}
                      className="w-full h-24 object-cover rounded-xl group-hover:scale-[1.02] transition-transform"
                    />
                    <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-wider block">
                      {rel.categoryLabel}
                    </span>
                    <h5 className="text-xs font-bold text-white group-hover:text-fuchsia-300 transition-colors line-clamp-2">
                      {rel.title}
                    </h5>
                    <span className="text-[10px] text-purple-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{rel.readTimeMinutes} min de leitura</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </article>
    </div>
  );
};
