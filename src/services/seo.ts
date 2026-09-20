/**
 * SEO & Canonical Metadata Service for NutrinK
 * Garante que todas as tags canônicas, OpenGraph e Twitter Cards
 * apontem com precisão para o domínio oficial https://nutrink.com.br
 */

export const DEFAULT_SITE_URL = 'https://nutrink.com.br';

export const SITE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SITE_URL || import.meta.env.VITE_APP_URL)) ||
  DEFAULT_SITE_URL
).replace(/\/$/, '');

/**
 * Atualiza dinamicamente as tags de SEO na <head>, incluindo:
 * - <title>
 * - <link rel="canonical" href="...">
 * - <meta property="og:url" content="...">
 * - <meta name="twitter:url" content="...">
 */
export function updateDocumentSeo(title?: string, path: string = window.location.pathname): void {
  if (typeof document === 'undefined') return;

  // 1. Atualizar Título se fornecido
  if (title) {
    document.title = title;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);
  }

  // 2. Normalizar o pathname canônico
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = normalizedPath === '/' ? SITE_URL : `${SITE_URL}${normalizedPath}`;

  // 3. Atualizar ou Injetar <link rel="canonical" />
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 4. Atualizar <meta property="og:url" />
  let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
  if (ogUrl) {
    ogUrl.setAttribute('content', canonicalUrl);
  }

  // 5. Atualizar <meta name="twitter:url" />
  let twUrl = document.querySelector('meta[name="twitter:url"]') as HTMLMetaElement | null;
  if (twUrl) {
    twUrl.setAttribute('content', canonicalUrl);
  }
}
