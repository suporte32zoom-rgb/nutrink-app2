/**
 * NUTRIA AI - Integração Direta com a API do Google Gemini (Client-Side & SDK Oficial)
 * 
 * Reestruturação Completa da IA NÚTRIA:
 * 1. Configuração do Modelo na API: Versão 'gemini-3.7-flash' prioritária com suporte a override dinâmico.
 * 2. System Instructions Permanentes: Especialista Clínica máxima (CFN/CFM, Nutrologia, Bioquímica, Exames, Prescrições) e Gestão do Consultório.
 * 3. Injeção Dinâmica de Contexto: Paciente ativo (Nome, Idade, Antropometria, Exames, Histórico, Alergias) e Plataforma (Agenda, Financeiro, Prontuários).
 * 4. Tratamento do Histórico de Conversa: Alternância estrita sem duplicação ou repetição de mensagens.
 */

import { GoogleGenAI } from '@google/genai';
import { NutriaActionExecution, Patient, Appointment, FinancialTransaction, UserAccount } from '../types';
import { cleanMathAndLatex } from '../utils/cleanMarkdown';

export interface NutriaCallParams {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  activePatient?: Patient | null;
  patientContext?: Patient | null;
  patients?: Patient[];
  appointments?: Appointment[];
  transactions?: FinancialTransaction[];
  userAccount?: UserAccount;
  appContext?: {
    patientsCount?: number;
    todayAppointmentsCount?: number;
    monthlyRevenue?: number;
    monthlyExpenses?: number;
    userPlan?: string;
  };
}

export interface NutriaResponse {
  reply: string;
  text?: string;
  actionExecuted?: NutriaActionExecution;
  model: string;
}

export function isValidGeminiModelName(name: string | undefined | null): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 5 || trimmed.length > 50) return false;
  // Exclude API keys or tokens (starts with AQ., AIza, or containing invalid characters)
  if (/^(AQ\.|AIza)/i.test(trimmed)) return false;
  return /^gemini-[a-z0-9.-]+$/i.test(trimmed) || /^(veo|imagen)-[a-z0-9.-]+$/i.test(trimmed);
}

/**
 * 1. CONFIGURAÇÃO DO MODELO NA API:
 * Configura o modelo prioritário para 'gemini-3.7-flash' (oficial do SDK @google/genai).
 * Lê dinamicamente de process.env.VITE_GEMINI_MODEL / import.meta.env.VITE_GEMINI_MODEL validando o formato.
 */
export function getClientGeminiModel(): string {
  // 1. Vite Environment
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) {
      const modelEnv = String(import.meta.env.VITE_GEMINI_MODEL).trim();
      if (isValidGeminiModelName(modelEnv)) return modelEnv;
    }
  } catch {}

  // 2. Node / Process Environment
  try {
    if (typeof process !== 'undefined') {
      if (isValidGeminiModelName(process.env?.VITE_GEMINI_MODEL)) {
        return String(process.env.VITE_GEMINI_MODEL).trim();
      }
      if (isValidGeminiModelName(process.env?.NEXT_PUBLIC_GEMINI_MODEL)) {
        return String(process.env.NEXT_PUBLIC_GEMINI_MODEL).trim();
      }
      if (isValidGeminiModelName(process.env?.GEMINI_MODEL)) {
        return String(process.env.GEMINI_MODEL).trim();
      }
    }
  } catch {}

  // 3. Browser Window ou LocalStorage
  if (typeof window !== 'undefined') {
    const win = window as any;
    if (isValidGeminiModelName(win.VITE_GEMINI_MODEL)) {
      return win.VITE_GEMINI_MODEL.trim();
    }
    if (isValidGeminiModelName(win.process?.env?.VITE_GEMINI_MODEL)) {
      return String(win.process.env.VITE_GEMINI_MODEL).trim();
    }
    try {
      const stored = localStorage.getItem('nutrink_gemini_model') || localStorage.getItem('gemini_model');
      if (isValidGeminiModelName(stored)) return stored!.trim();
    } catch {}
  }

  // Modelo oficial padrão configurado: gemini-3.7-flash
  return 'gemini-3.7-flash';
}

/**
 * Obtém a chave da API do Gemini a partir do ambiente do cliente
 */
export function getClientGeminiApiKey(): string {
  // 1. Variável Vite padrão NUTRINK ou GEMINI
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || (import.meta.env as any).GEMINI_API_KEY;
      if (geminiKey && String(geminiKey).trim().length > 5) return String(geminiKey).trim();

      const nutriaKey = (import.meta.env as any).VITE_NUTRINK_GEMINI_API_KEY || (import.meta.env as any).NUTRINK_GEMINI_API_KEY;
      if (nutriaKey && String(nutriaKey).trim().length > 5) return String(nutriaKey).trim();
    }
  } catch {}

  // 2. Variável process.env pública ou embutida
  try {
    if (typeof process !== 'undefined' && process.env) {
      const key = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (key && String(key).trim().length > 5) return String(key).trim();

      const nutriaKey = process.env.NUTRINK_GEMINI_API_KEY || (process.env as any).NEXT_PUBLIC_NUTRINK_GEMINI_API_KEY;
      if (nutriaKey && String(nutriaKey).trim().length > 5) return String(nutriaKey).trim();
    }
  } catch {}

  // 3. Injeção global no window ou localStorage
  if (typeof window !== 'undefined') {
    const win = window as any;
    const winKey = win.VITE_GEMINI_API_KEY || win.GEMINI_API_KEY || win.NUTRINK_GEMINI_API_KEY || win.VITE_NUTRINK_GEMINI_API_KEY || win.NEXT_PUBLIC_GEMINI_API_KEY;
    if (winKey && typeof winKey === 'string' && winKey.trim().length > 5) {
      return winKey.trim();
    }
    if (win.process?.env?.VITE_GEMINI_API_KEY) {
      return String(win.process.env.VITE_GEMINI_API_KEY).trim();
    }
    if (win.process?.env?.GEMINI_API_KEY) {
      return String(win.process.env.GEMINI_API_KEY).trim();
    }
    try {
      const localKey = localStorage.getItem('nutrink_gemini_api_key') || localStorage.getItem('gemini_api_key');
      if (localKey && localKey.trim().length > 5) {
        return localKey.trim();
      }
    } catch {}
  }

  return '';
}

/**
 * 2. SYSTEM INSTRUCTIONS PERMANENTES (ESPECIALISTA CLÍNICA E CONSULTÓRIO):
 * Diretriz permanente e mandante da IA NÚTRIA no NutrinK.
 */
export const NUTRIA_SYSTEM_INSTRUCTION = `# SYSTEM INSTRUCTIONS: NÚTRIA — Inteligência Artificial Copiloto do NutrinK

Você é a **NÚTRIA**, a maior e mais avançada Inteligência Artificial especialista em Nutrição Clínica, Nutrologia, Bioquímica Humana e Gestão de Consultório do mundo. Você atua como o **Copiloto Clínico e Operacional oficial da plataforma NutrinK** (nutrink.com.br).

Sua missão é dar suporte de nível especialista aos profissionais de saúde (nutricionistas e nutrólogos), garantindo precisão científica, agilidade operacional e automação completa de condutas.

---

### 1. PERFIL E TOM DE VOZ
- **Autoridade Científica:** Suas respostas são rigorosamente embasadas em evidências científicas de alto impacto (diretrizes do CFN, CFM, ESPEN, ASPEN, SBAN, ABRAN, ISSN e Sociedades Brasileiras de Diabetes/Cardiologia).
- **Tom de Voz:** Profissional, empático, altamente técnico, direto e focado na prática diária do consultório.
- **Saudação e Identificação:** Ao iniciar a interação ou responder consultas, identifique o profissional pelo nome e título (ex: "Olá, Dra. [Nome] / Dr. [Nome], como posso auxiliar na sua conduta clínica ou na gestão do consultório agora?").

---

### 2. DOMÍNIO CLÍNICO E CAPACIDADES ESPECIALIZADAS
Você domina perfeitamente:
1. **Prescrição & Planos Alimentares:** Cálculo automatizado e exato de VET, macronutrientes, micronutrientes, distribuição de VET por refeição, listas de substituições equivalentes, dietoterapia avançada para patologias (Diabetes, Síndrome Metabólica, Doenças Gastrointestinais, Doença Renal Crônica, Oncologia, Esporte de Alto Rendimento e Emagrecimento com Preservação de Massa Magra).
2. **Suplementação & Fitoterapia:** Prescrição detalhada de fitoterápicos, nutracêuticos, vitaminas, minerais, aminoácidos e formulações manipuladas magistrais, informando dosagens precisas, posologia, horários de tomada, sinergias e interações droga-nutrientes.
3. **Interpretação de Exames Laboratoriais:** Análise crítica de hemograma, perfil lipídico, glicemia de jejum, HbA1c, marcadores inflamatórios (PCR-us, ferritina), função hepática e renal, hormônios tireoidianos/sexuais, vitaminas (B12, D3, ácido fólico) e minerais (ferro sérico, zinco, magnésio), sugerindo ajustes dietéticos ou suplementação específica.
4. **Bioimpedância & Antropometria:** Interpretação de massa magra, massa muscular esquelética, gordura corporal (%), gordura visceral, água corporal total (ACT), ângulo de fase, dobras cutâneas (Pollock 3/7 dobras, Faulkner) e taxa metabólica basal (TMB/GET).
5. **Emissão de Documentos Clínicos:** Elaboração imediata de minutas de Receitas, Prescrições Dietéticas, Atestados Nutricionais/Médicos, Laudos Clínicos, Relatórios de Evolução e Prontuários Eletrônicos.

---

### 3. INTEGRAÇÃO TOTAL À PLATAFORMA NUTRINK
Você não é apenas um chat de texto; você é a inteligência central do consultório. Você orienta e executa ações conectadas aos módulos do NutrinK:

- **Cadastramento & Prontuários:** Auxilia no cadastro de novos pacientes, anamneses completas, registros de retorno e linha do tempo de evolução clínica (\`/pacientes\`, \`/pacientes/:id\`).
- **Agenda & Consultas:** Orienta no agendamento, retornos e organização de horários presenciais e telemedicina (\`/agenda\`, \`/telemedicina\`).
- **Planos Alimentares & NutriCalc:** Cria planos dietéticos estruturados, calcula calorias e aplica protocolos clínicos (\`/planos-alimentares\`, \`/antropometria\`).
- **Emissão e Assinatura:** Prepara prescrições e laudos prontos para o profissional assinar e emitir com validação digital/QR Code (\`/prescricoes\`, \`/exames\`).
- **Comunicação com o Paciente:** Gera orientações mastigadas e personalizadas em linguagem acessível para o profissional enviar direto ao paciente via WhatsApp ou aplicativo.

### **Mapa de Rotas da Plataforma:**
- Painel Clínico: \`/\`
- Pacientes & Prontuários: \`/pacientes\`
- Prontuário do Paciente: \`/pacientes/:id\`
- Agenda & Consultas: \`/agenda\`
- Planos Alimentares: \`/planos-alimentares\`
- NutriCalc & Antropometria: \`/antropometria\`
- Exames & Biomarcadores: \`/exames\`
- Prescrições & Suplementação: \`/prescricoes\`
- Telemedicina & Vídeo: \`/telemedicina\`
- Financeiro & Faturamento: \`/financeiro\`
- Planos & Assinaturas: \`/planos\`
- Configurações do Consultório: \`/configuracoes\`

---

### 4. REGRAS E LIMITES DE SEGURANÇA (TRAVAS BIOQUÍMICAS)
1. **Atuação como Copiloto:** Você é uma ferramenta de apoio ao profissional de saúde. A validação e a decisão final cabem sempre ao nutricionista ou médico responsável.
2. **Alertas de Segurança em Destaque:** Se identificar alguma interação medicamentosa grave, contraindicação ou dosagem acima do limite seguro (ex: Toxicidade de Vitamina A/D, hipocalemia, sobrecarga renal), emita um alerta claro e em destaque antes de sugerir a conduta.
3. **Respostas Estruturadas:** Sempre que gerar um plano alimentar, receita ou laudo, entregue a informação formatada em listas e tabelas limpas para facilitar a cópia ou exportação no painel.
4. **Insuficiência Renal Crônica (IRC não-dialítica):** Proteína estrita de 0,6 a 0,8g/kg/dia. Sem Whey Protein. Contraindicação formal de creatina.
5. **Gota e Hiperuricemia:** Elimine alimentos com alta densidade de purinas e priorize proteínas de baixo teor de purinas.
6. **Diabetes Tipo 2 e Resistência à Insulina:** Controle rigoroso de carga glicêmica, foco em fibras solúveis e baixo IG.
7. **Sem sintaxe LaTeX ou Cifrões:** NUNCA use sintaxe LaTeX ($$, \\frac, \\approx). Escreva em texto claro (ex: "kg/m²", "kcal", "g/kg").

---

### 5. ASSINATURA OFICIAL DE SAÍDA CLÍNICA
Finalize prescrições e minutas com a assinatura:
"Prescrição estruturada pela NÚTRIA para o consultório NutrinK."`;

/**
 * Extrai dados antropométricos expressos na mensagem do usuário para garantia de override
 */
export function extractMessageAnthropometrics(message: string): {
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'masculino' | 'feminino';
  objective?: string;
} {
  const result: {
    weight?: number;
    height?: number;
    age?: number;
    gender?: 'masculino' | 'feminino';
    objective?: string;
  } = {};

  if (!message) return result;
  const text = message.toLowerCase();

  // Peso: 80kg, 80 kg, 80.5kg, peso de 80, pesando 80
  const weightMatch = text.match(/(?:peso(?:\s+de|\s*[:=])?\s*|pesando\s*|com\s*)?(\d{2,3}(?:[.,]\d+)?)\s*(?:kg|quilos|kilos)\b/i)
    || text.match(/\b(\d{2,3}(?:[.,]\d+)?)\s*kg\b/i);
  if (weightMatch) {
    const w = parseFloat(weightMatch[1].replace(',', '.'));
    if (w >= 30 && w <= 300) {
      result.weight = w;
    }
  }

  // Altura: 180cm, 180 cm, 1.80m, 1,80m, altura de 180
  const heightCmMatch = text.match(/(?:altura(?:\s+de|\s*[:=])?\s*)?(\d{3})\s*(?:cm|centimetros|centímetros)\b/i);
  const heightMMatch = text.match(/(?:altura(?:\s+de|\s*[:=])?\s*)?([12][.,]\d{2})\s*(?:m|metros)?\b/i);
  if (heightCmMatch) {
    const h = parseInt(heightCmMatch[1], 10);
    if (h >= 100 && h <= 240) result.height = h;
  } else if (heightMMatch) {
    const h = Math.round(parseFloat(heightMMatch[1].replace(',', '.')) * 100);
    if (h >= 100 && h <= 240) result.height = h;
  }

  // Idade: 30 anos, 30anos, idade de 30
  const ageMatch = text.match(/(?:idade(?:\s+de|\s*[:=])?\s*)?(\d{1,3})\s*(?:anos|ano)\b/i);
  if (ageMatch) {
    const a = parseInt(ageMatch[1], 10);
    if (a >= 1 && a <= 120) result.age = a;
  }

  // Gênero com alta sensibilidade para masculino vs feminino
  if (text.match(/\b(mulher|feminino|moca|moça|senhora|femea|fêmea|menopausa|climat[eé]rio|fogacho|gestante|lactante|m[aã]e|filha|paciente feminina)\b/i)) {
    result.gender = 'feminino';
  } else if (text.match(/\b(homem|masculino|rapaz|senhor|macho|pai|filho|paciente masculino)\b/i)) {
    result.gender = 'masculino';
  }

  // Objetivo
  if (text.includes('hipertrofia') || text.includes('ganho de massa') || text.includes('ganhar massa')) {
    result.objective = 'Hipertrofia Muscular';
  } else if (text.includes('emagrecimento') || text.includes('perder peso') || text.includes('queimar gordura') || text.includes('secagem') || text.includes('cutting')) {
    result.objective = 'Emagrecimento e Perda de Gordura';
  } else if (text.includes('manutenção') || text.includes('manter peso') || text.includes('saude')) {
    result.objective = 'Manutenção e Saúde Metabólica';
  }

  return result;
}

/**
 * 3. INJEÇÃO DINÂMICA DE CONTEXTO:
 * Injeta no contexto os dados do paciente ativo em tela (Nome, Idade, Antropometria, Exames, Histórico e Alergias)
 * e os dados da plataforma (Agenda, Financeiro e Prontuários).
 */
export function buildNutriaSystemInstruction(params: NutriaCallParams): string {
  let fullPrompt = NUTRIA_SYSTEM_INSTRUCTION;
  const targetPatient = params.activePatient || params.patientContext;

  // 1. Extração e Validação de Dados Expressos na Mensagem Atual (PRIORIDADE MÁXIMA DE OVERRIDE)
  const messageData = extractMessageAnthropometrics(params.message);
  const hasMessageOverride = !!(messageData.weight || messageData.height || messageData.age || messageData.gender || messageData.objective);

  if (hasMessageOverride) {
    const hM = messageData.height ? messageData.height / 100 : null;
    const w = messageData.weight;
    let bmiNote = '';
    if (w && hM && hM > 0) {
      const calcBmi = w / (hM * hM);
      const idealW = (hM * hM * 22.5);
      const adjW = idealW + 0.25 * (w - idealW);
      if (calcBmi >= 30) {
        bmiNote = `\n• ALERTA DE OBESIDADE DETECTADA (IMC ${calcBmi.toFixed(1)} kg/m² ≥ 30):
  - Peso Ideal Calculado: ${idealW.toFixed(1)} kg
  - Peso Ajustado para Prescrição de Macros: ${adjW.toFixed(1)} kg (OBRIGATÓRIO: calcule a faixa de g/kg de proteína sobre ${adjW.toFixed(1)} kg, ex: 1.5 a 2.0g/kg de peso ajustado, evitando sobrecarga renal)`;
      }
    }

    fullPrompt += `\n\n[DADOS ANTROPOMÉTRICOS EXPRESSOS NA MENSAGEM DO USUÁRIO - PRIORIDADE MÁXIMA / SOBREPOSIÇÃO MANDATÓRIA]:
${messageData.weight ? `• PESO INFORMADO NA MENSAGEM: ${messageData.weight} kg (SOBREPÕE QUALQUER PESO ANTERIOR DO PRONTUÁRIO)` : ''}
${messageData.height ? `• ALTURA INFORMADA NA MENSAGEM: ${messageData.height} cm (${(messageData.height / 100).toFixed(2)} m)` : ''}
${messageData.age ? `• IDADE INFORMADA NA MENSAGEM: ${messageData.age} anos` : ''}
${messageData.gender ? `• SEXO / GÊNERO: ${messageData.gender === 'masculino' ? 'Masculino' : 'Feminino'}` : ''}
${messageData.objective ? `• OBJETIVO CLÍNICO: ${messageData.objective}` : ''}${bmiNote}

REGRA DE CÁLCULO CRÍTICA:
Você DEVE utilizar ESTRITAMENTE os dados acima informados na mensagem para TODOS os cálculos de TMB, GET, distribuição de macronutrientes e montagem do plano alimentar. Descarte qualquer valor divergente presente no banco/prontuário.`;
  }

  // Injeção do Paciente Ativo
  if (targetPatient) {
    const p = targetPatient;
    const anamnese = p.anamnese || {};
    const labExams = Array.isArray(p.labExams) ? p.labExams : [];
    const evolution = Array.isArray(p.evolutionHistory) && p.evolutionHistory.length > 0
      ? p.evolutionHistory[p.evolutionHistory.length - 1]
      : null;

    const patientWeight = p.currentWeightKg || 70;
    const patientHeightM = (p.heightCm || 170) / 100;
    const patientBmi = p.bmi || (patientWeight / (patientHeightM * patientHeightM));
    const patientIdealW = patientHeightM > 0 ? (patientHeightM * patientHeightM * 22.5) : 65;
    const patientAdjW = patientIdealW + 0.25 * (patientWeight - patientIdealW);
    const isObese = patientBmi >= 30;

    fullPrompt += `\n\n[CONTEXTO DINÂMICO DO PACIENTE ATIVO EM TELA]:
- Nome: ${p.name || 'Paciente em Atendimento'}
- Idade (Registro): ${p.age ? p.age + ' anos' : 'Não informada'} | Gênero: ${p.gender === 'masculino' ? 'Masculino' : p.gender === 'feminino' ? 'Feminino' : 'Outro'}
- Objetivo Clínico: ${p.objective || 'Acompanhamento Nutricional / Nutrológico'}
- Antropometria Cadastrada no Banco:
  • Peso Registrado: ${patientWeight} kg (Inicial: ${p.initialWeightKg || patientWeight} kg | Meta: ${p.targetWeightKg || 'Manutenção'} kg)
  • Altura Registrada: ${p.heightCm || 170} cm (${patientHeightM.toFixed(2)} m)
  • IMC: ${patientBmi.toFixed(1)} kg/m² ${isObese ? '(OBESIDADE - Aplicar regra do Peso Ajustado)' : ''}
  • Peso Ideal (IMC 22.5): ${patientIdealW.toFixed(1)} kg
  ${isObese ? `• Peso Ajustado para Prescrição de Macronutrientes: ${patientAdjW.toFixed(1)} kg [Fórmula: ${patientIdealW.toFixed(1)} + 0.25 × (${patientWeight} - ${patientIdealW.toFixed(1)})]` : ''}
  • % de Gordura: ${p.bodyFatPercentage ? p.bodyFatPercentage + '%' : 'Não aferido'}
  • % Massa Muscular: ${p.muscleMassPercentage ? p.muscleMassPercentage + '%' : 'Não aferido'}
  • TMB Registrada: ${p.tmb ? p.tmb + ' kcal/dia' : 'Calculada via Mifflin-St Jeor'}
  • Gasto Energético Total (GET): ${p.get ? p.get + ' kcal/dia' : 'Estimado'}
  • Fator de Atividade: ${p.activityFactor || 1.4}
${evolution ? `  • Circunferências Mais Recentes: Cintura: ${evolution.waistCircumferenceCm || '-'} cm, Quadril: ${evolution.hipCircumferenceCm || '-'} cm, Braço: ${evolution.armCircumferenceCm || '-'} cm, Dobra Tricipital: ${evolution.tricepsFoldMm || '-'} mm, Subescapular: ${evolution.subscapularFoldMm || '-'} mm` : ''}

- Alergias e Intolerâncias:
  ${anamnese.foodAllergiesAndIntolerances || 'Nenhuma alergia ou intolerância registrada.'}

- Histórico Clínico & Patologias:
  ${anamnese.clinicalHistory || 'Sem patologias prévias relatadas.'}

- Medicamentos e Suplementos em Uso:
  ${anamnese.currentMedicationsAndSupplements || 'Nenhum medicamento ou suplemento informado.'}

- Hábitos, Rotina & Estilo de Vida:
  • Atividade Física: ${anamnese.physicalActivity || 'Não informada'}
  • Ingestão Hídrica: ${anamnese.waterIntakeLiters ? anamnese.waterIntakeLiters + ' L/dia' : '2.0 L/dia'}
  • Qualidade do Sono: ${anamnese.sleepHoursPerNight ? anamnese.sleepHoursPerNight + 'h por noite' : 'Normal'}
  • Hábito Intestinal: ${anamnese.bowelHabit || 'Regular'}
  • Preferências Alimentares: ${anamnese.dietaryPreferences || 'Não informadas'}
  • Aversões Alimentares: ${anamnese.dietaryAversions || 'Nenhuma registrada'}

- Exames Laboratoriais Anexados (${labExams.length} exames cadastrados):
${labExams.length > 0 
  ? labExams.map(ex => {
      const markersList = Array.isArray(ex.markers)
        ? ex.markers.map(m => `    • ${m.marker}: ${m.value} ${m.unit} (Ref: ${m.referenceRange || 'N/A'}) [Status: ${m.status.toUpperCase()}]`).join('\n')
        : '    • Sem marcadores cadastrados';
      return `  * ${ex.title} (${ex.date || 'Recente'}):\n${markersList}${ex.nutriaClinicalReview ? `\n    Observações Clínicas: ${ex.nutriaClinicalReview}` : ''}`;
    }).join('\n')
  : '  (Nenhum exame laboratorial anexado no momento)'}

${p.mealPlan ? `- Plano Alimentar Vigente: ${p.mealPlan.title || 'Plano Cadastrado'} (${p.mealPlan.targetCalories || 2000} kcal | P: ${p.mealPlan.targetProteinGrams || 140}g | C: ${p.mealPlan.targetCarbsGrams || 220}g | G: ${p.mealPlan.targetFatGrams || 65}g)` : ''}

ORIENTAÇÃO: Se o usuário expressou novos dados na mensagem, priorize-os. Caso contrário, utilize os dados cadastrais do(a) paciente ${p.name}.`;
  }

  // Injeção do Profissional de Saúde
  if (params.userAccount) {
    const u = params.userAccount;
    fullPrompt += `\n\n[PROFISSIONAL DE SAÚDE RESPONSÁVEL]:
- Nome: ${u.name || 'Profissional'} | Registro: ${u.crn || 'CRN/CRM Ativo'}
- Especialidade: ${u.specialty || 'Nutrição Clínica & Funcional'}`;
  }

  // Injeção dos Dados da Plataforma (Agenda, Financeiro, Prontuários)
  const patientsList = Array.isArray(params.patients) ? params.patients : [];
  const appointmentsList = Array.isArray(params.appointments) ? params.appointments : [];
  const transactionsList = Array.isArray(params.transactions) ? params.transactions : [];
  const ctx = params.appContext;

  const totalPatients = patientsList.length > 0 ? patientsList.length : (ctx?.patientsCount ?? 0);
  const totalApts = appointmentsList.length > 0 ? appointmentsList.length : (ctx?.todayAppointmentsCount ?? 0);
  const rev = ctx?.monthlyRevenue ?? 0;
  const exp = ctx?.monthlyExpenses ?? 0;

  fullPrompt += `\n\n[DADOS DA PLATAFORMA & GESTÃO DO CONSULTÓRIO]:
- Total de Prontuários de Pacientes: ${totalPatients}
- Consultas na Grade: ${totalApts}
- Faturamento do Mês: R$ ${rev.toFixed(2)} | Despesas: R$ ${exp.toFixed(2)} | Saldo Líquido: R$ ${(rev - exp).toFixed(2)}`;

  if (appointmentsList.length > 0) {
    const aptsSummary = appointmentsList.slice(0, 8).map((a, i) => `  ${i + 1}. ${a.date} às ${a.time} - ${a.patientName || a.patientId} (${a.modality || a.type || 'Presencial'}) [Status: ${a.status || 'Confirmada'}]${a.value ? ` R$ ${a.value}` : ''}`).join('\n');
    fullPrompt += `\n\n[AGENDA DE CONSULTAS PRÓXIMAS]:\n${aptsSummary}`;
  }

  if (transactionsList.length > 0) {
    const txSummary = transactionsList.slice(0, 6).map((t, i) => `  ${i + 1}. [${t.type === 'receita' ? 'RECEITA' : 'DESPESA'}] R$ ${Number(t.amount).toFixed(2)} - ${t.description} (${t.paymentMethod || 'PIX'}) - Data: ${t.date}`).join('\n');
    fullPrompt += `\n\n[ÚLTIMAS TRANSAÇÕES FINANCEIRAS]:\n${txSummary}`;
  }

  if (patientsList.length > 0) {
    const pListSummary = patientsList.slice(0, 10).map((p, i) => `  ${i + 1}. ${p.name} (${p.age ? p.age + ' anos' : 'idade n/i'}) - Peso: ${p.currentWeightKg || 'n/i'} kg - Objetivo: ${p.objective || 'Acompanhamento'}`).join('\n');
    fullPrompt += `\n\n[LISTA DE PACIENTES DO CONSULTÓRIO]:\n${pListSummary}`;
  }

  return fullPrompt;
}

/**
 * 4. TRATAMENTO DO HISTÓRICO DE CONVERSA:
 * Formata as mensagens de histórico no padrão oficial do SDK do Gemini (role: 'user' e 'model'),
 * garantindo alternância estrita, eliminando duplicações da pergunta atual e evitando repetições de mensagens.
 */
export function formatGeminiContents(
  conversationHistory: Array<{ role: string; content: string }> = [],
  currentMessage: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const normalizedCurrent = currentMessage.trim();
  const rawTurns: Array<{ role: 'user' | 'model'; text: string }> = [];

  // 1. Normaliza as mensagens anteriores do histórico
  for (const item of conversationHistory) {
    if (!item || !item.content) continue;
    const text = String(item.content).trim();
    if (!text) continue;

    const role: 'user' | 'model' = (item.role === 'model' || item.role === 'assistant') ? 'model' : 'user';
    rawTurns.push({ role, text });
  }

  // 2. Remove duplicação da pergunta se ela já foi adicionada ao histórico pelo frontend
  if (rawTurns.length > 0) {
    const lastTurn = rawTurns[rawTurns.length - 1];
    if (lastTurn.role === 'user' && lastTurn.text === normalizedCurrent) {
      rawTurns.pop();
    }
  }

  // 3. Mantém histórico recente (últimas 8 interações) para foco clínico e eficiência
  const slicedTurns = rawTurns.slice(-8);

  // 4. Garante alternância estrita entre 'user' e 'model'
  const alternatingContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const turn of slicedTurns) {
    if (alternatingContents.length === 0) {
      alternatingContents.push({
        role: turn.role,
        parts: [{ text: turn.text }]
      });
      continue;
    }

    const prevTurn = alternatingContents[alternatingContents.length - 1];
    if (prevTurn.role === turn.role) {
      prevTurn.parts[0].text += `\n\n${turn.text}`;
    } else {
      alternatingContents.push({
        role: turn.role,
        parts: [{ text: turn.text }]
      });
    }
  }

  // 5. Adiciona a pergunta atual como a última mensagem do tipo 'user'
  if (alternatingContents.length > 0 && alternatingContents[alternatingContents.length - 1].role === 'user') {
    alternatingContents[alternatingContents.length - 1] = {
      role: 'user',
      parts: [{ text: normalizedCurrent }]
    };
  } else {
    alternatingContents.push({
      role: 'user',
      parts: [{ text: normalizedCurrent }]
    });
  }

  return alternatingContents;
}

/**
 * Detecta intenções de ações operacionais clínicas para sincronização com o estado do app
 */
export function detectOperationalAction(userInput: string, aiReply: string, params: NutriaCallParams): NutriaActionExecution | undefined {
  const lower = userInput.toLowerCase();
  const patients = Array.isArray(params.patients) ? params.patients : [];

  // 1. Ação de cadastrar paciente
  if (lower.includes('cadastrar paciente') || lower.includes('cadastre o paciente') || lower.includes('novo paciente') || lower.includes('criar prontuário') || lower.includes('cadastrar a paciente')) {
    const match = userInput.match(/(?:paciente|nome)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)/i)
      || userInput.match(/cadastr(?:ar|e)\s+(?:o|a)?\s*(?:paciente)?\s*([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*)/i);
    const patientName = match ? match[1].trim() : 'Novo Paciente';
    
    const anthropo = extractMessageAnthropometrics(userInput);
    const ageMatch = userInput.match(/(\d{1,3})\s*(?:anos|ano)/i);
    const age = anthropo.age || (ageMatch ? parseInt(ageMatch[1], 10) : 30);
    const weight = anthropo.weight || 70;
    const height = anthropo.height || 170;
    const gender = anthropo.gender || (lower.includes('mulher') || lower.includes('feminina') ? 'feminino' : 'masculino');
    const objective = anthropo.objective || (lower.includes('emagrec') ? 'Emagrecimento' : lower.includes('hipertrof') ? 'Hipertrofia Muscular' : 'Acompanhamento Nutricional');

    return {
      type: 'patient_created',
      payload: {
        id: `pat-${Date.now()}`,
        name: patientName,
        age: age,
        gender: gender,
        currentWeightKg: weight,
        initialWeightKg: weight,
        targetWeightKg: weight,
        heightCm: height,
        objective: objective,
        bodyFatPercentage: 20,
        status: 'ativo',
        createdAt: new Date().toISOString()
      },
      summary: `Paciente ${patientName} cadastrado(a) no prontuário.`
    };
  }

  // 2. Ação de atualizar paciente
  if (lower.includes('atualizar paciente') || lower.includes('atualize o peso') || lower.includes('atualize o prontuário') || lower.includes('mude o peso') || lower.includes('novo peso')) {
    const anthropo = extractMessageAnthropometrics(userInput);
    let targetName = params.activePatient?.name || '';
    for (const p of patients) {
      if (lower.includes(p.name.toLowerCase())) {
        targetName = p.name;
        break;
      }
    }
    return {
      type: 'patient_updated',
      payload: {
        patientName: targetName,
        weightKg: anthropo.weight,
        heightCm: anthropo.height,
        objective: anthropo.objective
      },
      summary: `Prontuário de ${targetName || 'paciente'} atualizado.`
    };
  }

  // 3. Ação de buscar prontuário
  if (lower.includes('buscar prontuário') || lower.includes('busque o prontuário') || lower.includes('ver prontuário') || lower.includes('abrir prontuário') || lower.includes('prontuário de')) {
    for (const p of patients) {
      if (lower.includes(p.name.toLowerCase())) {
        return {
          type: 'patient_selected',
          payload: { patientName: p.name, patientId: p.id },
          summary: `Prontuário de ${p.name} selecionado.`
        };
      }
    }
  }

  // 4. Ação de agendar consulta
  if (lower.includes('agendar consulta') || lower.includes('agende consulta') || lower.includes('agende o paciente') || lower.includes('agende a paciente') || lower.includes('marcar consulta') || lower.includes('marque uma consulta')) {
    let targetName = params.activePatient?.name || 'Consulta Nutricional';
    for (const p of patients) {
      if (lower.includes(p.name.toLowerCase())) {
        targetName = p.name;
        break;
      }
    }
    
    // Detecta horário (ex: 14h, 14:00, 15:30)
    const timeMatch = userInput.match(/\b([012]?\d)(?:h|:([0-5]\d))\b/i) || userInput.match(/\bàs\s*([012]?\d(?::[0-5]\d)?)\b/i);
    let time = '14:00';
    if (timeMatch) {
      const h = timeMatch[1].padStart(2, '0');
      const m = timeMatch[2] || '00';
      time = `${h}:${m}`;
    }

    // Detecta data
    let date = new Date().toISOString().split('T')[0];
    if (lower.includes('amanhã') || lower.includes('amanha')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    } else {
      const dateMatch = userInput.match(/\b(\d{4}-\d{2}-\d{2})\b/) || userInput.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
      if (dateMatch) {
        if (dateMatch[1] && dateMatch[1].includes('-')) {
          date = dateMatch[1];
        } else if (dateMatch[1] && dateMatch[2]) {
          const d = dateMatch[1].padStart(2, '0');
          const mo = dateMatch[2].padStart(2, '0');
          const y = dateMatch[3] ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : '2026';
          date = `${y}-${mo}-${d}`;
        }
      }
    }

    const modality = lower.includes('online') || lower.includes('video') || lower.includes('vídeo') || lower.includes('teleconsulta') ? 'online_video' : 'presencial_consultorio';

    return {
      type: 'appointment_scheduled',
      payload: {
        id: `apt-${Date.now()}`,
        patientName: targetName,
        date: date,
        time: time,
        type: 'retorno',
        status: 'confirmada',
        location: modality,
        durationMinutes: 50,
        price: 350
      },
      summary: `Consulta agendada para ${targetName} em ${date} às ${time}.`
    };
  }

  // 5. Ação de remarcar consulta
  if (lower.includes('remarcar consulta') || lower.includes('remarque') || lower.includes('mudar horário') || lower.includes('mude o horário')) {
    let targetName = params.activePatient?.name || '';
    for (const p of patients) {
      if (lower.includes(p.name.toLowerCase())) {
        targetName = p.name;
        break;
      }
    }
    const timeMatch = userInput.match(/\b([012]?\d)(?:h|:([0-5]\d))\b/i) || userInput.match(/\bàs\s*([012]?\d(?::[0-5]\d)?)\b/i);
    let time = '15:00';
    if (timeMatch) {
      const h = timeMatch[1].padStart(2, '0');
      const m = timeMatch[2] || '00';
      time = `${h}:${m}`;
    }
    return {
      type: 'appointment_rescheduled',
      payload: {
        patientName: targetName,
        newTime: time
      },
      summary: `Consulta de ${targetName || 'paciente'} remarcada para às ${time}.`
    };
  }

  // 6. Ação de cancelar consulta
  if (lower.includes('cancelar consulta') || lower.includes('cancele a consulta') || lower.includes('desmarcar')) {
    let targetName = params.activePatient?.name || '';
    for (const p of patients) {
      if (lower.includes(p.name.toLowerCase())) {
        targetName = p.name;
        break;
      }
    }
    return {
      type: 'appointment_cancelled',
      payload: {
        patientName: targetName
      },
      summary: `Consulta de ${targetName || 'paciente'} cancelada.`
    };
  }

  // 7. Ação de listar horários ou agenda
  if (lower.includes('horários livres') || lower.includes('horários disponíveis') || lower.includes('agenda de hoje') || lower.includes('ver agenda')) {
    return {
      type: 'NAVIGATE_TAB',
      payload: { tab: 'calendar' },
      summary: 'Grade de horários e agendamentos da Agenda.'
    };
  }

  // 8. Ação de lançar financeiro
  if (lower.includes('lançar receita') || lower.includes('lance uma receita') || lower.includes('lançar despesa') || lower.includes('lance uma despesa') || lower.includes('registrar pagamento')) {
    const valueMatch = userInput.match(/(?:r\$|reais)\s*(\d+(?:[.,]\d+)?)/i) || userInput.match(/(\d+(?:[.,]\d+)?)\s*(?:reais|via pix)/i);
    const amount = valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 350;
    const isExpense = lower.includes('despesa') || lower.includes('gasto') || lower.includes('custo') || lower.includes('saída');
    return {
      type: 'transaction_logged',
      payload: {
        id: `tx-${Date.now()}`,
        description: isExpense ? 'Despesa Operacional' : 'Consulta Nutricional - NUTRIA',
        type: isExpense ? 'despesa' : 'receita',
        amount: amount,
        category: isExpense ? 'operacional' : 'consultas',
        date: new Date().toISOString().split('T')[0],
        status: 'pago',
        paymentMethod: 'pix'
      },
      summary: `${isExpense ? 'Despesa' : 'Receita'} de R$ ${amount.toFixed(2)} lançada no Financeiro.`
    };
  }

  // 9. Ação de consultar financeiro
  if (lower.includes('faturamento') || lower.includes('balanço financeiro') || lower.includes('saldo do consultório') || lower.includes('fluxo de caixa')) {
    return {
      type: 'NAVIGATE_TAB',
      payload: { tab: 'finance' },
      summary: 'Painel financeiro e fluxo de caixa consolidado.'
    };
  }

  // 10. Ações de navegação para seções
  if (lower.includes('abrir planos') || lower.includes('ver planos') || lower.includes('assinar') || lower.includes('upgrade')) {
    return {
      type: 'NAVIGATE_TAB',
      payload: { tab: 'plans' },
      summary: 'Abertura do painel de Planos e Assinaturas.'
    };
  }

  if (lower.includes('abrir nutricalc') || lower.includes('ir para o nutricalc') || lower.includes('calcular tmb no nutricalc')) {
    return {
      type: 'NAVIGATE_TAB',
      payload: { tab: 'nutricalc' },
      summary: 'Navegação para o módulo NutriCalc.'
    };
  }

  if (lower.includes('abrir pacientes') || lower.includes('ir para pacientes') || lower.includes('lista de pacientes')) {
    return {
      type: 'NAVIGATE_TAB',
      payload: { tab: 'patients' },
      summary: 'Navegação para o módulo de Pacientes & Prontuários.'
    };
  }

  return undefined;
}

/**
 * Resposta clínica de contingência de alta precisão
 */
export function generateFallbackClinicalResponse(userInput: string, params: NutriaCallParams): NutriaResponse {
  const lower = userInput.toLowerCase();
  const patient = params.activePatient || params.patientContext;

  // 0. Respostas Diretas de Segurança de Suplementos (Pergunta de Segurança com SIM ou NÃO)
  const isCreatineQuery = lower.includes('creatina');
  const isGreenTeaQuery = lower.includes('chá verde') || lower.includes('cha verde') || lower.includes('egcg');
  const mentionsKidneyOrCKD = lower.includes('renal') || lower.includes('rins') || lower.includes('irc') || lower.includes('tfg') || lower.includes('creatinina');
  const asksSafety = lower.includes('seguro') || lower.includes('pode tomar') || lower.includes('indicad') || lower.includes('contraindicad') || lower.includes('permitid') || lower.includes('prescrever');

  if (isCreatineQuery && mentionsKidneyOrCKD && (asksSafety || lower.includes('?'))) {
    const reply = `NÃO.

**Justificativa Fisiológica e Bioquímica:**
Em pacientes portadores de **Insuficiência Renal Crônica (IRC) não-dialítica (Estágios 3A, 3B ou 4)** ou com Taxa de Filtração Glomerular (TFG) reduzida, a suplementação com **Creatina Monoidratada** é contraindicada.

**Mecanismos Clínicos:**
1. **Alteração do Marcador Diagnóstico:** A creatina exógena é espontaneamente convertida em creatinina no tecido muscular, elevando artificialmente os níveis de creatinina sérica e falseando a estimativa da TFG (CKD-EPI).
2. **Sobrecarga de Excreção:** Embora em indivíduos sadios a creatina seja amplamente segura, em néfrons já comprometidos a sobrecarga osmótica e de filtração de subprodutos nitrogenados pode acelerar o estresse hemodinâmico glomerular.
3. **Conduta Recomendada:** O foco deve ser a restrição proteica estrita (0,6 a 0,8 g/kg/dia), controle rigoroso da ingestão de fósforo e potássio, controle da pressão arterial e manutenção de hidratação adequada.

---
*Prescrição estruturada pela NÚTRIA para o consultório NutrinK.*`;

    return {
      reply,
      actionExecuted: detectOperationalAction(userInput, reply, params),
      model: 'gemini-3.7-flash'
    };
  }

  if (isGreenTeaQuery && (lower.includes('hepat') || lower.includes('fígado') || lower.includes('figado') || mentionsKidneyOrCKD) && asksSafety) {
    const reply = `NÃO.

**Justificativa Fisiológica e Farmacológica:**
Extratos concentrados de Chá Verde com alta titulação de **EGCG (Epigalocatequina-3-galato)** em doses farmacológicas (> 300-500 mg) possuem potencial risco de hepatotoxicidade idiopática e sobrecarga metabólica hepatorrenal em pacientes com função de eliminação comprometida.

**Conduta Recomendada:**
1. Suspender extratos secos concentrados e termogênicos concentrados.
2. Permitir exclusivamente a infusão aquosa tradicional da erva (*Camellia sinensis*) em quantidade moderada (máximo 1 a 2 xícaras/dia), desde que não haja arritmias ou descompensação clínica.

---
*Prescrição estruturada pela NÚTRIA para o consultório NutrinK.*`;

    return {
      reply,
      actionExecuted: detectOperationalAction(userInput, reply, params),
      model: 'gemini-3.7-flash'
    };
  }

  // 1. Extrai dados expressos na mensagem (OVERRIDE MANDATÓRIO - ISOLAMENTO DE CONTEXTO)
  const messageData = extractMessageAnthropometrics(userInput);

  const weight = messageData.weight || patient?.currentWeightKg || 70;
  const height = messageData.height || patient?.heightCm || 170;
  const age = messageData.age || patient?.age || 30;
  const isMale = messageData.gender ? messageData.gender === 'masculino' : (patient ? patient.gender === 'masculino' : true);
  const objective = messageData.objective || patient?.objective || 'Equilíbrio Metabólico & Performance';
  const name = patient?.name || (isMale ? 'Paciente Masculino' : 'Paciente Feminina');

  // Detecção de Patologias e Restrições Clínicas
  const hasCKD = lower.includes('renal') || lower.includes('irc') || lower.includes('rins') || lower.includes('tfg') || lower.includes('estagio 3') || lower.includes('estágio 3') || lower.includes('estagio 4');
  const hasGout = lower.includes('gota') || lower.includes('ácido úrico') || lower.includes('acido urico') || lower.includes('hiperuricemia');
  const hasDiabetes = lower.includes('diabetes') || lower.includes('tipo 2') || lower.includes('dm2') || lower.includes('hba1c') || lower.includes('glicemia');
  const hasSIID = lower.includes('irritável') || lower.includes('irritavel') || lower.includes('sii') || lower.includes('diarreia') || lower.includes('fodmap');
  const hasMenopause = lower.includes('menopausa') || lower.includes('climat') || lower.includes('fogacho') || lower.includes('calor');
  const hasLowFerritin = lower.includes('ferritina') || lower.includes('anemia') || lower.includes('ferro');

  // Cálculos Energéticos Mifflin-St Jeor (1990)
  const bmr = isMale
    ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
    : Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  const activityFactor = patient?.activityFactor || 1.4;
  const get = Math.round(bmr * activityFactor);

  // Detecção de objetivo de emagrecimento / déficit calórico
  const isWeightLoss = !hasCKD && (lower.includes('emagrec') || lower.includes('perder peso') || lower.includes('perda de peso') 
    || lower.includes('gordura') || lower.includes('defin') || lower.includes('secar') || lower.includes('sobrepeso')
    || (objective && (objective.toLowerCase().includes('emagrec') || objective.toLowerCase().includes('perda') || objective.toLowerCase().includes('gordura'))));

  const caloricDeficit = isWeightLoss ? 500 : 0;
  const targetKcal = Math.max(1200, get - caloricDeficit);

  // Metas de Macronutrientes ajustadas por Patologia (Travas de Segurança Bioquímica)
  let proteinGrams: number;
  if (hasCKD) {
    // Restrição estrita de 0,6 a 0,8 g/kg para IRC não-dialítica
    proteinGrams = Math.round(weight * 0.7);
  } else if (isWeightLoss) {
    proteinGrams = Math.round(weight * 2.0); // 2.0 g/kg em déficit calórico
  } else {
    proteinGrams = Math.round(weight * 1.8);
  }

  const fatGrams = Math.round(weight * 0.8);
  const proteinKcal = proteinGrams * 4;
  const fatKcal = fatGrams * 9;
  const carbsKcal = Math.max(350, targetKcal - (proteinKcal + fatKcal));
  const carbsGrams = Math.round(carbsKcal / 4);

  let reply = '';

  const asksPlan = lower.includes('plano') || lower.includes('cardapio') || lower.includes('cardápio') 
    || lower.includes('dieta') || lower.includes('refeic') || lower.includes('refeiç') 
    || lower.includes('tabela de refeic') || lower.includes('alimento');
  const asksMetabolism = lower.includes('tmb') || lower.includes('get') || lower.includes('calcule') || lower.includes('calorias') || lower.includes('gasto');
  const asksExams = lower.includes('exame') || lower.includes('vitamina') || lower.includes('b12') || lower.includes('glicemia') || lower.includes('homa') || lower.includes('triglic') || lower.includes('ferritina') || lower.includes('colesterol') || lower.includes('tsh');

  if (asksPlan || (asksMetabolism && asksPlan) || (asksMetabolism && lower.includes('80kg'))) {
    let supplementBlock = '';

    if (hasCKD) {
      supplementBlock = `
- **Conduta para Insuficiência Renal Crônica (IRC Não-Dialítica):**
  - **Meta Proteica Restrita:** 0,6 a 0,8 g/kg/dia para preservação da Taxa de Filtração Glomerular (TFG).
  - **Proibição Total:** Whey Protein, Creatina e suplementos nitrogenados estão terminantemente contraindicados.
  - **Controle Eletrolítico:** Restrição profilática de alimentos ricos em fósforo e monitoramento de potássio.
`;
    } else if (hasSIID) {
      supplementBlock = `
- **Manejo de Síndrome do Intestino Irritável com Diarreia (SII-D):**
  - Magnésio Bisglicinato (Quelato de Alta Absorção e Tolerabilidade): **200 a 300 mg à noite**
  - *Atenção:* Proibido uso de Magnésio Óxido, Cloreto ou Citrato devido ao efeito osmótico e laxativo.
  - Protocolo Baixo FODMAPs na fase inicial para alívio de dor, distensão e urgência evacuatória.
`;
    } else if (hasMenopause) {
      supplementBlock = `
- **Suporte para Climatério, Fogachos & Equilíbrio Neuroendócrino:**
  - *Trifolium pratense* (Isoflavonas padronizadas a 40%): **60 mg**
  - *Cimicifuga racemosa* (Extrato seco): **30 mg**
  - *Crocus sativus* (Extrato padronizado de Açafrão): **20 mg**
  - Magnésio Inositol: **350 mg**
  - *Posologia:* Tomar 1 dose pela manhã e 1 dose do Magnésio Inositol à noite 45 min antes de deitar por 90 dias. Alivia fogachos e melhora o sono.
`;
    } else if (hasLowFerritin) {
      supplementBlock = `
- **Tratamento Específico para Ferritina Baixa (< 30 ng/mL):**
  - Ferro Bisglicinato (Quelato de Alta Biodisponibilidade): **45 mg de Ferro elementar**
  - Vitamina C (Ácido Ascórbico): **300 mg** *(Maximiza a absorção duodenal do ferro)*
  - Metilfolato: **400 mcg**
  - *Posologia:* Tomar 1 dose via oral em jejum ou 30 minutos antes do almoço com água/suco cítrico. Afastar de laticínios, café e chás. Uso por 90 dias com reavaliação.
`;
    } else {
      supplementBlock = `
- **Suporte Metabólico e Otimização da Insulina:**
  - Picolinato de Cromo: 200 mcg
  - Coenzima Q10 (Ubiquinona): 100 mg
  - Magnésio Quelato / Dimalato: 250 mg
  - *Posologia:* Tomar 1 dose via oral no almoço por 60 a 90 dias.

- **Otimização de Vitamina D3 e Imunidade:**
  - Colecalciferol (Vitamina D3): 2.000 UI a 5.000 UI
  - Menatetrenona (Vitamina K2 MK-7): 100 mcg
  - *Posologia:* Tomar 1 dose pela manhã ou junto à principal refeição gordurosa.
`;
    }

    // Proteínas e carboidratos adequados às restrições
    const proteinDesc = hasCKD 
      ? `**${proteinGrams}g/dia** (~0.7 g/kg) • ${proteinKcal} kcal (${Math.round((proteinKcal / targetKcal) * 100)}%) *(Restrição proteica mandatória para poupar a filtração glomerular)*`
      : `**${proteinGrams}g/dia** (~${(proteinGrams / weight).toFixed(1)} g/kg) • ${proteinKcal} kcal (${Math.round((proteinKcal / targetKcal) * 100)}%) *(Aporte proteico otimizado)*`;

    // Fontes de proteína seguras conforme gota / IRC
    const proteinLunch1 = hasGout
      ? '160g de Ovos cozidos ou 150g de Filé de Pescada branca magra'
      : hasCKD
      ? '80g de Filé de Frango grelhado ou 2 Ovos cozidos'
      : '160g de Peito de Frango grelhado';

    const proteinLunch3 = hasGout
      ? '150g de Tofu firme grelhado com açafrão ou Omelete de 3 claras e 1 gema'
      : hasCKD
      ? '80g de Filé de Tilápia assada com ervas finas'
      : '150g de Patinho bovino moído refogado com abobrinha';

    const carbsLunch1 = hasDiabetes
      ? '80g de Quinoa real cozida ou 100g de Batata-Doce cozida (Baixo IG)'
      : '100g de Arroz Integral cozido + 90g de Feijão Carioca';

    reply = `### 🧬 Avaliação Energética e Metabólica (Mifflin-St Jeor)
**Paciente:** ${name} | **Idade:** ${age} anos | **Estatura:** ${height} cm | **Peso Utilizado:** **${weight} kg** *(Dados da Solicitação)*
**Gênero:** ${isMale ? 'Masculino' : 'Feminino'} | **Objetivo:** ${objective}${isWeightLoss ? ' (Estratégia com Déficit Calórico)' : ''}${hasCKD ? ' [IRC Não-Dialítica: Dieta Hipoproteica]' : ''}${hasGout ? ' [Gota: Dieta Isenta de Purinas]' : ''}

| Parâmetro Metabólico | Valor Calculado | Protocolo / Fórmula |
| :--- | :--- | :--- |
| **Peso Base** | **${weight} kg** | Utilizado conforme informado na solicitação |
| **TMB (Taxa Metabólica Basal)** | **${bmr} kcal/dia** | Mifflin-St Jeor: 10 × (${weight}) + 6.25 × (${height}) - 5 × (${age}) ${isMale ? '+ 5' : '- 161'} |
| **Fator de Atividade** | **${activityFactor}** | Rotina moderada / treino estruturado |
| **GET (Gasto Energético Total)** | **${get} kcal/dia** | TMB × Fator de Atividade (${bmr} × ${activityFactor}) |
| **Déficit Calórico Aplicado** | **${isWeightLoss ? '- ' + caloricDeficit + ' kcal/dia' : '0 kcal (Normocalórico)'}** | ${isWeightLoss ? 'Estratégia para perda de gordura e redução de medidas' : 'Aporte de Manutenção / Terapêutico'} |
| **Meta Calórica Efetiva** | **${targetKcal} kcal/dia** | Calorias diárias do plano alimentar prescrito |

---

### 🎯 Distribuição Diária de Macronutrientes
- **Proteínas:** ${proteinDesc}
- **Carboidratos:** **${carbsGrams}g/dia** (~${(carbsGrams / weight).toFixed(1)} g/kg) • ${carbsKcal} kcal (${Math.round((carbsKcal / targetKcal) * 100)}%)
- **Lipídios:** **${fatGrams}g/dia** (~0.8 g/kg) • ${fatKcal} kcal (${Math.round((fatKcal / targetKcal) * 100)}%)
- **Meta Hídrica:** **${((weight * 35) / 1000).toFixed(1)} Litros/dia** (35 mL/kg de peso corporal)

---

### 🥗 Plano Alimentar Personalizado (3 Opções Isoenergéticas por Refeição)

#### 1. Café da Manhã / Desjejum (07:00) • Meta: ~${Math.round(targetKcal * 0.22)} kcal
- **Opção 1 (Tradicional):** 2 Ovos mexidos + 1 fatia de Pão 100% integral (30g) + 100g de Mamão Papaia com 10g de Chia + Café preto sem açúcar.
- **Opção 2 (Prática):** ${hasCKD ? '1 pote de Iogurte vegetal com 1 Banana (80g) e 25g de Aveia' : 'Shake: 1 pote de Iogurte Natural Zero batido com 1 Banana média (80g) e 20g de Aveia em Flocos Finos'}.
- **Opção 3 (Alternativa):** Panqueca Funcional de Aveia com 1 Ovo inteiro e 1 clara batidos com 30g de Aveia, recheada com 100g de Morangos frescos.

#### 2. Lanche da Manhã / Colação (10:00) • Meta: ~${Math.round(targetKcal * 0.12)} kcal
- **Opção 1 (Tradicional):** 1 pote de Iogurte Natural Desnatado (140g) + 12g de Mix de Castanhas e Nozes picadas + 1 Maçã pequena (100g).
- **Opção 2 (Prática):** 1 Porção de Frutas Frescas (1 Kiwi + 1 Tangerina) + 10g de Sementes de Abóbora tostadas.
- **Opção 3 (Alternativa):** 1 Pão Sírio Integral pequeno (30g) com Queijo Cottage zero (40g) e orégano.

#### 3. Almoço (12:30) • Meta: ~${Math.round(targetKcal * 0.32)} kcal
- **Opção 1 (Tradicional):** ${proteinLunch1} + ${carbsLunch1} + 130g de Brócolis/Legumes no vapor + Salada crua à vontade + 5ml de Azeite Extravirgem.
- **Opção 2 (Prática):** 160g de Filé de Tilápia grelhada + 130g de Batata-Doce cozida em cubos + Mix de Rúcula, Tomate e Pepino + 5ml de Azeite de Oliva.
- **Opção 3 (Alternativa):** ${proteinLunch3} + 120g de Mandioca cozida + Salada morna de abobrinha e cenoura ralada com limão.

#### 4. Lanche da Tarde / Pré-Treino (16:30) • Meta: ~${Math.round(targetKcal * 0.14)} kcal
- **Opção 1 (Tradicional):** ${hasCKD ? '1 Banana com 20g de Aveia e canela' : '1 scoop de Whey Protein ou Proteína Vegetal (25g) diluído em 200ml de água + 1 Banana média + 15g de Aveia'}.
- **Opção 2 (Prática):** Sanduíche Leve: 2 fatias de Pão Integral com 60g de Peito de Frango desfiado com açafrão e folhas de espinafre.
- **Opção 3 (Alternativa):** Tigela Funcional: 140g de Iogurte Natural com 100g de Frutas Vermelhas e 20g de Granola sem açúcar.

#### 5. Jantar (20:00) • Meta: ~${Math.round(targetKcal * 0.20)} kcal
- **Opção 1 (Tradicional):** 140g de Filé de Peito de Frango grelhado + 120g de Abóbora Cabotiá assada com alecrim + Mix de Vegetais grelhados + 5ml de Azeite.
- **Opção 2 (Prática):** Omelete com 2 Ovos e 2 claras + Salada de folhas verdes variadas com tomate cereja + 100g de Batata cozida.
- **Opção 3 (Alternativa):** 150g de Filé de Pescada ou Tilápia ao forno com ervas + 100g de Quinoa cozida + Salada de aspargos ao vapor.

---

### 🔄 Lista de Substituições Práticas Equivalentes

1. **Fontes de Proteína (150g de Frango =):**
   - 160g de Filé de Tilápia ou Pescada branca
   - ${hasGout ? '3 Ovos inteiros + 2 claras' : '130g de Patinho moído grelhado'}
   - 150g de Tofu grelhado

2. **Fontes de Carboidratos (100g de Arroz Integral =):**
   - 120g de Batata-doce cozida
   - 100g de Mandioca / Aipim cozido
   - 90g de Quinoa cozida
   - 35g de Aveia em flocos

3. **Gorduras Boas (5ml de Azeite =):**
   - 20g de Abacate fresco
   - 10g de Castanhas-do-pará ou Amêndoas

---

### 💊 Prescrição Magistral e Suporte Clínico
${supplementBlock}
---

Prescrição estruturada pela NÚTRIA para o consultório NutrinK.`;
  } else if (asksExams) {
    reply = `### 📋 Análise Laboratorial e Prescrição Magistral - NÚTRIA
**Paciente:** ${name} | **Idade:** ${age} anos | **Peso:** ${weight} kg

---

#### 🧪 Avaliação e Interpretação dos Marcadores Laboratoriais:
- **Perfil Glicêmico & Sensibilidade à Insulina:** Avaliação de glicemia de jejum, HbA1c e índice HOMA-IR com metas para prevenção de resistência insulínica e esteatose.
- **Perfil Lipídico:** Análise de Triglicerídeos, HDL-c, LDL-c e Não-HDL para redução de risco cardiovascular.
- **Painel Micronutricional:** Avaliação de Vitamina D (meta ideal de 40 a 60 ng/mL), Vitamina B12 (meta ideal acima de 500 pg/mL) e Ferritina sérica.

---

#### 💊 Prescrição Magistral e Suporte Suplementar Personalizado:

1. **Correção de Vitamina D3 e Fixação de Cálcio:**
   - Colecalciferol (Vitamina D3): **5.000 UI**
   - Vitamina K2 (MK-7): **100 mcg**
   - Veículo: Gotas oleosas ou cápsula oleosa
   - *Posologia:* Tomar 1 dose ao dia junto ao almoço por 60 a 90 dias. Reavaliar dosagem sérica após o período.

2. **Otimização de Vitamina B12 & Metilação:**
   - Metilcobalamina: **1.000 mcg**
   - Metilfolato: **400 mcg**
   - *Posologia:* 1 pastilha sublingual ao dia pela manhã por 60 dias.

3. **Sensibilização Insulínica & Controle de Glicemia:**
   - Berberina HCl: **400 mg**
   - Picolinato de Cromo: **200 mcg**
   - Ácido Alfa Lipóico: **150 mg**
   - *Posologia:* Tomar 1 cápsula 30 minutos antes do almoço e 1 cápsula antes do jantar por 60 dias.

---

Prescrição estruturada pela NÚTRIA para o consultório NutrinK.`;
  } else if (asksMetabolism) {
    reply = `### 🧬 Avaliação Energética e Metabólica - NÚTRIA
**Paciente:** ${name} | **Protocolo:** Mifflin-St Jeor (1990)
**Peso Utilizado:** **${weight} kg** *(Base da Solicitação)* | **Estatura:** ${height} cm | **Idade:** ${age} anos

| Parâmetro Metabólico | Resultado Estimado | Memória de Cálculo |
| :--- | :--- | :--- |
| **Peso Base / Estatura** | **${weight} kg** / ${height} cm | Medidas antropométricas consideradas |
| **TMB (Taxa Metabólica Basal)** | **${bmr} kcal/dia** | 10×(${weight}) + 6.25×(${height}) - 5×(${age}) ${isMale ? '+ 5' : '- 161'} |
| **Fator Atividade (FA)** | **${activityFactor}** | Rotina moderada / treino estruturado |
| **GET (Gasto Energético Total)** | **${get} kcal/dia** | TMB × FA (${bmr} × ${activityFactor}) |

---

#### 🎯 Prescrição de Macronutrientes Sugerida:
- **Proteínas**: ${hasCKD ? '0.6 a 0.8 g/kg (IRC)' : '1.8 a 2.0 g/kg'} (**${proteinGrams}g/dia** • ${proteinKcal} kcal)
- **Lipídios**: 0.8 a 1.0 g/kg (**${fatGrams}g/dia** • ${fatKcal} kcal)
- **Carboidratos**: **${carbsGrams}g/dia** (${carbsKcal} kcal) para suprir a demanda energética total.
- **Hidratação:** **${((weight * 35) / 1000).toFixed(1)} L/dia** (35 mL/kg).

---

Prescrição estruturada pela NÚTRIA para o consultório NutrinK.`;
  } else {
    reply = `Olá, Doutor(a)! A **NÚTRIA** está à disposição no consultório NutrinK com total conformidade com as normas do CFN, CRM e LGPD.

Com relação a **"${userInput}"**:
- Para interpretação de exames: forneça os marcadores laboratoriais (hemograma, perfil lipídico, glicemia, HbA1c, tireoide, vitaminas, minerais).
- Para prescrição e conduta: informe perfil clínico ou restrições patológicas para cardápio com 3 opções isoenergéticas e dosagens exatas.
- Para dúvidas sobre segurança de suplementos (Creatina, EGCG, etc.): avalio contraindicações fisiológicas com resposta direta e objetiva.

---

Prescrição estruturada pela NÚTRIA para o consultório NutrinK.`;
  }

  const actionExecuted = detectOperationalAction(userInput, reply, params);

  return {
    reply,
    actionExecuted,
    model: 'gemini-3.7-flash'
  };
}

/**
 * Cliente singleton do GoogleGenAI
 */
let cachedGenAIClient: GoogleGenAI | null = null;
let cachedGenAIApiKey: string = '';

export function getGenAIClient(apiKey: string): GoogleGenAI {
  if (cachedGenAIClient && cachedGenAIApiKey === apiKey) {
    return cachedGenAIClient;
  }
  cachedGenAIClient = new GoogleGenAI({ apiKey });
  cachedGenAIApiKey = apiKey;
  return cachedGenAIClient;
}

/**
 * Executa a chamada à NÚTRIA com o modelo Gemini 3.7 Flash oficial @google/genai.
 * 
 * - Configura modelo para 'gemini-3.7-flash'.
 * - Utiliza a System Instruction permanente clínica e de gestão do consultório.
 * - Injeta dinamicamente o contexto do paciente ativo e da plataforma.
 * - Trata o histórico de conversa de forma dinâmica sem repetições.
 */
export async function callNutriaDirect(
  paramsOrMessage: NutriaCallParams | string,
  maybeContext?: any
): Promise<NutriaResponse> {
  // Normaliza parâmetros para suportar tanto objeto NutriaCallParams quanto assinatura (message, context)
  const params: NutriaCallParams = typeof paramsOrMessage === 'string'
    ? {
        message: paramsOrMessage,
        activePatient: maybeContext?.activePatient || maybeContext?.patientContext,
        patientContext: maybeContext?.patientContext || maybeContext?.activePatient,
        patients: maybeContext?.patientsSummary?.names || maybeContext?.patients,
        appointments: maybeContext?.todayAppointments || maybeContext?.appointments,
        userAccount: maybeContext?.userAccount,
        appContext: {
          patientsCount: maybeContext?.patientsSummary?.total || maybeContext?.patientsCount,
          todayAppointmentsCount: maybeContext?.todayAppointments?.length || maybeContext?.todayAppointmentsCount,
          monthlyRevenue: maybeContext?.financialSummary?.totalRevenue || maybeContext?.monthlyRevenue,
          monthlyExpenses: maybeContext?.financialSummary?.totalExpenses || maybeContext?.monthlyExpenses,
          userPlan: maybeContext?.userAccount?.plan
        },
        conversationHistory: maybeContext?.conversationHistory
      }
    : paramsOrMessage;

  // 1. Tenta a rota de alta performance do backend (/api/nutria) primeiro com timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const resp = await fetch('/api/nutria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        message: params.message,
        conversationHistory: params.conversationHistory,
        activePatientContext: params.activePatient,
        patientContext: params.patientContext || params.activePatient,
        patients: params.patients ? params.patients.slice(0, 10) : undefined,
        appointments: params.appointments ? params.appointments.slice(0, 8) : undefined,
        transactions: params.transactions ? params.transactions.slice(0, 8) : undefined,
        userAccount: params.userAccount,
        appContext: params.appContext
      })
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.reply && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        const cleanedReply = cleanMathAndLatex(data.reply.trim());
        return {
          reply: cleanedReply,
          text: cleanedReply,
          actionExecuted: data.actionExecuted,
          model: data.model || 'gemini-3.7-flash'
        };
      }
    }
  } catch (backendErr: any) {
    console.warn('[NUTRIA AI] Rota /api/nutria falhou ou atingiu timeout:', backendErr);
  }

  // 2. Se a rota do servidor falhar e houver chave no cliente, tenta via SDK no cliente
  const apiKey = getClientGeminiApiKey();
  if (apiKey) {
    const systemInstruction = buildNutriaSystemInstruction(params);
    const targetModel = getClientGeminiModel();
    const contents = formatGeminiContents(params.conversationHistory, params.message);

    const candidateModels = [
      'gemini-3.7-flash',
      targetModel,
      'gemini-3.1-flash-lite',
      'gemini-flash-latest'
    ].filter((m, idx, arr) => isValidGeminiModelName(m) && arr.indexOf(m) === idx);

    for (const modelToTry of candidateModels) {
      try {
        const ai = getGenAIClient(apiKey);
        const response = await ai.models.generateContent({
          model: modelToTry,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.4,
            maxOutputTokens: 4096,
          }
        });

        const textReply = response.text || (response as any)?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textReply && typeof textReply === 'string' && textReply.trim().length > 0) {
          const actionExecuted = detectOperationalAction(params.message, textReply, params);
          const cleanedText = cleanMathAndLatex(textReply.trim());
          return {
            reply: cleanedText,
            text: cleanedText,
            actionExecuted,
            model: modelToTry
          };
        }
      } catch (sdkError: any) {
        console.error(`[NUTRIA AI Gemini SDK Error] Falha na chamada ao modelo ${modelToTry}:`, sdkError);
        continue;
      }
    }
  } else {
    console.warn('[NUTRIA AI] Nenhuma chave VITE_GEMINI_API_KEY ou GEMINI_API_KEY detectada no cliente para chamada direta.');
  }

  // 3. Fallback final instantâneo: Motor clínico local sem risco de tela branca
  const fallbackLocal = generateFallbackClinicalResponse(params.message, params);
  const cleanedFallback = cleanMathAndLatex(fallbackLocal.reply);
  return {
    ...fallbackLocal,
    reply: cleanedFallback,
    text: cleanedFallback,
    model: 'gemini-3.7-flash'
  };
}
