import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Flame, 
  Scale, 
  Activity, 
  BookOpen, 
  Search, 
  Bot, 
  Check, 
  Layers, 
  Apple,
  RotateCcw,
  UserCheck,
  Users,
  Save,
  ChevronDown,
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Copy
} from 'lucide-react';
import { Gender, ClinicalProtocol, Patient, PatientObjective, UserAccount, PatientTimelineItem } from '../types';
import { 
  calculateMetabolicRates, 
  calculatePollock3Folds, 
  calculateIdealWeight,
  calculateAdjustedWeight,
  normalizeHeightToCm, 
  normalizeHeightToMeters 
} from '../utils/nutritionCalculations';
import { CLINICAL_PROTOCOLS, INITIAL_FOOD_DATABASE } from '../data/initialData';
import { saveDietOrCalc, savePatient, DietAndCalcRecord } from '../services/databaseService';

interface NutriCalcViewProps {
  patients?: Patient[];
  selectedPatientId?: string | null;
  onSelectPatient?: (patientId: string | null) => void;
  onUpdatePatient?: (updatedPatient: Patient) => void;
  userAccount?: UserAccount | null;
  onOpenNutriaWithPrompt: (prompt: string) => void;
}

export const NutriCalcView: React.FC<NutriCalcViewProps> = ({ 
  patients = [],
  selectedPatientId = null,
  onSelectPatient,
  onUpdatePatient,
  userAccount,
  onOpenNutriaWithPrompt 
}) => {
  const [calcSubTab, setCalcSubTab] = useState<'tmb_get' | 'pollock' | 'protocolos' | 'tabela_alimentos'>('tmb_get');

  // Paciente Ativo no Contexto do NutriCalc
  const [activePatientId, setActivePatientId] = useState<string | null>(selectedPatientId);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  // Sincronizar com prop externa caso mude
  useEffect(() => {
    if (selectedPatientId !== undefined) {
      setActivePatientId(selectedPatientId);
    }
  }, [selectedPatientId]);

  const activePatient = patients.find(p => p.id === activePatientId) || null;

  // TMB & GET Calculator State
  const [formula, setFormula] = useState<'mifflin' | 'harris_benedict' | 'cunningham' | 'dri'>('mifflin');
  const [gender, setGender] = useState<Gender>('masculino');
  const [weightInput, setWeightInput] = useState<string>('');
  const [heightInput, setHeightInput] = useState<string>('');
  const [ageInput, setAgeInput] = useState<string>('');
  const [bodyFatInput, setBodyFatInput] = useState<string>('');
  const [activityFactor, setActivityFactor] = useState<number>(1.2);
  const [customProteinGPerKg, setCustomProteinGPerKg] = useState<number>(2.0);

  // Pollock 3 folds state
  const [fold1Input, setFold1Input] = useState<string>('');
  const [fold2Input, setFold2Input] = useState<string>('');
  const [fold3Input, setFold3Input] = useState<string>('');

  // Protocol filter
  const [selectedProtocol, setSelectedProtocol] = useState<ClinicalProtocol>(CLINICAL_PROTOCOLS[0]);

  // Food search
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategory, setFoodCategory] = useState('Todas');

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // EFEITO: Pré-preenchimento Automático quando um Paciente é Selecionado
  useEffect(() => {
    if (activePatient) {
      // 1. Dados Básicos
      setWeightInput(activePatient.currentWeightKg > 0 ? String(activePatient.currentWeightKg) : '');
      setHeightInput(activePatient.heightCm > 0 ? String(activePatient.heightCm) : '');
      setAgeInput(activePatient.age > 0 ? String(activePatient.age) : '');
      setGender(activePatient.gender || 'masculino');
      setBodyFatInput(activePatient.bodyFatPercentage > 0 ? String(activePatient.bodyFatPercentage) : '');
      setActivityFactor(activePatient.activityFactor || 1.2);

      // 2. Dobras cutâneas do último registro antropométrico (se existirem)
      const latestAntro = activePatient.evolutionHistory?.[0];
      if (latestAntro) {
        if (activePatient.gender === 'masculino') {
          if (latestAntro.abdominalFoldMm) setFold2Input(String(latestAntro.abdominalFoldMm));
          if (latestAntro.thighCircumferenceCm) setFold3Input(String(latestAntro.thighCircumferenceCm));
        } else {
          if (latestAntro.tricepsFoldMm) setFold1Input(String(latestAntro.tricepsFoldMm));
          if (latestAntro.suprailiacFoldMm) setFold2Input(String(latestAntro.suprailiacFoldMm));
        }
      }

      // 3. Ajuste inteligente da meta proteica de acordo com o objetivo clínico
      if (activePatient.objective === 'hipertrofia') {
        setCustomProteinGPerKg(2.2);
      } else if (activePatient.objective === 'emagrecimento') {
        setCustomProteinGPerKg(2.0);
      } else if (activePatient.objective === 'performance_esportiva') {
        setCustomProteinGPerKg(2.2);
      } else if (activePatient.objective === 'manejo_diabetes') {
        setCustomProteinGPerKg(1.8);
      } else if (activePatient.objective === 'saude_longevidade') {
        setCustomProteinGPerKg(1.6);
      }

      // 4. Selecionar protocolo clínico pertinente ao objetivo
      const matchedProtocol = CLINICAL_PROTOCOLS.find(proto => {
        if (activePatient.objective === 'emagrecimento' && proto.id.includes('deficit')) return true;
        if (activePatient.objective === 'hipertrofia' && proto.id.includes('hipertrofia')) return true;
        if (activePatient.objective === 'manejo_diabetes' && proto.id.includes('low_carb')) return true;
        if (activePatient.objective === 'saude_intestinal' && proto.id.includes('fodmap')) return true;
        return false;
      });

      if (matchedProtocol) {
        setSelectedProtocol(matchedProtocol);
      }
    }
  }, [activePatientId, activePatient]);

  // Conversões e normalizações dinâmicas
  const weightKg = parseFloat(weightInput) || 0;
  const rawHeight = parseFloat(heightInput) || 0;
  const heightCm = normalizeHeightToCm(rawHeight);
  const heightM = normalizeHeightToMeters(rawHeight);
  const ageYears = parseInt(ageInput, 10) || 0;
  const bodyFat = parseFloat(bodyFatInput) || 0;

  const fold1 = parseFloat(fold1Input) || 0;
  const fold2 = parseFloat(fold2Input) || 0;
  const fold3 = parseFloat(fold3Input) || 0;

  // Compute Results Dinâmicos
  const metabolicResults = calculateMetabolicRates({
    formula,
    gender,
    weightKg,
    heightCm: rawHeight,
    ageYears,
    bodyFatPercentage: bodyFat,
    activityFactor
  });

  const pollockResults = calculatePollock3Folds(gender, ageYears, fold1, fold2, fold3);

  // Peso Ideal e Peso Ajustado para Obesidade (IMC >= 30)
  const idealWeight = calculateIdealWeight(rawHeight);
  const adjustedWeight = calculateAdjustedWeight(weightKg, rawHeight);
  const isObese = metabolicResults.bmi >= 30;

  // Custom Macro Calculations
  const effectiveWeightForProtein = (isObese && adjustedWeight > 0) ? adjustedWeight : weightKg;
  const calculatedProteinGrams = effectiveWeightForProtein > 0 ? Math.round(effectiveWeightForProtein * customProteinGPerKg) : 0;
  const proteinCalories = calculatedProteinGrams * 4;
  const fatCalories = metabolicResults.get > 0 ? Math.round(metabolicResults.get * 0.25) : 0;
  const fatGrams = Math.round(fatCalories / 9);
  const carbsCalories = metabolicResults.get > 0 ? Math.max(0, metabolicResults.get - proteinCalories - fatCalories) : 0;
  const carbsGrams = Math.round(carbsCalories / 4);

  const proteinPct = metabolicResults.get > 0 ? Math.min(100, Math.round((proteinCalories / metabolicResults.get) * 100)) : 0;
  const carbsPct = metabolicResults.get > 0 ? Math.min(100, Math.round((carbsCalories / metabolicResults.get) * 100)) : 0;
  const fatPct = metabolicResults.get > 0 ? 25 : 0;

  // Handler: Limpar Dados (Modo Avulso)
  const handleResetCalculations = () => {
    setWeightInput('');
    setHeightInput('');
    setAgeInput('');
    setBodyFatInput('');
    setActivityFactor(1.2);
    setFold1Input('');
    setFold2Input('');
    setFold3Input('');
    setCustomProteinGPerKg(2.0);
    setSaveFeedback(null);
  };

  // Handler: Trocar ou Desvincular Paciente
  const handleSelectPatientContext = (patientId: string | null) => {
    setActivePatientId(patientId);
    if (onSelectPatient) {
      onSelectPatient(patientId);
    }
    setIsPatientDropdownOpen(false);
    setSaveFeedback(null);
    if (!patientId) {
      handleResetCalculations();
    }
  };

  // Handler: Salvar Cálculo no Banco de Dados (Firestore) e no Prontuário do Paciente
  const handleSaveCalculation = async () => {
    if (metabolicResults.get === 0 && pollockResults.bodyFatPercentage === 0) {
      setSaveFeedback({
        type: 'error',
        message: 'Preencha os dados de peso, altura e idade antes de salvar o cálculo.'
      });
      return;
    }

    setIsSaving(true);
    setSaveFeedback(null);

    const userEmail = userAccount?.email || 'consultorio@nutrink.com.br';

    try {
      // 1. Salvar no histórico de cálculos (Coleção diets_and_calc)
      const calcRecord: DietAndCalcRecord = {
        id: `calc-${Date.now()}`,
        userEmail: userEmail,
        patientId: activePatient?.id || undefined,
        patientName: activePatient?.name || 'Cálculo Avulso',
        type: calcSubTab === 'pollock' ? 'pollock' : 'tmb_get',
        data: {
          formula,
          gender,
          weightKg,
          heightCm,
          heightM,
          ageYears,
          bodyFat: bodyFat || pollockResults.bodyFatPercentage,
          activityFactor,
          tmb: metabolicResults.tmb,
          get: metabolicResults.get,
          bmi: metabolicResults.bmi,
          bmiClassification: metabolicResults.bmiClassification,
          waterRecommendationLiters: metabolicResults.waterRecommendationLiters,
          customProteinGPerKg,
          proteinGrams: calculatedProteinGrams,
          carbsGrams,
          fatGrams,
          idealWeight,
          adjustedWeight,
          isObese,
          pollockResult: calcSubTab === 'pollock' ? pollockResults : undefined,
          savedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      };

      await saveDietOrCalc(calcRecord);

      // 2. Se houver paciente ativo vinculado, atualizar o prontuário no Firebase
      if (activePatient && onUpdatePatient) {
        const newTimelineEntry: PatientTimelineItem = {
          id: `tl-${Date.now()}`,
          date: new Date().toLocaleDateString('pt-BR'),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          type: 'antropometria',
          title: `Cálculo NutriCalc Salvo (GET: ${metabolicResults.get} kcal)`,
          description: `TMB: ${metabolicResults.tmb} kcal (${formula}) • GET: ${metabolicResults.get} kcal (NAF ${activityFactor}) • IMC: ${metabolicResults.bmi} • Meta Proteica: ${calculatedProteinGrams}g (${customProteinGPerKg} g/kg) • Água: ${metabolicResults.waterRecommendationLiters}L.`,
          badge: 'NutriCalc',
          categoryColor: 'text-fuchsia-400'
        };

        const updatedPatient: Patient = {
          ...activePatient,
          tmb: metabolicResults.tmb > 0 ? metabolicResults.tmb : activePatient.tmb,
          get: metabolicResults.get > 0 ? metabolicResults.get : activePatient.get,
          bmi: metabolicResults.bmi > 0 ? metabolicResults.bmi : activePatient.bmi,
          currentWeightKg: weightKg > 0 ? weightKg : activePatient.currentWeightKg,
          heightCm: heightCm > 0 ? heightCm : activePatient.heightCm,
          activityFactor: activityFactor || activePatient.activityFactor,
          bodyFatPercentage: bodyFat > 0 ? bodyFat : (pollockResults.bodyFatPercentage > 0 ? pollockResults.bodyFatPercentage : activePatient.bodyFatPercentage),
          timeline: [newTimelineEntry, ...(activePatient.timeline || [])]
        };

        // Salvar no Firebase Firestore
        await savePatient(updatedPatient, userEmail);
        onUpdatePatient(updatedPatient);
      }

      setIsSaving(false);
      setSaveFeedback({
        type: 'success',
        message: activePatient 
          ? `Cálculo metabólico salvo com sucesso no prontuário de ${activePatient.name}!` 
          : 'Cálculo avulso salvo com sucesso no histórico do seu consultório!'
      });

      // Limpar feedback após 5 segundos
      setTimeout(() => {
        setSaveFeedback(null);
      }, 5000);

    } catch (err) {
      console.error('Erro ao salvar cálculo:', err);
      setIsSaving(false);
      setSaveFeedback({
        type: 'error',
        message: 'Ocorreu um erro ao salvar o cálculo no banco de dados. Tente novamente.'
      });
    }
  };

  // Copiar Resumo dos Cálculos
  const handleCopySummary = () => {
    const summary = `=== RELATÓRIO NUTRICALC NUTRINK ===
${activePatient ? `Paciente: ${activePatient.name}` : 'Cálculo Avulso'}
Gênero: ${gender === 'masculino' ? 'Masculino' : 'Feminino'} | Idade: ${ageYears} anos
Peso Atual: ${weightKg} kg | Altura: ${heightCm} cm | IMC: ${metabolicResults.bmi} (${metabolicResults.bmiClassification})
TMB (Mifflin): ${metabolicResults.tmb} kcal/dia
GET (NAF ${activityFactor}): ${metabolicResults.get} kcal/dia
Necessidade Hídrica: ${metabolicResults.waterRecommendationLiters} Litros/dia
Distribuição de Macronutrientes:
- Proteínas: ${calculatedProteinGrams}g (${proteinCalories} kcal - ${proteinPct}%) - ${customProteinGPerKg} g/kg
- Carboidratos: ${carbsGrams}g (${carbsCalories} kcal - ${carbsPct}%)
- Gorduras: ${fatGrams}g (${fatCalories} kcal - ${fatPct}%)
${isObese ? `Obs Obesidade: Peso Ideal = ${idealWeight}kg | Peso Ajustado = ${adjustedWeight}kg` : ''}
Data: ${new Date().toLocaleDateString('pt-BR')}`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Filtered Food Table
  const filteredFoods = INITIAL_FOOD_DATABASE.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(foodSearch.toLowerCase());
    const matchesCat = foodCategory === 'Todas' || f.category === foodCategory;
    return matchesSearch && matchesCat;
  });

  const foodCategories = ['Todas', ...Array.from(new Set(INITIAL_FOOD_DATABASE.map(f => f.category)))];

  const filteredPatientsList = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    (p.cpf && p.cpf.includes(patientSearchTerm))
  );

  const formatObjective = (obj?: PatientObjective) => {
    switch (obj) {
      case 'emagrecimento': return 'Emagrecimento & Definição';
      case 'hipertrofia': return 'Hipertrofia Muscular';
      case 'performance_esportiva': return 'Performance Esportiva';
      case 'manejo_diabetes': return 'Manejo Glicêmico / Diabetes';
      case 'saude_intestinal': return 'Saúde Intestinal & Microbiota';
      case 'saude_longevidade': return 'Saúde & Longevidade';
      case 'reeducacao_alimentar': return 'Reeducação Alimentar';
      case 'vegetariano_vegano': return 'Plant-Based / Vegano';
      default: return 'Geral / Manutenção';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-fuchsia-400" />
            NutriCalc & Protocolos Clínicos
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            Calculadoras metabólicas, equações preditivas, composição corporal e diretrizes clínicas baseadas em evidências.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#220743] hover:bg-[#2d0959] text-purple-200 hover:text-white rounded-xl text-xs font-bold border border-purple-700/60 transition-all cursor-pointer"
            title="Copiar resumo do cálculo para área de transferência"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-fuchsia-400" />}
            <span>{copiedSummary ? 'Copiado!' : 'Copiar Resumo'}</span>
          </button>

          <button
            onClick={handleResetCalculations}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#220743] hover:bg-[#2d0959] text-purple-200 hover:text-white rounded-xl text-xs font-bold border border-purple-700/60 transition-all cursor-pointer"
            title="Zerar todos os campos para nova avaliação"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Dados</span>
          </button>

          <button
            onClick={handleSaveCalculation}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 border border-emerald-400/40 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
            id="btn-save-calculation"
          >
            <Save className="w-4 h-4 text-emerald-100" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Cálculo no Prontuário'}</span>
          </button>

          <button
            onClick={() => onOpenNutriaWithPrompt(`Nutria, faça uma revisão dietoterápica detalhada para ${activePatient ? `o paciente ${activePatient.name}` : 'um paciente'} ${gender}, ${ageYears > 0 ? `${ageYears} anos` : 'idade a definir'}, ${weightKg > 0 ? `${weightKg}kg` : 'peso a definir'}, ${heightCm > 0 ? `${heightCm}cm` : 'altura a definir'} com GET de ${metabolicResults.get > 0 ? `${metabolicResults.get} kcal` : 'a calcular'} e meta proteica de ${calculatedProteinGrams}g (${customProteinGPerKg} g/kg).`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/50 border border-fuchsia-400/40 transition-all hover:scale-105 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-fuchsia-200" />
            <span>Consultar NUTRIA</span>
          </button>
        </div>
      </div>

      {/* 1. SEÇÃO DE CONTEXTO DO PACIENTE & BUSCA RÁPIDA */}
      <div className="relative z-20">
        {activePatient ? (
          /* BADGE / BANNER DE PACIENTE ATIVO VINCULADO */
          <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/95 via-fuchsia-950/70 to-purple-950/95 border border-fuchsia-500/50 shadow-xl shadow-fuchsia-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-800 text-white flex items-center justify-center font-bold shadow-md shadow-purple-950/80 shrink-0 mt-0.5">
                <UserCheck className="w-6 h-6 text-fuchsia-200" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Dados importados automaticamente do paciente
                  </span>
                  <span className="text-[11px] font-semibold text-purple-200">
                    ID: {activePatient.id}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-black text-white">
                  {activePatient.name}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-purple-200">
                  <span><strong>Idade:</strong> {activePatient.age} anos</span>
                  <span>•</span>
                  <span><strong>Sexo:</strong> {activePatient.gender === 'masculino' ? 'Masculino' : 'Feminino'}</span>
                  <span>•</span>
                  <span><strong>Peso:</strong> {activePatient.currentWeightKg} kg</span>
                  <span>•</span>
                  <span><strong>Altura:</strong> {activePatient.heightCm} cm</span>
                  <span>•</span>
                  <span><strong>Objetivo:</strong> <span className="text-fuchsia-300 font-bold">{formatObjective(activePatient.objective)}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
                className="px-3.5 py-2 rounded-xl bg-[#220743] hover:bg-[#2d0959] border border-purple-700/60 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                id="btn-switch-patient"
              >
                <Users className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Trocar Paciente</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectPatientContext(null)}
                className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-rose-950/80 border border-purple-800/60 hover:border-rose-700/60 text-purple-300 hover:text-rose-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Desvincular paciente e calcular em modo avulso"
                id="btn-unlink-patient"
              >
                <X className="w-3.5 h-3.5" />
                <span>Modo Avulso</span>
              </button>
            </div>
          </div>
        ) : (
          /* MODO AVULSO: SELETOR RÁPIDO DE PACIENTE NO TOPO */
          <div className="p-4 rounded-3xl bg-[#150328] border border-purple-900/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-800/60 text-purple-300 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Modo Avulso (Cálculo Manual)</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-200 text-[10px] font-semibold">Sem paciente vinculado</span>
                </div>
                <p className="text-[11px] text-purple-300">
                  Preencha os campos livremente ou selecione um paciente cadastrado para auto-preencher os dados.
                </p>
              </div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-900/80 to-fuchsia-900/60 hover:from-purple-800 hover:to-fuchsia-800 border border-fuchsia-500/40 text-white text-xs font-bold flex items-center justify-between gap-2 shadow-md transition-all cursor-pointer"
                id="btn-open-patient-selector"
              >
                <Users className="w-4 h-4 text-fuchsia-400" />
                <span>Vincular Paciente Cadastrado</span>
                <ChevronDown className="w-3.5 h-3.5 text-purple-300 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* DROPDOWN FLUTUANTE DE SELEÇÃO RÁPIDA DE PACIENTE */}
        {isPatientDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#170530] border border-purple-700/80 rounded-3xl p-4 shadow-2xl shadow-purple-950/90 z-30 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-purple-800/50 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-fuchsia-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Selecionar Paciente para NutriCalc</span>
              </div>
              <button
                onClick={() => setIsPatientDropdownOpen(false)}
                className="text-purple-400 hover:text-white text-xs font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
                placeholder="Buscar por nome, e-mail ou CPF..."
                className="w-full bg-[#120326] border border-purple-700/60 focus:border-fuchsia-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-purple-400/50 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
              {filteredPatientsList.length === 0 ? (
                <div className="p-4 text-center text-xs text-purple-300">
                  Nenhum paciente encontrado com esse termo.
                </div>
              ) : (
                filteredPatientsList.map((p) => {
                  const isCurrent = p.id === activePatientId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPatientContext(p.id)}
                      className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-fuchsia-950/90 border border-fuchsia-500 text-white' 
                          : 'bg-[#120326]/60 hover:bg-[#20063d] border border-purple-800/40 text-purple-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-900/80 border border-purple-700/50 flex items-center justify-center text-xs font-bold text-fuchsia-300 shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{p.name}</div>
                          <div className="text-[10px] text-purple-300">
                            {p.age} anos • {p.currentWeightKg} kg • {p.heightCm} cm • {formatObjective(p.objective)}
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-md bg-fuchsia-600 text-white text-[10px] font-bold">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-[11px] text-purple-300 hover:text-fuchsia-300 font-semibold flex items-center gap-1">
                          Selecionar <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-purple-800/40 flex justify-between items-center text-xs">
              <span className="text-[11px] text-purple-300">
                {patients.length} paciente(s) cadastrados no consultório
              </span>
              <button
                type="button"
                onClick={() => handleSelectPatientContext(null)}
                className="text-[11px] text-purple-400 hover:text-rose-300 underline font-semibold"
              >
                Limpar seleção (Modo Avulso)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FEEDBACK TOAST / ALERT */}
      {saveFeedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn ${
          saveFeedback.type === 'success' 
            ? 'bg-emerald-950/90 border border-emerald-500/80 text-emerald-200' 
            : 'bg-rose-950/90 border border-rose-600/80 text-rose-200'
        }`}>
          <div className="flex items-center gap-2.5 text-xs font-bold">
            {saveFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{saveFeedback.message}</span>
          </div>
          <button 
            onClick={() => setSaveFeedback(null)}
            className="text-xs hover:opacity-80 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-1.5 flex space-x-1 overflow-x-auto scrollbar-none shadow-md">
        {[
          { id: 'tmb_get', label: 'TMB, GET & Macros', icon: Flame },
          { id: 'pollock', label: 'Pollock 3 Dobras (%BF)', icon: Scale },
          { id: 'protocolos', label: 'Protocolos NutrinK', icon: BookOpen },
          { id: 'tabela_alimentos', label: 'Tabela de Alimentos TACO', icon: Apple }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = calcSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCalcSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md'
                  : 'text-purple-200 hover:text-white hover:bg-[#220743]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtab 1: TMB, GET & Macronutrientes */}
      {calcSubTab === 'tmb_get' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-fuchsia-400" />
                Parâmetros Clínicos de Entrada
              </h3>
              {activePatient && (
                <span className="px-2 py-0.5 rounded-full bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-600/40 text-[10px] font-bold">
                  Sincronizado
                </span>
              )}
            </div>

            {/* Formula Selector */}
            <div>
              <label className="text-xs text-purple-200 font-bold">Equação Preditiva da TMB:</label>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value as any)}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-fuchsia-400 font-medium"
              >
                <option value="mifflin">Mifflin-St Jeor (Padrão Ouro para Adultos)</option>
                <option value="harris_benedict">Harris-Benedict Revisada (Roza & Shizgal 1984)</option>
                <option value="cunningham">Cunningham (Baseada na Massa Livre de Gordura)</option>
                <option value="dri">DRI / IOM (EER - Dietary Reference Intakes)</option>
              </select>
            </div>

            {/* Gender and Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-purple-200 font-bold">Gênero Biológico:</label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  <button
                    onClick={() => setGender('masculino')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      gender === 'masculino'
                        ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-500 shadow-sm'
                        : 'bg-[#1e073c] text-purple-200 border-purple-800'
                    }`}
                  >
                    Masc
                  </button>
                  <button
                    onClick={() => setGender('feminino')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      gender === 'feminino'
                        ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-500 shadow-sm'
                        : 'bg-[#1e073c] text-purple-200 border-purple-800'
                    }`}
                  >
                    Fem
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-purple-200 font-bold">Idade (anos):</label>
                <input
                  type="number"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  placeholder="ex: 28"
                  className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2 text-xs text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
                />
              </div>
            </div>

            {/* Weight and Height with cm or m support */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-purple-200 font-bold">Peso Atual (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="ex: 75.0"
                  className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2 text-xs text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs text-purple-200 font-bold">Altura:</label>
                  <span className="text-[10px] text-fuchsia-300 font-semibold">
                    {heightCm > 0 ? `${heightCm} cm (${heightM.toFixed(2)} m)` : 'cm ou metros'}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  placeholder="ex: 175 ou 1.75"
                  className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2 text-xs text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
                />
              </div>
            </div>

            {/* Body Fat (for Cunningham) */}
            <div>
              <label className="text-xs text-purple-200 font-bold">% Gordura Estimado (Bioimpedância/Dobras):</label>
              <input
                type="number"
                step="0.1"
                value={bodyFatInput}
                onChange={(e) => setBodyFatInput(e.target.value)}
                placeholder="ex: 14.5"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2 text-xs text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            {/* Physical Activity Level */}
            <div>
              <label className="text-xs text-purple-200 font-bold">Nível de Atividade Física (NAF):</label>
              <select
                value={activityFactor}
                onChange={(e) => setActivityFactor(Number(e.target.value))}
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-xs text-white font-medium focus:outline-none"
              >
                <option value={1.2}>Sedentário (Pouco ou nenhum exercício) • 1.20</option>
                <option value={1.375}>Levemente Ativo (Treino 1-3 dias/semana) • 1.375</option>
                <option value={1.55}>Moderadamente Ativo (Treino 3-5 dias/semana) • 1.55</option>
                <option value={1.725}>Muito Ativo (Treino intenso 6-7 dias/semana) • 1.725</option>
                <option value={1.9}>Extremamente Ativo (Atleta com 2 treinos/dia) • 1.90</option>
              </select>
            </div>

            {/* Protein Target Slider */}
            <div className="pt-2 border-t border-purple-900/40">
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-200 font-bold">Meta de Proteína (g/kg):</span>
                <span className="font-black text-fuchsia-300">
                  {customProteinGPerKg} g/kg {calculatedProteinGrams > 0 ? `(${calculatedProteinGrams}g)` : ''}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={customProteinGPerKg}
                onChange={(e) => setCustomProteinGPerKg(Number(e.target.value))}
                className="w-full mt-2 accent-fuchsia-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-purple-300 mt-0.5 font-medium">
                <span>1.2g (Manutenção)</span>
                <span>2.0g (Hipertrofia/Déficit)</span>
                <span>2.8g (Atleta)</span>
              </div>
            </div>

            {/* Salvar button on form */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveCalculation}
                disabled={isSaving}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-emerald-200" />
                <span>{isSaving ? 'Salvando no Prontuário...' : (activePatient ? `Salvar no Prontuário de ${activePatient.name}` : 'Salvar Cálculo')}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Calculations Breakdown & Results */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Primary Energy Results Box */}
            <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 shadow-md">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-fuchsia-400" />
                Resultados Energéticos {activePatient ? `de ${activePatient.name}` : ''}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
                  <span className="text-[11px] text-purple-200 block uppercase font-bold">Taxa Basal (TMB)</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {metabolicResults.tmb > 0 ? metabolicResults.tmb : '-'}
                  </span>
                  <span className="text-[10px] text-purple-200">kcal/dia ({formula})</span>
                </div>

                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-fuchsia-500/60 text-center bg-purple-950/40">
                  <span className="text-[11px] text-fuchsia-300 block uppercase font-bold">Gasto Total (GET)</span>
                  <span className="text-xl font-black text-fuchsia-200 mt-1 block">
                    {metabolicResults.get > 0 ? metabolicResults.get : '-'}
                  </span>
                  <span className="text-[10px] text-fuchsia-300">kcal/dia (NAF {activityFactor})</span>
                </div>

                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
                  <span className="text-[11px] text-purple-200 block uppercase font-bold">IMC Atual</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {metabolicResults.bmi > 0 ? metabolicResults.bmi : '-'}
                  </span>
                  <span className="text-[10px] text-fuchsia-300 font-bold">
                    {metabolicResults.bmi > 0 ? metabolicResults.bmiClassification.split(' ')[0] : 'Aguardando'}
                  </span>
                </div>

                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
                  <span className="text-[11px] text-purple-200 block uppercase font-bold">Necessidade Hídrica</span>
                  <span className="text-xl font-black text-purple-200 mt-1 block">
                    {metabolicResults.waterRecommendationLiters > 0 ? `${metabolicResults.waterRecommendationLiters} L` : '-'}
                  </span>
                  <span className="text-[10px] text-purple-200">35 mL / kg / dia</span>
                </div>
              </div>

              {/* Energy Strategies Strip (Superávit vs Déficit) */}
              <div className="mt-4 pt-4 border-t border-purple-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-xs">
                  <span className="text-rose-400 font-bold block">Déficit (Emagrecimento):</span>
                  <span className="text-sm font-black text-white mt-0.5 block">
                    {metabolicResults.get > 0 ? `${Math.max(0, metabolicResults.get - 450)} kcal` : '-'}
                  </span>
                  <span className="text-[10px] text-purple-200 font-medium">-450 kcal do GET</span>
                </div>

                <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-xs">
                  <span className="text-purple-200 font-bold block">Eucalórica (Manutenção):</span>
                  <span className="text-sm font-black text-white mt-0.5 block">
                    {metabolicResults.get > 0 ? `${metabolicResults.get} kcal` : '-'}
                  </span>
                  <span className="text-[10px] text-purple-200 font-medium">Equilíbrio Energético</span>
                </div>

                <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-xs">
                  <span className="text-fuchsia-300 font-bold block">Superávit (Hipertrofia):</span>
                  <span className="text-sm font-black text-white mt-0.5 block">
                    {metabolicResults.get > 0 ? `${metabolicResults.get + 350} kcal` : '-'}
                  </span>
                  <span className="text-[10px] text-purple-200 font-medium">+350 kcal do GET</span>
                </div>
              </div>

            </div>

            {/* Macronutrient Distribution Card */}
            <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-fuchsia-400" />
                  Distribuição Recomendada de Macronutrientes (Diária)
                </h3>
                {isObese && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Manejo de Obesidade (IMC ≥ 30) • Peso Ajustado
                  </span>
                )}
              </div>

              {isObese && (
                <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-fuchsia-950/30 rounded-2xl border border-amber-500/30 text-xs space-y-1.5 text-purple-100">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span>Diretriz ABESO / CFN: Peso Ajustado</span>
                    <span>IMC: {metabolicResults.bmi} kg/m²</span>
                  </div>
                  <p className="text-[11px] text-purple-200 leading-relaxed">
                    Para evitar sobrecarga renal e metabólica em pacientes com obesidade, a meta de proteínas é calculada sobre o <strong>Peso Ajustado ({adjustedWeight} kg)</strong> em vez do peso real ({weightKg} kg).
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-semibold text-purple-200">
                    <span className="p-1.5 bg-[#120326]/60 rounded-lg border border-purple-800/40">
                      Peso Ideal (IMC 22.5): <strong className="text-white">{idealWeight} kg</strong>
                    </span>
                    <span className="p-1.5 bg-[#120326]/60 rounded-lg border border-amber-500/40">
                      Peso Ajustado: <strong className="text-amber-300">{adjustedWeight} kg</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-xs">
                
                {/* Protein */}
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-fuchsia-300">Proteínas (4 kcal/g)</span>
                    <span className="font-black text-white">
                      {calculatedProteinGrams > 0 ? `${calculatedProteinGrams}g (${proteinCalories} kcal) • ${proteinPct}%` : '-'}
                    </span>
                  </div>
                  <div className="w-full bg-[#120326] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${proteinPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Carbs */}
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-200">Carboidratos (4 kcal/g)</span>
                    <span className="font-black text-white">
                      {carbsGrams > 0 ? `${carbsGrams}g (${carbsCalories} kcal) • ${carbsPct}%` : '-'}
                    </span>
                  </div>
                  <div className="w-full bg-[#120326] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${carbsPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fat */}
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300">Gorduras / Lipídios (9 kcal/g)</span>
                    <span className="font-black text-white">
                      {fatGrams > 0 ? `${fatGrams}g (${fatCalories} kcal) • ${fatPct}%` : '-'}
                    </span>
                  </div>
                  <div className="w-full bg-[#120326] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${fatPct}%` }}
                    ></div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* Subtab 2: Pollock 3 Dobras */}
      {calcSubTab === 'pollock' && (
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-fuchsia-400" />
                Protocolo Jackson & Pollock (3 Dobras Cutâneas) {activePatient ? `• ${activePatient.name}` : ''}
              </h3>
              <p className="text-xs text-purple-200 mt-1 font-medium">
                Cálculo de Densidade Corporal (DC) e Equação de Siri para estimativa de Percentual de Gordura (%BF).
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveCalculation}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Dobras no Prontuário</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-purple-200 font-bold">
                {gender === 'masculino' ? 'Dobra Peitoral (mm):' : 'Dobra Tríceps (mm):'}
              </label>
              <input
                type="number"
                step="0.5"
                value={fold1Input}
                onChange={(e) => setFold1Input(e.target.value)}
                placeholder="ex: 12.0"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div>
              <label className="text-xs text-purple-200 font-bold">
                {gender === 'masculino' ? 'Dobra Abdominal (mm):' : 'Dobra Supra-ilíaca (mm):'}
              </label>
              <input
                type="number"
                step="0.5"
                value={fold2Input}
                onChange={(e) => setFold2Input(e.target.value)}
                placeholder="ex: 18.0"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div>
              <label className="text-xs text-purple-200 font-bold">Dobra da Coxa (mm):</label>
              <input
                type="number"
                step="0.5"
                value={fold3Input}
                onChange={(e) => setFold3Input(e.target.value)}
                placeholder="ex: 15.0"
                className="w-full mt-1 bg-[#1e073c] border border-purple-700/60 rounded-xl p-2.5 text-sm text-white font-bold placeholder-purple-400/40 focus:outline-none focus:border-fuchsia-400"
              />
            </div>
          </div>

          {/* Pollock Result Box */}
          <div className="p-5 bg-[#1d0637] rounded-2xl border border-purple-800/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-xs text-purple-200 block uppercase font-bold">Soma das 3 Dobras</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {(fold1 + fold2 + fold3) > 0 ? `${(fold1 + fold2 + fold3).toFixed(1)} mm` : '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-purple-200 block uppercase font-bold">Densidade Corporal (DC)</span>
              <span className="text-2xl font-black text-purple-200 mt-1 block">
                {pollockResults.density > 0 ? `${pollockResults.density} g/cm³` : '-'}
              </span>
            </div>
            <div>
              <span className="text-xs text-fuchsia-300 block uppercase font-bold">% Gordura Corporal (Siri)</span>
              <span className="text-3xl font-black text-fuchsia-300 mt-1 block">
                {pollockResults.bodyFatPercentage > 0 ? `${pollockResults.bodyFatPercentage}%` : '-'}
              </span>
            </div>
          </div>

          <div className="text-xs text-purple-200 bg-[#1d0637] p-4 rounded-2xl border border-purple-800/40 font-medium">
            <strong className="text-white">Referência Clínica:</strong> Para homens adultos, a faixa ótima fica entre 10-16%. Para mulheres adultas, a faixa ótima fica entre 18-24%.
          </div>
        </div>
      )}

      {/* Subtab 3: Protocolos NutrinK */}
      {calcSubTab === 'protocolos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Protocol Selector List */}
          <div className="lg:col-span-4 bg-[#150328] border border-purple-900/50 rounded-3xl p-4 space-y-2 shadow-md">
            <h3 className="text-xs font-bold uppercase text-purple-200 mb-3">Protocolos Clínicos</h3>
            {CLINICAL_PROTOCOLS.map((proto) => (
              <button
                key={proto.id}
                onClick={() => setSelectedProtocol(proto)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedProtocol.id === proto.id
                    ? 'bg-fuchsia-950/80 border-fuchsia-500 text-white shadow-md'
                    : 'bg-[#1d0637] border-purple-900/40 text-purple-100 hover:bg-[#250847]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold block">{proto.name}</span>
                  {selectedProtocol.id === proto.id && (
                    <Check className="w-3.5 h-3.5 text-fuchsia-300 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-purple-200 mt-0.5 block">{proto.category}</span>
              </button>
            ))}
          </div>

          {/* Protocol Detailed Sheet */}
          <div className="lg:col-span-8 bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-5 shadow-md">
            <div className="flex items-start justify-between pb-3 border-b border-purple-900/40">
              <div>
                <span className="text-xs text-fuchsia-300 font-bold uppercase">{selectedProtocol.category}</span>
                <h2 className="text-lg font-black text-white mt-0.5">{selectedProtocol.name}</h2>
              </div>
              <button
                onClick={() => onOpenNutriaWithPrompt(`Nutria, elabore uma conduta clínica baseada no protocolo de "${selectedProtocol.name}" ${activePatient ? `para o paciente ${activePatient.name} (GET: ${metabolicResults.get || activePatient.get} kcal)` : ''} incluindo exemplos práticos de cardápio.`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Aplicar com NUTRIA</span>
              </button>
            </div>

            <div className="space-y-4 text-xs text-purple-100 font-medium">
              <div>
                <span className="font-bold text-white block mb-1">Indicação Clínica:</span>
                <p className="leading-relaxed text-purple-200">{selectedProtocol.indication}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                  <span className="text-purple-200 font-bold block">Estratégia Calórica:</span>
                  <p className="text-white font-black mt-0.5">{selectedProtocol.targetKcalStrategy}</p>
                </div>
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                  <span className="text-fuchsia-300 font-bold block">Aporte Proteico:</span>
                  <p className="text-white font-black mt-0.5">{selectedProtocol.proteinRangeGPerKg}</p>
                </div>
                <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                  <span className="text-purple-200 font-bold block">Carboidratos / Lipídios:</span>
                  <p className="text-white font-black mt-0.5">Carbs: {selectedProtocol.carbsRangePercentage} • Gord: {selectedProtocol.fatRangePercentage}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-fuchsia-300 block mb-1">Nutrientes-Chave & Suplementação:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedProtocol.keyNutrients.map((nut, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-[#1d0637] text-white border border-purple-700/60 font-semibold">
                      ✓ {nut}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-purple-200 block mb-1">Alimentos Recomendados:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedProtocol.recommendedFoods.map((food, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-[#29094e] text-fuchsia-200 border border-fuchsia-500/40 font-semibold">
                      {food}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                <span className="font-bold text-amber-300 block mb-1">Observações Clínicas & Cuidados:</span>
                <p className="text-purple-100 italic">{selectedProtocol.clinicalObservations}</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Subtab 4: Tabela de Alimentos TACO/TBCA */}
      {calcSubTab === 'tabela_alimentos' && (
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Apple className="w-4 h-4 text-fuchsia-400" />
                Tabela de Composição de Alimentos (Padrão TACO / TBCA)
              </h3>
              <p className="text-xs text-purple-200 mt-0.5 font-medium">Valores nutricionais de referência para elaboração de cardápios</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  placeholder="Buscar alimento..."
                  className="w-full bg-[#1e073c] border border-purple-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-purple-300/60 focus:outline-none focus:border-fuchsia-400"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {foodCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFoodCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  foodCategory === cat
                    ? 'bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-500/60 shadow-sm'
                    : 'bg-[#220743] text-purple-200 hover:text-white border border-purple-800/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-100">
              <thead className="bg-[#1d0637] text-purple-200 uppercase font-bold border-b border-purple-900/40">
                <tr>
                  <th className="p-3">Alimento</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Porção Padrão</th>
                  <th className="p-3 text-right">Calorias</th>
                  <th className="p-3 text-right text-fuchsia-300">Proteína</th>
                  <th className="p-3 text-right text-purple-200">Carboidrato</th>
                  <th className="p-3 text-right text-amber-300">Lipídios</th>
                  <th className="p-3 text-right text-indigo-300">Fibras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30">
                {filteredFoods.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1d0637]/60">
                    <td className="p-3 font-bold text-white">{item.name}</td>
                    <td className="p-3 text-purple-200 font-medium">{item.category}</td>
                    <td className="p-3 text-purple-200">{item.portion}</td>
                    <td className="p-3 text-right font-black text-white">{item.calories} kcal</td>
                    <td className="p-3 text-right text-fuchsia-300 font-bold">{item.protein}g</td>
                    <td className="p-3 text-right text-purple-200 font-bold">{item.carbs}g</td>
                    <td className="p-3 text-right text-amber-300 font-bold">{item.fat}g</td>
                    <td className="p-3 text-right text-indigo-300 font-bold">{item.fiber}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};

export default NutriCalcView;
