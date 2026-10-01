// NutrinK PWA Service Worker
const CACHE_NAME = 'nutrink-v2';

// Domínios e endpoints do Google Analytics e Google APIs que NUNCA devem ser interceptados pelo Service Worker
// Garante que todas as requisições de mensuração saiam diretamente da conexão TCP/IP do cliente para o Google
const GOOGLE_ANALYTICS_DOMAINS = [
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com',
  'stats.g.doubleclick.net',
  'www.google-analytics.com',
  'region1.google-analytics.com'
];

function isGoogleAnalyticsRequest(url) {
  try {
    const parsed = new URL(url);
    if (GOOGLE_ANALYTICS_DOMAINS.some(domain => parsed.hostname.endsWith(domain))) {
      return true;
    }
    if (parsed.pathname.includes('/collect') || parsed.pathname.includes('/g/collect')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. REQUISIÇÕES DO GOOGLE ANALYTICS: Ignora totalmente o Service Worker
  // O navegador do visitante envia o tráfego diretamente para os servidores do Google,
  // permitindo a correta detecção do IP e geolocalização por estado (RJ, MG, BA, RS, etc.)
  if (isGoogleAnalyticsRequest(url)) {
    return; // Não executa respondWith(): requisição 100% nativa do browser
  }

  // 2. Não intercepta chamadas não-GET (POST, PUT, DELETE, etc.) nem rotas de API
  if (event.request.method !== 'GET' || url.includes('/api/')) {
    return;
  }

  // 3. Recursos estáticos locais: rede prioritária com fallback de cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
