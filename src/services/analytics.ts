/**
 * Google Analytics 4 (GA4) Service for NutrinK
 * Gerencia o rastreamento seguro de visualizações de página, métricas clínicas e eventos do consultório.
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
 * Inicializa com segurança o Google Analytics 4
 * Se a tag já foi inserida no index.html, reaproveita a instância global sem duplicação.
 */
export function initGoogleAnalytics(measurementId: string = GA_MEASUREMENT_ID): void {
  if (typeof window === 'undefined') return;

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
    window.gtag('config', measurementId);
  }

  // Se o script da tag já não existir na página, injeta na head
  const hasGtagScript = Array.from(document.querySelectorAll('script')).some(
    s => s.src && s.src.includes('googletagmanager.com/gtag/js')
  );

  if (!hasGtagScript) {
    const script = document.createElement('script');
    script.id = 'google-analytics-gtag';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onerror = () => {
      console.warn('[Google Analytics] Falha ao carregar gtag.js (pode estar bloqueado por AdBlocker).');
    };
    document.head.appendChild(script);
  }

  isInitialized = true;
}

/**
 * Registra a visualização de tela / módulo do sistema NutrinK (SPA Navigation)
 */
export function trackPageView(pageTitle: string, pagePath: string = window.location.pathname): void {
  if (typeof window === 'undefined') return;

  if (!window.gtag) {
    initGoogleAnalytics();
  }

  try {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_path: pagePath,
        page_location: `${window.location.origin}${pagePath.startsWith('/') ? pagePath : '/' + pagePath}`
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
 * Rastreia emissão de documentos clínicos (Receitas, Planos, Recibos)
 */
export function trackDocumentExport(
  documentType: 'plano_alimentar' | 'prescricao_magistral' | 'pedido_exames' | 'recibo_consulta',
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
