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

// Chave oficial configurada (ID da tag do Google do usuário)
const DEFAULT_GA_ID = 'G-33RTJ85RGN';
export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string) || DEFAULT_GA_ID;

let isInitialized = false;

/**
 * Inicializa dinamicamente o script gtag.js do Google Analytics 4
 */
export function initGoogleAnalytics(measurementId: string = GA_MEASUREMENT_ID): void {
  if (typeof window === 'undefined') return;

  if (isInitialized && window.gtag) {
    return;
  }

  // Prepara o array global dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  // Inicializa o timestamp e configurações
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title || 'NutrinK — Sistema de Gestão e Inteligência Clínica Digital',
    page_location: window.location.href,
    anonymize_ip: true,
    send_page_view: true
  });

  // Se o script da tag já não existir, injeta na head
  const scriptId = 'google-analytics-gtag';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onerror = () => {
      console.warn('[Google Analytics] Falha ao carregar gtag.js (pode estar bloqueado por AdBlocker).');
    };
    document.head.appendChild(script);
  }

  isInitialized = true;
  console.log(`📊 [NutrinK Analytics] Google Analytics 4 inicializado (${measurementId})`);
}

/**
 * Registra a visualização de tela / módulo do sistema NutrinK
 */
export function trackPageView(pageTitle: string, pagePath: string = window.location.pathname): void {
  if (typeof window === 'undefined' || !window.gtag) {
    initGoogleAnalytics();
  }

  try {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_path: pagePath,
        page_location: window.location.href
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
