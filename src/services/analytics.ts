/**
 * Google Analytics 4 (GA4) Service for NutrinK
 * 
 * DIRETRIZES DE GEOLOCALIZAÇÃO E EXECUÇÃO:
 * 1. Execução 100% no cliente (Browser/DOM): Garante que a conexão seja feita pelo dispositivo
 *    real do usuário (celular ou computador) via seu provedor de internet (Vivo, Claro, Tim, etc.),
 *    registrando a geolocalização exata de cada estado brasileiro (RJ, MG, BA, RS, SP, etc.).
 * 2. Chamada direta sem proxy interno: O tráfego vai direto para a infraestrutura do Google
 *    (googletagmanager.com e google-analytics.com), sem passar pelo servidor da Hostinger em São Paulo.
 * 3. Compatibilidade total com PWA / Service Worker (ignorado em sw.js).
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Chave oficial do Google Analytics 4 (GA4)
const DEFAULT_GA_ID = 'G-33RTJ85RGN';
export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string) || DEFAULT_GA_ID;

let isInitialized = false;

/**
 * Inicializa com segurança o Google Analytics 4 EXCLUSIVAMENTE no navegador do cliente (Front-End)
 * NUNCA executa no lado do servidor (SSR/Node) para não mascarar o IP com o datacenter da hospedagem.
 */
export function initGoogleAnalytics(measurementId: string = GA_MEASUREMENT_ID): void {
  // Garantia estrita de execução no cliente (Browser DOM)
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (isInitialized) {
    return;
  }

  // Prepara o array global dataLayer se ainda não existir
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    // Configura o ID diretamente apontando para a rede pública do Google com cookies seguros
    window.gtag('config', measurementId, {
      cookie_domain: 'auto',
      cookie_flags: 'SameSite=None;Secure',
      send_page_view: false // O roteador SPA (React Router) gerencia as trocas de rotas
    });
  }

  // Se o script da tag ainda não existir no DOM da página, injeta no head do cliente
  const hasGtagScript = Array.from(document.querySelectorAll('script')).some(
    s => s.src && s.src.includes('googletagmanager.com/gtag/js')
  );

  if (!hasGtagScript) {
    const script = document.createElement('script');
    script.id = 'google-analytics-gtag';
    script.async = true;
    script.crossOrigin = 'anonymous';
    // Conexão direta aos servidores oficiais do Google
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onerror = () => {
      console.warn('[Google Analytics] Falha ao carregar gtag.js no cliente (possível bloqueador de anúncios).');
    };
    document.head.appendChild(script);
  }

  isInitialized = true;
}

/**
 * Registra a visualização de tela / módulo do sistema NutrinK (SPA Navigation)
 * Executado estritamente no cliente com envio direto aos servidores do Google
 */
export function trackPageView(pageTitle: string, pagePath: string = (typeof window !== 'undefined' ? window.location.pathname : '/')): void {
  if (typeof window === 'undefined' || !window.document) return;

  if (!window.gtag) {
    initGoogleAnalytics();
  }

  try {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_path: pagePath,
        page_location: window.location.href,
        send_to: GA_MEASUREMENT_ID
      });
    }
  } catch (err) {
    console.warn('[Analytics PageView warning]:', err);
  }
}

/**
 * Dispara um evento personalizado no Google Analytics
 */
export function trackEvent(eventName: string, eventParams: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;

  try {
    if (!window.gtag) {
      initGoogleAnalytics();
    }
    if (window.gtag) {
      window.gtag('event', eventName, {
        app_name: 'NutrinK',
        timestamp: new Date().toISOString(),
        ...eventParams
      });
    }
  } catch (err) {
    console.warn(`[Analytics Event "${eventName}" warning]:`, err);
  }
}

/**
 * Rastreia interações com a inteligência artificial NÚTRIA
 */
export function trackNutriaInteraction(action: string, metadata?: Record<string, any>): void {
  trackEvent('nutria_copilot_interaction', {
    action,
    ...metadata
  });
}

/**
 * Rastreia ações de agendamento de consultas
 */
export function trackAppointmentEvent(
  action: 'agendado' | 'realizado' | 'cancelado' | 'reagendado' | 'pago',
  details?: { type?: string; modality?: string; price?: number }
): void {
  trackEvent('appointment_action', {
    appointment_status: action,
    appointment_type: details?.type || 'consulta',
    modality: details?.modality || 'presencial',
    value: details?.price || 0,
    currency: 'BRL'
  });
}

/**
 * Rastreia emissão de documentos clínicos (Receitas, Planos, Recibos, Resumo Clínico)
 */
export function trackDocumentExport(
  documentType: 'plano_alimentar' | 'prescricao_magistral' | 'pedido_exames' | 'recibo_consulta' | 'resumo_clinico',
  format: 'pdf' | 'whatsapp' | 'impressao'
): void {
  trackEvent('clinical_document_export', {
    document_type: documentType,
    export_format: format
  });
}

/**
 * Rastreia o uso da calculadora metabólica NutriCalc
 */
export function trackNutriCalcUsage(protocol: string, caloriesCalculated?: number): void {
  trackEvent('nutricalc_calculation', {
    protocol,
    calories: caloriesCalculated || 0
  });
}
