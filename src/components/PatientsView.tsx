import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Video,
  Phone, 
  Mail, 
  Activity, 
  FileText, 
  Sparkles, 
  Bot, 
  ChevronRight, 
  ArrowLeft,
  Flame,
  Heart,
  Scale,
  Award,
  Download,
  Printer,
  ShoppingBag,
  Edit3,
  Check,
  X,
  Droplets,
  Pill,
  ClipboardList,
  Send,
  Trash2,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  User,
  CalendarPlus,
  History,
  Target,
  Camera,
  SplitSquareHorizontal
} from 'lucide-react';
import { 
  Patient, 
  AnthropometricRecord, 
  FoodItem, 
  UserAccount, 
  Gender, 
  PatientObjective,
  ClinicalPrescription,
  PrescriptionItem,
  LabExam,
  LabMarker,
  Appointment
} from '../types';
import { MealPlanEditor } from './MealPlanEditor';
import { PatientTimelineSubcategory } from './patient-subcategories/PatientTimelineSubcategory';
import { PatientHabitsSubcategory } from './patient-subcategories/PatientHabitsSubcategory';
import { PatientAestheticsSubcategory } from './patient-subcategories/PatientAestheticsSubcategory';
import { PatientBiomarkersSubcategory } from './patient-subcategories/PatientBiomarkersSubcategory';
import { PatientPrescriptionsSubcategory } from './patient-subcategories/PatientPrescriptionsSubcategory';
import { 
  printMealPlanPdf, 
  sendMealPlanViaWhatsApp, 
  printPrescriptionPdf, 
  sendPrescriptionViaWhatsApp 
} from '../utils/pdfExportUtils';
import { 
  normalizeHeightToCm, 
  normalizeHeightToMeters, 
  calculateBMI, 
  calculateMifflinTMB, 
  calculateGET, 
  calculateWaterRecommendation 
} from '../utils/nutritionCalculations';

interface PatientsViewProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (id: string | null) => void;
  onOpenNewPatient: () => void;
  onOpenNewAppointmentWithPatient: (patient: Patient) => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onDeletePatient?: (patientId: string) => void;
  foodDatabase: FoodItem[];
  userAccount?: UserAccount;
  onStartTelemedicine?: (patientId: string) => void;
  onNavigateToNutriCalc?: (patientId: string) => void;
  appointments?: Appointment[];
  onUpdateAppointmentStatus?: (aptId: string, newStatus: Appointment['status']) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onOpenNewPatient,
  onOpenNewAppointmentWithPatient,
  onOpenNutriaWithPrompt,
  onUpdatePatient,
  onDeletePatient,
  foodDatabase,
  userAccount,
  onStartTelemedicine,
  onNavigateToNutriCalc,
  appointments = [],
  onUpdateAppointmentStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState<string>('todos');
  
  // Feedback / Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // 5 Subcategorias Oficiais do Prontuário Integrado (Tela Única):
  // 1: Histórico & Linha do Tempo (Timeline)
  // 2: Metas & Hábitos Atuais
  // 3: Evolução Estética & Antropometria
  // 4: Central de Exames & Biomarcadores
  // 5: Prescrições & Suplementação
  // + Plano Alimentar & Dados Clínicos/Anamnese
  const [activeTab, setActiveTab] = useState<
    'timeline' | 'habitos' | 'evolucao_estetica' | 'exames_biomarcadores' | 'prescricoes_suplementacao' | 'plano_alimentar' | 'resumo' | 'plano' | 'prescricoes' | 'evolucao' | 'exames'
  >('timeline');
  
  // Modal de Avaliação Antropométrica (Aba 4)
  const [isAddingAntro, setIsAddingAntro] = useState(false);
  const [newAntroWeight, setNewAntroWeight] = useState('');
  const [newAntroBf, setNewAntroBf] = useState('');
  const [newAntroWaist, setNewAntroWaist] = useState('');
  const [newAntroMuscle, setNewAntroMuscle] = useState('');
  const [newAntroNotes, setNewAntroNotes] = useState('');

  // Modal de Prescrição / Suplementação (Aba 3)
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [newRxTitle, setNewRxTitle] = useState('');
  const [newRxType, setNewRxType] = useState<ClinicalPrescription['type']>('manipulado');
  const [newRxInstructions, setNewRxInstructions] = useState('');
  const [newRxItems, setNewRxItems] = useState<PrescriptionItem[]>([
    { id: 'it-1', name: '', dosage: '', form: 'capsula', posology: '', indication: '' }
  ]);

  // Modal de Exames Laboratoriais (Aba 5)
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamLab, setNewExamLab] = useState('');
  const [newExamDate, setNewExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExamReview, setNewExamReview] = useState('');
  const [newExamMarkers, setNewExamMarkers] = useState<LabMarker[]>([
    { id: 'mk-1', marker: 'Glicemia de Jejum', value: '', unit: 'mg/dL', referenceRange: '70 - 99', status: 'normal' },
    { id: 'mk-2', marker: 'Hemoglobina Glicada (HbA1c)', value: '', unit: '%', referenceRange: '< 5.7', status: 'normal' },
    { id: 'mk-3', marker: 'Colesterol Total', value: '', unit: 'mg/dL', referenceRange: '< 190', status: 'normal' },
    { id: 'mk-4', marker: 'Vitamina D (25-OH)', value: '', unit: 'ng/mL', referenceRange: '30 - 60', status: 'normal' },
    { id: 'mk-5', marker: 'Vitamina B12', value: '', unit: 'pg/mL', referenceRange: '350 - 900', status: 'normal' },
    { id: 'mk-6', marker: 'Ferritina Sérica', value: '', unit: 'ng/mL', referenceRange: '30 - 200', status: 'normal' }
  ]);

  // Modal de Edição de Dados Clínicos, Parâmetros & Anamnese (Aba 1)
  const [isEditingClinical, setIsEditingClinical] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Campos Cadastrais
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'ativo' | 'em_espera' | 'inativo'>('ativo');

  // Campos Clínicos e Antropométricos
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState<Gender>('feminino');
  const [editObjective, setEditObjective] = useState<PatientObjective>('emagrecimento');
  const [editNaf, setEditNaf] = useState<number>(1.2);
  const [editBf, setEditBf] = useState('');
  const [editTargetWeight, setEditTargetWeight] = useState('');
  const [editClinicalHistory, setEditClinicalHistory] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editMedications, setEditMedications] = useState('');
  const [editRoutine, setEditRoutine] = useState('');
  const [editSleep, setEditSleep] = useState('7');
  const [editBowel, setEditBowel] = useState<'diario_normal' | 'constipado' | 'diarreico' | 'irregular'>('diario_normal');
  const [editPreferences, setEditPreferences] = useState('');
  const [editAversions, setEditAversions] = useState('');
  const [editEmotional, setEditEmotional] = useState('');

  // Filtered Patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesObjective = objectiveFilter === 'todos' || p.objective === objectiveFilter;
    return matchesSearch && matchesObjective;
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Appointments do paciente selecionado
  const patientAppointments = selectedPatient
    ? appointments.filter(a => a.patientId === selectedPatient.id || a.patientName?.toLowerCase() === selectedPatient.name.toLowerCase())
    : [];

  const handleOpenEditClinical = () => {
    if (!selectedPatient) return;
    setEditName(selectedPatient.name || '');
    setEditEmail(selectedPatient.email || '');
    setEditPhone(selectedPatient.phone || '');
    setEditStatus(selectedPatient.status || 'ativo');
    setEditWeight(selectedPatient.currentWeightKg > 0 ? String(selectedPatient.currentWeightKg) : '');
    setEditHeight(selectedPatient.heightCm > 0 ? String(selectedPatient.heightCm) : '');
    setEditAge(selectedPatient.age > 0 ? String(selectedPatient.age) : '');
    setEditGender(selectedPatient.gender || 'feminino');
    setEditObjective(selectedPatient.objective || 'emagrecimento');
    setEditNaf(selectedPatient.activityFactor || 1.2);
    setEditBf(selectedPatient.bodyFatPercentage > 0 ? String(selectedPatient.bodyFatPercentage) : '');
    setEditTargetWeight(selectedPatient.targetWeightKg > 0 ? String(selectedPatient.targetWeightKg) : '');
    setEditClinicalHistory(selectedPatient.anamnese?.clinicalHistory || '');
    setEditAllergies(selectedPatient.anamnese?.foodAllergiesAndIntolerances || '');
    setEditMedications(selectedPatient.anamnese?.currentMedicationsAndSupplements || '');
    setEditRoutine(selectedPatient.anamnese?.routineAndOccupation || '');
    setEditSleep(selectedPatient.anamnese?.sleepHoursPerNight ? String(selectedPatient.anamnese.sleepHoursPerNight) : '7');
    setEditBowel(selectedPatient.anamnese?.bowelHabit || 'diario_normal');
    setEditPreferences(selectedPatient.anamnese?.dietaryPreferences || '');
    setEditAversions(selectedPatient.anamnese?.dietaryAversions || '');
    setEditEmotional(selectedPatient.anamnese?.emotionalRelationshipWithFood || '');
    setShowDeleteConfirm(false);
    setIsEditingClinical(true);
  };

  // Cálculos dinâmicos em tempo real durante a edição de parâmetros
  const editWeightNum = parseFloat(editWeight) || 0;
  const editRawHeightNum = parseFloat(editHeight) || 0;
  const editHeightCm = normalizeHeightToCm(editRawHeightNum);
  const editHeightM = normalizeHeightToMeters(editRawHeightNum);
  const editAgeNum = parseInt(editAge, 10) || 0;
  const editBfNum = parseFloat(editBf) || 0;
  const editTargetWeightNum = parseFloat(editTargetWeight) || 0;

  const editBmiData = calculateBMI(editWeightNum, editRawHeightNum);
  const editTmb = calculateMifflinTMB(editGender, editWeightNum, editRawHeightNum, editAgeNum);
  const editGet = calculateGET(editTmb, editNaf);
  const editWater = calculateWaterRecommendation(editWeightNum);

  const handleSaveClinicalParams = () => {
    if (!selectedPatient) return;
    const finalName = editName.trim() || selectedPatient.name;
    const updated: Patient = {
      ...selectedPatient,
      name: finalName,
      email: editEmail.trim() || selectedPatient.email,
      phone: editPhone.trim() || selectedPatient.phone,
      status: editStatus,
      age: editAgeNum,
      gender: editGender,
      objective: editObjective,
      currentWeightKg: editWeightNum,
      targetWeightKg: editTargetWeightNum,
      heightCm: editHeightCm,
      bmi: editBmiData.bmi,
      tmb: editTmb,
      get: editGet,
      bodyFatPercentage: editBfNum,
      activityFactor: editNaf,
      anamnese: {
        ...selectedPatient.anamnese,
        clinicalHistory: editClinicalHistory,
        foodAllergiesAndIntolerances: editAllergies,
        currentMedicationsAndSupplements: editMedications,
        routineAndOccupation: editRoutine,
        sleepHoursPerNight: parseInt(editSleep, 10) || 7,
        bowelHabit: editBowel,
        dietaryPreferences: editPreferences,
        dietaryAversions: editAversions,
        emotionalRelationshipWithFood: editEmotional,
        waterIntakeLiters: editWater.liters
      }
    };
    onUpdatePatient(updated);
    setIsEditingClinical(false);
    setToastMessage({
      text: `Dados cadastrais e parâmetros clínicos de ${finalName} foram salvos com sucesso no prontuário!`,
      type: 'success'
    });
  };

  const handleDeletePatientConfirm = () => {
    if (!selectedPatient) return;
    const patientName = selectedPatient.name;
    const patientId = selectedPatient.id;

    if (onDeletePatient) {
      onDeletePatient(patientId);
    }
    setShowDeleteConfirm(false);
    setIsEditingClinical(false);
    onSelectPatient(null);
    setToastMessage({
      text: `O paciente ${patientName} e todo o seu prontuário foram excluídos permanentemente com sucesso.`,
      type: 'success'
    });
  };

  // Salvar registro de antropometria (Aba 4)
  const handleSaveAnthropometry = () => {
    if (!selectedPatient || !newAntroWeight) return;
    const weightNum = parseFloat(newAntroWeight);
    const heightCm = normalizeHeightToCm(selectedPatient.heightCm);
    const bmiData = calculateBMI(weightNum, heightCm);
    const bfNum = newAntroBf ? parseFloat(newAntroBf) : selectedPatient.bodyFatPercentage;
    const muscleNum = newAntroMuscle ? parseFloat(newAntroMuscle) : selectedPatient.muscleMassPercentage;
    const newTmb = calculateMifflinTMB(selectedPatient.gender, weightNum, heightCm, selectedPatient.age);
    const newGet = calculateGET(newTmb, selectedPatient.activityFactor || 1.2);
    const water = calculateWaterRecommendation(weightNum);

    const newRecord: AnthropometricRecord = {
      id: `ev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: weightNum,
      heightCm: heightCm,
      bmi: bmiData.bmi,
      bodyFatPercentage: bfNum,
      muscleMassPercentage: muscleNum,
      waistCircumferenceCm: newAntroWaist ? parseFloat(newAntroWaist) : undefined,
      notes: newAntroNotes || 'Acompanhamento antropométrico de rotina.'
    };

    const updated: Patient = {
      ...selectedPatient,
      currentWeightKg: weightNum,
      bmi: bmiData.bmi,
      tmb: newTmb,
      get: newGet,
      bodyFatPercentage: bfNum,
      muscleMassPercentage: muscleNum,
      evolutionHistory: [newRecord, ...(selectedPatient.evolutionHistory || [])],
      anamnese: {
        ...selectedPatient.anamnese,
        waterIntakeLiters: water.liters
      }
    };

    onUpdatePatient(updated);
    setIsAddingAntro(false);
    setNewAntroWeight('');
    setNewAntroBf('');
    setNewAntroWaist('');
    setNewAntroMuscle('');
    setNewAntroNotes('');
  };

  // Salvar Prescrição de Suplementação (Aba 3)
  const handleSavePrescription = () => {
    if (!selectedPatient || !newRxTitle.trim()) return;

    const validItems = newRxItems.filter(it => it.name.trim().length > 0);
    if (validItems.length === 0) return;

    const newPrescription: ClinicalPrescription = {
      id: `rx-${Date.now()}`,
      patientId: selectedPatient.id,
      date: new Date().toLocaleDateString('pt-BR'),
      title: newRxTitle.trim(),
      type: newRxType,
      instructions: newRxInstructions.trim() || 'Tomar conforme orientações descritas em cada item.',
      items: validItems
    };

    const updated: Patient = {
      ...selectedPatient,
      prescriptions: [newPrescription, ...(selectedPatient.prescriptions || [])]
    };

    onUpdatePatient(updated);
    setIsAddingPrescription(false);
    setNewRxTitle('');
    setNewRxInstructions('');
    setNewRxItems([{ id: `it-${Date.now()}`, name: '', dosage: '', form: 'capsula', posology: '', indication: '' }]);
  };

  const handleDeletePrescription = (rxId: string) => {
    if (!selectedPatient) return;
    const updated: Patient = {
      ...selectedPatient,
      prescriptions: (selectedPatient.prescriptions || []).filter(r => r.id !== rxId)
    };
    onUpdatePatient(updated);
  };

  // Prescrições Pré-prontas inteligentes da NÚTRIA para carregar rápido
  const handleLoadPresetPrescription = (presetType: string) => {
    if (presetType === 'mitocondrial') {
      setNewRxTitle('Fórmula Otimização Mitocondrial & Produção Energética');
      setNewRxType('manipulado');
      setNewRxInstructions('Tomar diariamente após o desjejum para melhora do metabolismo celular.');
      setNewRxItems([
        { id: `it-1`, name: 'Coenzima Q10 (Ubiquinona)', dosage: '100mg', form: 'capsula', posology: '1 cápsula no desjejum', indication: 'Bioenergética celular e antioxidante' },
        { id: `it-2`, name: 'PQQ (Pirroloquinolina Quinona)', dosage: '10mg', form: 'capsula', posology: '1 cápsula junto com CoQ10', indication: 'Biogênese mitocondrial' },
        { id: `it-3`, name: 'L-Carnitina Tartarato', dosage: '500mg', form: 'capsula', posology: '1 cápsula 30min antes do treino ou pela manhã', indication: 'Transporte de ácidos graxos para mitocôndria' }
      ]);
    } else if (presetType === 'sono') {
      setNewRxTitle('Modulação Neurofuncional & Sono Reparador');
      setNewRxType('manipulado');
      setNewRxInstructions('Ingerir 45 a 60 minutos antes de deitar com pouca água.');
      setNewRxItems([
        { id: `it-1`, name: 'Magnésio Inositol (Bisglicinato + Inositol)', dosage: '350mg', form: 'sache', posology: 'Dissolver 1 sachê em 100ml de água morna à noite', indication: 'Relaxamento neural e síntese de GABA' },
        { id: `it-2`, name: 'L-Teanina', dosage: '200mg', form: 'capsula', posology: '1 cápsula 1h antes de dormir', indication: 'Redução da latência do sono e controle de pensamentos acelerados' },
        { id: `it-3`, name: 'Extrato Seco de Passiflora Incarnata', dosage: '300mg', form: 'capsula', posology: '1 cápsula antes de deitar', indication: 'Modulação de estresse e ansiedade noturna' }
      ]);
    } else if (presetType === 'intestinal') {
      setNewRxTitle('Pool de Probióticos & Recuperação da Barreira Intestinal');
      setNewRxType('manipulado');
      setNewRxInstructions('Uso contínuo por 60 dias para otimização da microbiota e integridade das tight-junctions.');
      setNewRxItems([
        { id: `it-1`, name: 'L-Glutamina Pura 100%', dosage: '5g', form: 'po', posology: '1 dosador (5g) em jejum pela manhã diluído em 100ml de água', indication: 'Combustível para enterócitos e barreira intestinal' },
        { id: `it-2`, name: 'Pool Probiótico (L. acidophilus, L. rhamnosus, B. lactis, B. bifidum)', dosage: '10 Bilhões UFC', form: 'capsula', posology: '1 cápsula gastro-resistente antes de dormir', indication: 'Equilíbrio da microbiota intestinal' },
        { id: `it-3`, name: 'Zinco Quelato (Bisglicinato)', dosage: '20mg', form: 'capsula', posology: '1 cápsula após o almoço', indication: 'Cicatrizante epitelial e suporte imune' }
      ]);
    } else if (presetType === 'hipertrofia') {
      setNewRxTitle('Protocolo Ergogênico & Síntese Proteica (MPS)');
      setNewRxType('suplemento_esportivo');
      setNewRxInstructions('Aliar ao treinamento resistido e ao aporte proteico do plano alimentar.');
      setNewRxItems([
        { id: `it-1`, name: 'Creatina Monoidratada Micronizada', dosage: '5g/dia', form: 'po', posology: 'Tomar 5g ao dia (preferencialmente pós-treino ou junto com carboidrato)', indication: 'Ressíntese rápida de ATP e hidratação celular' },
        { id: `it-2`, name: 'Beta-Alanina', dosage: '3g/dia (fracionado 1.5g 2x/dia)', form: 'po', posology: '1.5g de manhã e 1.5g pré-treino', indication: 'Aumento dos níveis de carnosina muscular e tamponamento de H+' },
        { id: `it-3`, name: 'Ômega 3 Ultra Concentrado (EPA 660mg / DHA 440mg)', dosage: '2 cápsulas/dia', form: 'capsula', posology: '1 cápsula no almoço e 1 cápsula no jantar', indication: 'Ação anti-inflamatória e sensibilização de receptores de membrana' }
      ]);
    }
  };

  // Salvar Exame Laboratorial (Aba 5)
  const handleSaveExam = () => {
    if (!selectedPatient || !newExamTitle.trim()) return;

    const validMarkers = newExamMarkers.filter(m => m.value.trim().length > 0);

    const newLabExam: LabExam = {
      id: `exam-${Date.now()}`,
      patientId: selectedPatient.id,
      title: newExamTitle.trim(),
      laboratory: newExamLab.trim() || 'Laboratório Clínico de Análises',
      date: newExamDate || new Date().toISOString().split('T')[0],
      nutriaClinicalReview: newExamReview.trim() || 'Marcadores analisados conforme referências laboratoriais padrão.',
      markers: validMarkers.length > 0 ? validMarkers : newExamMarkers
    };

    const updated: Patient = {
      ...selectedPatient,
      labExams: [newLabExam, ...(selectedPatient.labExams || [])]
    };

    onUpdatePatient(updated);
    setIsAddingExam(false);
    setNewExamTitle('');
    setNewExamLab('');
    setNewExamReview('');
  };

  // ==========================================
  // VIEW DO PRONTUÁRIO CLÍNICO INTEGRADO
  // ==========================================
  if (selectedPatient) {
    const heightCm = normalizeHeightToCm(selectedPatient.heightCm);
    const heightM = normalizeHeightToMeters(selectedPatient.heightCm);
    const weightKg = selectedPatient.currentWeightKg || 0;
    const bmiData = calculateBMI(weightKg, selectedPatient.heightCm);
    const tmb = calculateMifflinTMB(selectedPatient.gender, weightKg, selectedPatient.heightCm, selectedPatient.age);
    const getVal = calculateGET(tmb, selectedPatient.activityFactor || 1.2);
    const waterData = calculateWaterRecommendation(weightKg);

    return (
      <div className="space-y-6 pb-12" id="patient-integrated-chart">
        
        {/* Top Header do Prontuário com Dados do Paciente */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-5 sm:p-7 shadow-xl shadow-purple-950/40">
          <button
            onClick={() => onSelectPatient(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-200 hover:text-fuchsia-300 mb-4 transition-colors"
            id="btn-back-to-patients-list"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Lista de Pacientes</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-fuchsia-950/60 shrink-0 border border-fuchsia-400/40">
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {selectedPatient.name}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 uppercase">
                    {selectedPatient.objective.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#28094c] text-purple-200 border border-purple-700/50">
                    ID: <strong className="text-white">{selectedPatient.id}</strong>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                    selectedPatient.status === 'ativo'
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/60'
                      : selectedPatient.status === 'em_espera'
                      ? 'bg-amber-950/90 text-amber-300 border-amber-600/60'
                      : 'bg-rose-950/90 text-rose-300 border-rose-600/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedPatient.status === 'ativo'
                        ? 'bg-emerald-400'
                        : selectedPatient.status === 'em_espera'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}></span>
                    Status: {selectedPatient.status === 'ativo' ? 'Ativo' : selectedPatient.status === 'em_espera' ? 'Em Acompanhamento' : 'Inativo'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-purple-200 mt-2 flex-wrap font-medium">
                  <span><strong>{selectedPatient.age} anos</strong> ({selectedPatient.gender})</span>
                  <span>•</span>
                  <span><Phone className="w-3 h-3 inline mr-1 text-purple-300" />{selectedPatient.phone}</span>
                  <span>•</span>
                  <span><Mail className="w-3 h-3 inline mr-1 text-purple-300" />{selectedPatient.email}</span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas do Cabeçalho */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleOpenEditClinical}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-100 border border-purple-700/60 rounded-xl text-xs font-bold transition-all shadow-sm"
                title="Editar parâmetros antropométricos, metabólicos e anamnese"
                id="btn-edit-patient-clinical"
              >
                <Edit3 className="w-3.5 h-3.5 text-fuchsia-300" />
                <span>Editar Dados Clínicos</span>
              </button>

              {onStartTelemedicine && (
                <button
                  onClick={() => onStartTelemedicine(selectedPatient.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:from-rose-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md shadow-fuchsia-950/60 transition-all border border-rose-400/40 cursor-pointer"
                  id="btn-patient-start-telemedicine"
                >
                  <Video className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Telemedicina</span>
                </button>
              )}

              {onNavigateToNutriCalc && (
                <button
                  onClick={() => onNavigateToNutriCalc(selectedPatient.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-100 border border-purple-700/60 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  id="btn-patient-open-nutricalc"
                >
                  <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>NutriCalc & Macros</span>
                </button>
              )}

              <button
                onClick={() => onOpenNewAppointmentWithPatient(selectedPatient)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-100 border border-purple-700/60 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                id="btn-patient-schedule-appointment"
              >
                <Calendar className="w-3.5 h-3.5 text-purple-300" />
                <span>Agendar Consulta</span>
              </button>

              <button
                onClick={() => onOpenNutriaWithPrompt(`Nutria, analise o prontuário de ${selectedPatient.name} (ID: ${selectedPatient.id}, Objetivo: ${selectedPatient.objective}, Peso: ${selectedPatient.currentWeightKg}kg, Altura: ${selectedPatient.heightCm}cm, TMB: ${selectedPatient.tmb}kcal, GET: ${selectedPatient.get}kcal, Alergias: ${selectedPatient.anamnese?.foodAllergiesAndIntolerances || 'Nenhuma'}) e apresente recomendações clínicas para o atendimento.`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40 transition-all hover:scale-105"
                id="btn-patient-nutria-copilot"
              >
                <Bot className="w-3.5 h-3.5 text-fuchsia-200" />
                <span>Copiloto NUTRIA neste Paciente</span>
              </button>
            </div>
          </div>

          {/* Faixa de Parâmetros e Cálculos Dinâmicos em Tempo Real */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-purple-900/40">
            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold flex items-center gap-1">
                <Scale className="w-3 h-3 text-fuchsia-400" /> Peso Atual
              </span>
              <p className="text-lg font-black text-white mt-0.5">
                {selectedPatient.currentWeightKg > 0 ? `${selectedPatient.currentWeightKg} kg` : '-'}
              </p>
              <span className="text-[10px] text-purple-200">
                Meta: {selectedPatient.targetWeightKg > 0 ? `${selectedPatient.targetWeightKg} kg` : '-'}
              </span>
            </div>

            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold">Altura</span>
              <p className="text-lg font-black text-white mt-0.5">
                {selectedPatient.heightCm > 0 ? `${heightCm} cm` : '-'}
              </p>
              <span className="text-[10px] text-purple-200">
                {selectedPatient.heightCm > 0 ? `(${heightM.toFixed(2)} m)` : '-'}
              </span>
            </div>

            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold">IMC Atual</span>
              <p className="text-lg font-black text-white mt-0.5">
                {bmiData.bmi > 0 ? bmiData.bmi : '-'}
              </p>
              <span className="text-[10px] text-fuchsia-300 font-bold">
                {bmiData.bmi > 0 ? bmiData.classification.split(' ')[0] : 'Aguardando'}
              </span>
            </div>

            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold">% Gordura</span>
              <p className="text-lg font-black text-white mt-0.5">
                {selectedPatient.bodyFatPercentage > 0 ? `${selectedPatient.bodyFatPercentage}%` : '-'}
              </p>
              <span className="text-[10px] text-purple-200">
                Músculo: {selectedPatient.muscleMassPercentage ? `${selectedPatient.muscleMassPercentage}%` : '-'}
              </span>
            </div>

            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> TMB (Basal)
              </span>
              <p className="text-lg font-black text-white mt-0.5">
                {tmb > 0 ? `${tmb} kcal` : '-'}
              </p>
              <span className="text-[10px] text-purple-200">Mifflin-St Jeor</span>
            </div>

            <div className="bg-[#1d0637] p-3.5 rounded-2xl border border-purple-800/40">
              <span className="text-[11px] text-purple-200 uppercase font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 text-fuchsia-400" /> GET Total
              </span>
              <p className="text-lg font-black text-fuchsia-300 mt-0.5">
                {getVal > 0 ? `${getVal} kcal` : '-'}
              </p>
              <span className="text-[10px] text-purple-200">NAF: {selectedPatient.activityFactor || 1.2}</span>
            </div>
          </div>

          {/* Navegação Oficial em Subcategorias do Prontuário Integrado */}
          <div className="flex items-center gap-2 mt-6 border-b border-purple-900/40 overflow-x-auto scrollbar-none" id="tabs-patient-dossier">
            {[
              { id: 'timeline', label: '1. Histórico & Linha do Tempo', icon: History },
              { id: 'habitos', label: '2. Metas & Hábitos Atuais', icon: Target },
              { id: 'evolucao_estetica', label: `3. Evolução Estética & Antropometria`, icon: Camera },
              { id: 'exames_biomarcadores', label: `4. Central de Exames & Biomarcadores`, icon: Heart },
              { id: 'prescricoes_suplementacao', label: `5. Prescrições & Suplementação`, icon: Pill },
              { id: 'plano_alimentar', label: 'Plano Alimentar & Refeições', icon: Award },
              { id: 'resumo', label: 'Dados Clínicos & Anamnese', icon: FileText }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = 
                activeTab === tab.id ||
                (tab.id === 'plano_alimentar' && activeTab === 'plano') ||
                (tab.id === 'evolucao_estetica' && activeTab === 'evolucao') ||
                (tab.id === 'exames_biomarcadores' && activeTab === 'exames') ||
                (tab.id === 'prescricoes_suplementacao' && activeTab === 'prescricoes');

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                    isActive
                      ? 'border-fuchsia-400 text-fuchsia-300 bg-[#29094e] rounded-t-xl shadow-sm'
                      : 'border-transparent text-purple-200 hover:text-white'
                  }`}
                  id={`tab-btn-${tab.id}`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUBCATEGORIA 1: HISTÓRICO & LINHA DO TEMPO (TIMELINE)         */}
        {/* ============================================================== */}
        {activeTab === 'timeline' && (
          <PatientTimelineSubcategory
            patient={selectedPatient}
            onUpdatePatient={onUpdatePatient}
            appointments={appointments}
            onOpenNutriaWithPrompt={onOpenNutriaWithPrompt}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {/* ============================================================== */}
        {/* SUBCATEGORIA 2: METAS & HÁBITOS ATUAIS                         */}
        {/* ============================================================== */}
        {activeTab === 'habitos' && (
          <PatientHabitsSubcategory
            patient={selectedPatient}
            onUpdatePatient={onUpdatePatient}
            onOpenNutriaWithPrompt={onOpenNutriaWithPrompt}
          />
        )}

        {/* ============================================================== */}
        {/* SUBCATEGORIA 3: EVOLUÇÃO ESTÉTICA E ANTROPOMETRIA              */}
        {/* ============================================================== */}
        {(activeTab === 'evolucao_estetica' || activeTab === 'evolucao') && (
          <PatientAestheticsSubcategory
            patient={selectedPatient}
            onUpdatePatient={onUpdatePatient}
            onOpenNutriaWithPrompt={onOpenNutriaWithPrompt}
          />
        )}

        {/* ============================================================== */}
        {/* SUBCATEGORIA 4: CENTRAL DE EXAMES & BIOMARCADORES              */}
        {/* ============================================================== */}
        {(activeTab === 'exames_biomarcadores' || activeTab === 'exames') && (
          <PatientBiomarkersSubcategory
            patient={selectedPatient}
            onUpdatePatient={onUpdatePatient}
            onOpenNutriaWithPrompt={onOpenNutriaWithPrompt}
          />
        )}

        {/* ============================================================== */}
        {/* SUBCATEGORIA 5: PRESCRIÇÕES & SUPLEMENTAÇÃO                    */}
        {/* ============================================================== */}
        {(activeTab === 'prescricoes_suplementacao' || activeTab === 'prescricoes') && (
          <PatientPrescriptionsSubcategory
            patient={selectedPatient}
            onUpdatePatient={onUpdatePatient}
            userAccount={userAccount}
            onOpenNutriaWithPrompt={onOpenNutriaWithPrompt}
          />
        )}

        {/* ============================================================== */}
        {/* ABA 1: RESUMO CLÍNICO & PARÂMETROS                            */}
        {/* ============================================================== */}
        {activeTab === 'resumo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Coluna 1 & 2: Anamnese e Dados Clínicos */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Card de Anamnese Clínica */}
                <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 space-y-4 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-fuchsia-400" />
                      Anamnese Nutricional & Histórico Clínico
                    </h3>
                    <button
                      onClick={handleOpenEditClinical}
                      className="text-xs text-fuchsia-300 hover:text-white font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                      <span className="text-purple-200 font-bold block mb-1">Histórico Clínico & Patologias:</span>
                      <p className="text-white leading-relaxed font-medium">
                        {selectedPatient.anamnese?.clinicalHistory || 'Sem histórico patológico relatado.'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-amber-900/40 bg-amber-950/10">
                      <span className="text-amber-300 font-bold block mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        Alergias e Intolerâncias Alimentares:
                      </span>
                      <p className="text-amber-200 leading-relaxed font-semibold">
                        {selectedPatient.anamnese?.foodAllergiesAndIntolerances || 'Nenhuma alergia relatada.'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                      <span className="text-purple-200 font-bold block mb-1">Medicamentos & Suplementos em Uso:</span>
                      <p className="text-white leading-relaxed font-medium">
                        {selectedPatient.anamnese?.currentMedicationsAndSupplements || 'Nenhum medicamento informado.'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                      <span className="text-purple-200 font-bold block mb-1">Relação Emocional com a Comida:</span>
                      <p className="text-white leading-relaxed font-medium">
                        {selectedPatient.anamnese?.emotionalRelationshipWithFood || 'Equilibrada, sem relatos de compulsão alimentar.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-2 text-xs">
                    <span className="text-purple-200 font-bold block">Preferências e Aversões Alimentares:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-purple-100">
                      <div>
                        <strong className="text-emerald-300">Gosta:</strong> {selectedPatient.anamnese?.dietaryPreferences || 'Variadas e bem aceitas'}
                      </div>
                      <div>
                        <strong className="text-rose-300">Evita:</strong> {selectedPatient.anamnese?.dietaryAversions || 'Nenhuma aversão específica'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card de Hábitos, Rotina, Sono & Digestão */}
                <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 space-y-4 shadow-md">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-purple-900/40 pb-3">
                    <Activity className="w-4 h-4 text-purple-300" />
                    Rotina, Qualidade do Sono & Digestão
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                      <span className="text-purple-200 font-bold block">Rotina & Ocupação</span>
                      <p className="text-white font-medium mt-1">{selectedPatient.anamnese?.routineAndOccupation || 'Rotina comercial padrão'}</p>
                    </div>

                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                      <span className="text-purple-200 font-bold block">Sono Médio</span>
                      <p className="text-white font-black text-sm mt-1">{selectedPatient.anamnese?.sleepHoursPerNight || 7} horas/noite</p>
                    </div>

                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
                      <span className="text-purple-200 font-bold block">Hábito Intestinal</span>
                      <p className="text-fuchsia-300 font-bold mt-1 capitalize">
                        {(selectedPatient.anamnese?.bowelHabit || 'diario_normal').replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Coluna 3: Metas Energéticas & Cálculos */}
              <div className="space-y-6">
                
                {/* Card de Metas e Balanço Energético */}
                <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 space-y-4 shadow-md">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-purple-900/40 pb-3">
                    <Flame className="w-4 h-4 text-fuchsia-400" />
                    Balanço Energético & Hidratação
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
                      <div>
                        <span className="text-purple-200 font-bold block">Taxa Metabólica Basal (TMB)</span>
                        <span className="text-[10px] text-purple-300">Equação de Mifflin-St Jeor</span>
                      </div>
                      <span className="text-base font-black text-white">{tmb} kcal</span>
                    </div>

                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
                      <div>
                        <span className="text-purple-200 font-bold block">Gasto Energético Total (GET)</span>
                        <span className="text-[10px] text-purple-300">NAF {selectedPatient.activityFactor || 1.2}</span>
                      </div>
                      <span className="text-base font-black text-fuchsia-300">{getVal} kcal</span>
                    </div>

                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
                      <div>
                        <span className="text-purple-200 font-bold block flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Meta Hídrica Diária
                        </span>
                        <span className="text-[10px] text-purple-300">35ml por kg de peso</span>
                      </div>
                      <span className="text-base font-black text-cyan-300">{waterData.liters} L/dia</span>
                    </div>

                    <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
                      <div>
                        <span className="text-purple-200 font-bold block">Faixa de Peso Ideal (OMS)</span>
                        <span className="text-[10px] text-purple-300">IMC 18.5 a 24.9</span>
                      </div>
                      <span className="text-xs font-black text-white">
                        {selectedPatient.heightCm > 0 
                          ? `${(18.5 * Math.pow(heightM, 2)).toFixed(1)} - ${(24.9 * Math.pow(heightM, 2)).toFixed(1)} kg` 
                          : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onOpenNutriaWithPrompt(`Nutria, com base na TMB (${tmb} kcal) e GET (${getVal} kcal) do paciente ${selectedPatient.name}, calcule o déficit ou superávit calórico ideal para o objetivo de ${selectedPatient.objective} e apresente a distribuição recomendada de proteínas, carboidratos e lipídios em gramas por kg.`)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#29094e] hover:bg-[#380c6c] text-purple-100 font-bold text-xs border border-purple-700/60 flex items-center justify-center gap-2 transition-all hover:text-white"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                      <span>Calcular Macros com NUTRIA</span>
                    </button>
                  </div>
                </div>

                {/* Dossiê de Conduta Rápida */}
                <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-300" />
                      Conduta Clínica Atual
                    </h3>
                  </div>
                  <p className="text-xs text-purple-100 leading-relaxed font-medium">
                    {selectedPatient.notes || 'Paciente em acompanhamento nutricional personalizado para adequação metabólica e alcance de metas antropométricas.'}
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA: PLANO ALIMENTAR & MACROS                                  */}
        {/* ============================================================== */}
        {(activeTab === 'plano_alimentar' || activeTab === 'plano') && (
          <MealPlanEditor
            patient={selectedPatient}
            onUpdatePatient={onUpdatePatient}
            onOpenNutriaWithPrompt={onOpenNutriaWithPrompt}
            userAccount={userAccount}
          />
        )}

        {/* ============================================================== */}
        {/* MODAL: EDITAR PARÂMETROS CLÍNICOS & ANAMNESE                   */}
        {/* ============================================================== */}
        {isEditingClinical && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#17042b] border border-purple-700/80 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-950/80 text-fuchsia-400 border border-purple-700/60">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Editar Cadastro, Parâmetros Clínicos & Anamnese</h3>
                    <p className="text-xs text-purple-300">Atualização cadastral completa e recálculo dinâmico de TMB/GET</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingClinical(false)}
                  className="p-1.5 rounded-xl hover:bg-purple-900/40 text-purple-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. SEÇÃO: DADOS CADASTRAIS DO PACIENTE */}
              <div className="space-y-3 p-4 bg-[#120326]/80 rounded-2xl border border-purple-700/60">
                <div className="flex items-center gap-2 text-fuchsia-300 font-bold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4 text-fuchsia-400" />
                  <span>1. Dados Pessoais & Cadastrais</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-purple-200 font-bold block mb-1">Nome Completo do Paciente *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nome do paciente"
                      className="w-full bg-[#1b0633] border border-purple-700/80 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">E-mail *</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="paciente@email.com"
                      className="w-full bg-[#1b0633] border border-purple-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-[#1b0633] border border-purple-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-purple-200 font-bold block mb-1">Status do Paciente no Consultório:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditStatus('ativo')}
                        className={`py-2 px-3 font-bold rounded-xl border text-xs transition-all flex items-center justify-center gap-1.5 ${
                          editStatus === 'ativo'
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-sm'
                            : 'bg-[#1b0633] text-purple-300 border-purple-800/80 hover:bg-[#250947]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Ativo
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStatus('em_espera')}
                        className={`py-2 px-3 font-bold rounded-xl border text-xs transition-all flex items-center justify-center gap-1.5 ${
                          editStatus === 'em_espera'
                            ? 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-sm'
                            : 'bg-[#1b0633] text-purple-300 border-purple-800/80 hover:bg-[#250947]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Em Acompanhamento
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStatus('inativo')}
                        className={`py-2 px-3 font-bold rounded-xl border text-xs transition-all flex items-center justify-center gap-1.5 ${
                          editStatus === 'inativo'
                            ? 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-sm'
                            : 'bg-[#1b0633] text-purple-300 border-purple-800/80 hover:bg-[#250947]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                        Inativo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. SEÇÃO: PARÂMETROS CLÍNICOS E METABÓLICOS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-fuchsia-300 font-bold text-xs uppercase tracking-wider">
                  <Scale className="w-4 h-4 text-fuchsia-400" />
                  <span>2. Parâmetros Antropométricos & Clínicos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Gênero Biológico:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditGender('masculino')}
                        className={`py-2 font-bold rounded-xl border transition-all ${
                          editGender === 'masculino'
                            ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-500 shadow-sm'
                            : 'bg-[#1e073c] text-purple-200 border-purple-800'
                        }`}
                      >
                        Masc
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditGender('feminino')}
                        className={`py-2 font-bold rounded-xl border transition-all ${
                          editGender === 'feminino'
                            ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-500 shadow-sm'
                            : 'bg-[#1e073c] text-purple-200 border-purple-800'
                        }`}
                      >
                        Fem
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Idade (anos):</label>
                    <input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      placeholder="ex: 28"
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Objetivo Nutricional:</label>
                    <select
                      value={editObjective}
                      onChange={(e) => setEditObjective(e.target.value as PatientObjective)}
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-fuchsia-400"
                    >
                      <option value="emagrecimento">Emagrecimento</option>
                      <option value="hipertrofia">Hipertrofia</option>
                      <option value="recomposicao_corporal">Recomposição Corporal</option>
                      <option value="performance_esportiva">Performance Esportiva</option>
                      <option value="manejo_diabetes">Manejo Diabetes / Glicemia</option>
                      <option value="saude_cardiovascular">Saúde Cardiovascular</option>
                      <option value="saude_intestinal">Saúde Intestinal / FODMAPs</option>
                      <option value="vegetariano_vegano">Vegetariano / Vegano</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Peso Atual (kg):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      placeholder="ex: 75.0"
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-purple-200 font-bold">Altura:</label>
                      <span className="text-[10px] text-fuchsia-300 font-semibold">
                        {editHeightCm > 0 ? `${editHeightCm} cm` : 'cm ou m'}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={editHeight}
                      onChange={(e) => setEditHeight(e.target.value)}
                      placeholder="ex: 175 ou 1.75"
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Meta de Peso (kg):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editTargetWeight}
                      onChange={(e) => setEditTargetWeight(e.target.value)}
                      placeholder="ex: 70.0"
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">% Gordura Corporal:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editBf}
                      onChange={(e) => setEditBf(e.target.value)}
                      placeholder="ex: 15.0"
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-purple-200 font-bold block mb-1">Nível de Atividade Física (NAF):</label>
                    <select
                      value={editNaf}
                      onChange={(e) => setEditNaf(Number(e.target.value))}
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-fuchsia-400"
                    >
                      <option value={1.2}>Sedentário (Pouco ou nenhum exercício) • 1.20</option>
                      <option value={1.375}>Levemente Ativo (Treino 1-3 dias/semana) • 1.375</option>
                      <option value={1.55}>Moderadamente Ativo (Treino 3-5 dias/semana) • 1.55</option>
                      <option value={1.725}>Muito Ativo (Treino intenso 6-7 dias/semana) • 1.725</option>
                      <option value={1.9}>Extremamente Ativo (Atleta de alto rendimento) • 1.90</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. SEÇÃO: ANAMNESE DETALHADA */}
              <div className="space-y-3 pt-3 border-t border-purple-800/60 text-xs">
                <div className="flex items-center gap-2 text-fuchsia-300 font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-fuchsia-400" />
                  <span>3. Anamnese & Histórico Clínico</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Histórico Clínico / Patologias:</label>
                    <input
                      type="text"
                      value={editClinicalHistory}
                      onChange={(e) => setEditClinicalHistory(e.target.value)}
                      placeholder="Patologias, cirurgias, histórico familiar..."
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Alergias e Intolerâncias:</label>
                    <input
                      type="text"
                      value={editAllergies}
                      onChange={(e) => setEditAllergies(e.target.value)}
                      placeholder="Lactose, glúten, frutos do mar..."
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Medicamentos e Suplementos em Uso:</label>
                    <input
                      type="text"
                      value={editMedications}
                      onChange={(e) => setEditMedications(e.target.value)}
                      placeholder="Medicamentos contínuos, dosagens..."
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Rotina & Ocupação:</label>
                    <input
                      type="text"
                      value={editRoutine}
                      onChange={(e) => setEditRoutine(e.target.value)}
                      placeholder="Horários de trabalho, deslocamento..."
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Preferências Alimentares:</label>
                    <input
                      type="text"
                      value={editPreferences}
                      onChange={(e) => setEditPreferences(e.target.value)}
                      placeholder="Alimentos favoritos..."
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Aversões Alimentares:</label>
                    <input
                      type="text"
                      value={editAversions}
                      onChange={(e) => setEditAversions(e.target.value)}
                      placeholder="Alimentos que não consome..."
                      className="w-full bg-[#120326] border border-purple-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Calculations Preview */}
              <div className="p-4 bg-[#120326] rounded-2xl border border-fuchsia-500/30 space-y-2">
                <span className="text-[10px] text-fuchsia-300 uppercase font-black tracking-wider block">
                  Prévia dos Cálculos Dinâmicos (Mifflin-St Jeor)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-[#1d0637] p-2 rounded-xl">
                    <span className="text-[10px] text-purple-200 font-bold block">IMC</span>
                    <span className="font-black text-white">{editBmiData.bmi > 0 ? editBmiData.bmi : '-'}</span>
                  </div>
                  <div className="bg-[#1d0637] p-2 rounded-xl">
                    <span className="text-[10px] text-purple-200 font-bold block">TMB</span>
                    <span className="font-black text-white">{editTmb > 0 ? `${editTmb} kcal` : '-'}</span>
                  </div>
                  <div className="bg-[#1d0637] p-2 rounded-xl">
                    <span className="text-[10px] text-fuchsia-300 font-bold block">GET Total</span>
                    <span className="font-black text-fuchsia-300">{editGet > 0 ? `${editGet} kcal` : '-'}</span>
                  </div>
                  <div className="bg-[#1d0637] p-2 rounded-xl">
                    <span className="text-[10px] text-purple-200 font-bold block">Meta Hídrica</span>
                    <span className="font-black text-cyan-300">{editWater.liters > 0 ? `${editWater.liters} L` : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-purple-800/60">
                {/* Botão de Exclusão Definitiva */}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 border border-rose-800/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                >
                  <Trash2 className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span>Excluir Paciente</span>
                </button>

                {/* Botões de Ação */}
                <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingClinical(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-[#220743] hover:bg-[#2d0959] text-purple-200 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveClinicalParams}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-fuchsia-950/60 transition-all border border-fuchsia-400/40 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE PACIENTE                     */}
        {/* ============================================================== */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-[#1b0633] border border-rose-600/80 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-700/80 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-7 h-7 text-rose-400 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Excluir Paciente Definitivamente?</h3>
                <p className="text-xs text-purple-200/90 mt-2 leading-relaxed">
                  Você está prestes a excluir o paciente <strong className="text-white font-bold">{selectedPatient?.name}</strong>.
                </p>
                <div className="mt-3 p-3 bg-rose-950/40 rounded-xl border border-rose-900/60 text-[11px] text-rose-300 text-left space-y-1">
                  <p className="font-semibold text-rose-200">Atenção (Ação Irreversível):</p>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-300/90">
                    <li>Todo o prontuário eletrônico será apagado</li>
                    <li>Planos alimentares e prescrições serão removidos</li>
                    <li>Consultas e histórico antropométrico serão excluídos</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-[#250947] hover:bg-[#320d5c] text-purple-200 rounded-xl text-xs font-bold transition-all border border-purple-800/80"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeletePatientConfirm}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/60 transition-all border border-rose-400/50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sim, Excluir</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: NOVA MEDIÇÃO ANTROPOMÉTRICA                            */}
        {/* ============================================================== */}
        {isAddingAntro && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#17042b] border border-purple-700/80 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-fuchsia-400" />
                  Nova Avaliação Antropométrica
                </h3>
                <button onClick={() => setIsAddingAntro(false)} className="text-purple-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-purple-200 font-bold block mb-1">Peso Atual (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAntroWeight}
                    onChange={(e) => setNewAntroWeight(e.target.value)}
                    placeholder="ex: 78.5"
                    className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
                <div>
                  <label className="text-purple-200 font-bold block mb-1">% Gordura Corporal</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAntroBf}
                    onChange={(e) => setNewAntroBf(e.target.value)}
                    placeholder="ex: 14.5"
                    className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
                <div>
                  <label className="text-purple-200 font-bold block mb-1">% Massa Muscular</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAntroMuscle}
                    onChange={(e) => setNewAntroMuscle(e.target.value)}
                    placeholder="ex: 42.0"
                    className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
                <div>
                  <label className="text-purple-200 font-bold block mb-1">Circunferência Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newAntroWaist}
                    onChange={(e) => setNewAntroWaist(e.target.value)}
                    placeholder="ex: 82.0"
                    className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-purple-200 font-bold block mb-1">Observações Clínicas / Retorno</label>
                  <input
                    type="text"
                    value={newAntroNotes}
                    onChange={(e) => setNewAntroNotes(e.target.value)}
                    placeholder="Aderência ao plano, queixas, metas alcançadas..."
                    className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-purple-800/40">
                <button
                  onClick={() => setIsAddingAntro(false)}
                  className="px-4 py-2 text-xs font-bold text-purple-200 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAnthropometry}
                  className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Salvar Avaliação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: NOVA PRESCRIÇÃO / SUPLEMENTAÇÃO                         */}
        {/* ============================================================== */}
        {isAddingPrescription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#17042b] border border-purple-700/80 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Pill className="w-5 h-5 text-fuchsia-400" />
                  Cadastrar Prescrição / Fórmula Manipulada
                </h3>
                <button onClick={() => setIsAddingPrescription(false)} className="text-purple-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Presets Rápidos */}
              <div className="p-3 bg-[#120326] rounded-2xl border border-purple-800/60 space-y-2">
                <span className="text-[11px] text-fuchsia-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Fórmulas Sugeridas com 1 Clique:
                </span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleLoadPresetPrescription('mitocondrial')}
                    className="px-2.5 py-1 rounded-lg bg-[#250849] hover:bg-[#340b67] text-purple-200 border border-purple-700 font-semibold"
                  >
                    ⚡ Mitocondrial & Energia
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPresetPrescription('sono')}
                    className="px-2.5 py-1 rounded-lg bg-[#250849] hover:bg-[#340b67] text-purple-200 border border-purple-700 font-semibold"
                  >
                    🌙 Sono Reparador & GABA
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPresetPrescription('intestinal')}
                    className="px-2.5 py-1 rounded-lg bg-[#250849] hover:bg-[#340b67] text-purple-200 border border-purple-700 font-semibold"
                  >
                    🛡️ Barreira Intestinal & Probióticos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPresetPrescription('hipertrofia')}
                    className="px-2.5 py-1 rounded-lg bg-[#250849] hover:bg-[#340b67] text-purple-200 border border-purple-700 font-semibold"
                  >
                    💪 Creatina & Performance
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-purple-200 font-bold block mb-1">Título da Prescrição / Protocolo *</label>
                  <input
                    type="text"
                    value={newRxTitle}
                    onChange={(e) => setNewRxTitle(e.target.value)}
                    placeholder="ex: Protocolo Antioxidante e Otimização Mitocondrial"
                    className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Tipo de Prescrição:</label>
                    <select
                      value={newRxType}
                      onChange={(e) => setNewRxType(e.target.value as any)}
                      className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-fuchsia-400"
                    >
                      <option value="manipulado">Fórmula Manipulada</option>
                      <option value="fitoterapico">Fitoterápico</option>
                      <option value="suplemento_esportivo">Suplementação Esportiva</option>
                      <option value="vitaminas_minerais">Vitaminas & Minerais</option>
                      <option value="personalizado">Protocolo Personalizado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Instruções Gerais:</label>
                    <input
                      type="text"
                      value={newRxInstructions}
                      onChange={(e) => setNewRxInstructions(e.target.value)}
                      placeholder="ex: Tomar 1 cápsula pela manhã..."
                      className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>
                </div>

                {/* Itens da Prescrição */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-fuchsia-300 uppercase">Compostos e Ativos da Fórmula:</span>
                    <button
                      type="button"
                      onClick={() => setNewRxItems(prev => [...prev, { id: `it-${Date.now()}`, name: '', dosage: '', form: 'capsula', posology: '', indication: '' }])}
                      className="text-xs text-fuchsia-300 hover:text-white font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Ativo
                    </button>
                  </div>

                  {newRxItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 bg-[#120326] rounded-xl border border-purple-800/40 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...newRxItems];
                              updated[idx].name = e.target.value;
                              setNewRxItems(updated);
                            }}
                            placeholder="Nome do ativo (ex: Coenzima Q10)"
                            className="w-full bg-[#1d0637] border border-purple-700 rounded-lg p-2 text-white font-semibold"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.dosage}
                            onChange={(e) => {
                              const updated = [...newRxItems];
                              updated[idx].dosage = e.target.value;
                              setNewRxItems(updated);
                            }}
                            placeholder="Dosagem (ex: 100mg)"
                            className="w-full bg-[#1d0637] border border-purple-700 rounded-lg p-2 text-white font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <select
                            value={item.form}
                            onChange={(e) => {
                              const updated = [...newRxItems];
                              updated[idx].form = e.target.value as any;
                              setNewRxItems(updated);
                            }}
                            className="w-full bg-[#1d0637] border border-purple-700 rounded-lg p-2 text-white text-xs"
                          >
                            <option value="capsula">Cápsula</option>
                            <option value="po">Pó / Dosador</option>
                            <option value="sache">Sachê</option>
                            <option value="gotas">Gotas</option>
                            <option value="comprimido">Comprimido</option>
                            <option value="shot">Shot</option>
                            <option value="flaconete">Flaconete</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={item.posology}
                            onChange={(e) => {
                              const updated = [...newRxItems];
                              updated[idx].posology = e.target.value;
                              setNewRxItems(updated);
                            }}
                            placeholder="Posologia (ex: 1 dose ao acordar com água)"
                            className="w-full bg-[#1d0637] border border-purple-700 rounded-lg p-2 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-purple-800/40">
                <button
                  onClick={() => setIsAddingPrescription(false)}
                  className="px-4 py-2 text-xs font-bold text-purple-200 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePrescription}
                  className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Salvar Prescrição
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: NOVO EXAME LABORATORIAL                                */}
        {/* ============================================================== */}
        {isAddingExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#17042b] border border-purple-700/80 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-fuchsia-400" />
                  Cadastrar Exames Laboratoriais
                </h3>
                <button onClick={() => setIsAddingExam(false)} className="text-purple-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Título do Painel *</label>
                    <input
                      type="text"
                      value={newExamTitle}
                      onChange={(e) => setNewExamTitle(e.target.value)}
                      placeholder="ex: Perfil Metabólico & Hormonal Completo"
                      className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>
                  <div>
                    <label className="text-purple-200 font-bold block mb-1">Laboratório / Clínica</label>
                    <input
                      type="text"
                      value={newExamLab}
                      onChange={(e) => setNewExamLab(e.target.value)}
                      placeholder="ex: Laboratório Dasa / Fleury"
                      className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-purple-200 font-bold block mb-1">Data da Coleta</label>
                  <input
                    type="date"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                  />
                </div>

                {/* Marcadores */}
                <div className="space-y-2 pt-2">
                  <span className="font-bold text-fuchsia-300 uppercase block">Marcadores Bioquímicos:</span>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {newExamMarkers.map((marker, mIdx) => (
                      <div key={marker.id || mIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-2 bg-[#120326] rounded-xl border border-purple-800/40">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={marker.marker}
                            onChange={(e) => {
                              const updated = [...newExamMarkers];
                              updated[mIdx].marker = e.target.value;
                              setNewExamMarkers(updated);
                            }}
                            placeholder="Nome do marcador"
                            className="w-full bg-[#1d0637] border border-purple-700 rounded-lg p-2 text-white font-semibold"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={marker.value}
                            onChange={(e) => {
                              const updated = [...newExamMarkers];
                              updated[mIdx].value = e.target.value;
                              setNewExamMarkers(updated);
                            }}
                            placeholder="Resultado (ex: 85)"
                            className="w-full bg-[#1d0637] border border-purple-700 rounded-lg p-2 text-white font-bold"
                          />
                        </div>
                        <div>
                          <select
                            value={marker.status}
                            onChange={(e) => {
                              const updated = [...newExamMarkers];
                              updated[mIdx].status = e.target.value as any;
                              setNewExamMarkers(updated);
                            }}
                            className="w-full bg-[#1d0637] border border-purple-700 rounded-lg p-2 text-white"
                          >
                            <option value="normal">Normal</option>
                            <option value="baixo">Baixo</option>
                            <option value="elevado">Elevado</option>
                            <option value="critico">Crítico</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-purple-200 font-bold block mb-1">Parecer Clínico / Laudo</label>
                  <textarea
                    rows={2}
                    value={newExamReview}
                    onChange={(e) => setNewExamReview(e.target.value)}
                    placeholder="Conclusões clínicas, conduta de suplementação..."
                    className="w-full bg-[#120326] border border-purple-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-fuchsia-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-purple-800/40">
                <button
                  onClick={() => setIsAddingExam(false)}
                  className="px-4 py-2 text-xs font-bold text-purple-200 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveExam}
                  className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Salvar Exame
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification no Prontuário */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 p-4 rounded-2xl bg-[#1b0633] border border-fuchsia-500/80 shadow-2xl text-white text-xs font-semibold shadow-purple-950/80 animate-in fade-in slide-in-from-bottom-5">
            <div className={`p-1.5 rounded-xl ${toastMessage.type === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50' : 'bg-rose-950 text-rose-400 border border-rose-600/50'}`}>
              {toastMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-purple-300 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // VIEW: LISTA DE PACIENTES CADASTRADOS
  // ==========================================
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-fuchsia-400" />
            Gestão de Pacientes & Prontuários Integrados
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            Total de <strong className="text-white">{patients.length} pacientes</strong> cadastrados no prontuário eletrônico do NutrinK.
          </p>
        </div>

        <button
          onClick={onOpenNewPatient}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/50 transition-all self-start sm:self-auto border border-fuchsia-400/40"
          id="btn-add-patient-main"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone ou email..."
            className="w-full bg-[#1e073c] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-purple-300/60 focus:outline-none focus:border-fuchsia-400"
            id="input-search-patients"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-none">
          <Filter className="w-4 h-4 text-purple-300 shrink-0" />
          <span className="text-xs text-purple-200 font-bold shrink-0">Objetivo:</span>
          {['todos', 'hipertrofia', 'emagrecimento', 'manejo_diabetes', 'performance_esportiva', 'vegetariano_vegano'].map((obj) => (
            <button
              key={obj}
              onClick={() => setObjectiveFilter(obj)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                objectiveFilter === obj
                  ? 'bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-500/60 shadow-sm'
                  : 'bg-[#220743] text-purple-200 hover:text-white border border-purple-800/40'
              }`}
            >
              {obj === 'todos' ? 'Todos' : obj.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.length === 0 ? (
          <div className="col-span-full py-16 px-6 text-center bg-[#150328] border border-purple-900/50 rounded-3xl space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-700/60 text-fuchsia-400 flex items-center justify-center mx-auto shadow-inner">
              <Users className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold text-white">Sua lista de pacientes está vazia</h3>
              <p className="text-xs sm:text-sm text-purple-200">
                Cadastre seu primeiro paciente para iniciar o prontuário eletrônico integrado com 5 abas clínicas, prescrição de manipulados, exames e acompanhamento com o copiloto NUTRIA.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenNewPatient}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40 transition-all hover:scale-105"
                id="btn-cadastrar-primeiro-paciente"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Primeiro Paciente</span>
              </button>
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-purple-200 bg-[#150328] border border-purple-900/50 rounded-3xl">
            Nenhum paciente encontrado com os filtros aplicados.
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className="bg-[#150328] border border-purple-900/50 hover:border-fuchsia-500/60 rounded-3xl p-5 cursor-pointer transition-all hover:translate-y-[-2px] group relative shadow-md"
              id={`patient-card-${patient.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-950/60 border border-fuchsia-400/30">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-fuchsia-300 transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-purple-200 mt-0.5 font-medium">
                      {patient.age > 0 ? `${patient.age} anos` : 'Idade não informada'} • {patient.gender === 'masculino' ? 'Masc' : 'Fem'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    patient.status === 'ativo'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700/50'
                      : patient.status === 'em_espera'
                      ? 'bg-amber-950 text-amber-300 border-amber-700/50'
                      : 'bg-rose-950 text-rose-300 border-rose-700/50'
                  }`}>
                    {patient.status === 'ativo' ? 'Ativo' : patient.status === 'em_espera' ? 'Em Acomp.' : 'Inativo'}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#29094e] text-fuchsia-200 border border-purple-700/60">
                    {patient.objective.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-purple-900/40 text-center">
                <div className="bg-[#1d0637] p-2 rounded-xl">
                  <span className="text-[10px] text-purple-200 font-semibold block">Peso</span>
                  <span className="text-xs font-black text-white">
                    {patient.currentWeightKg > 0 ? `${patient.currentWeightKg} kg` : '-'}
                  </span>
                </div>
                <div className="bg-[#1d0637] p-2 rounded-xl">
                  <span className="text-[10px] text-purple-200 font-semibold block">IMC</span>
                  <span className="text-xs font-black text-fuchsia-300">
                    {patient.bmi > 0 ? patient.bmi : '-'}
                  </span>
                </div>
                <div className="bg-[#1d0637] p-2 rounded-xl">
                  <span className="text-[10px] text-purple-200 font-semibold block">% Gordura</span>
                  <span className="text-xs font-black text-white">
                    {patient.bodyFatPercentage > 0 ? `${patient.bodyFatPercentage}%` : '-'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-purple-200 pt-2 border-t border-purple-900/30 font-medium">
                <span className="truncate max-w-[200px]">{patient.phone}</span>
                <span className="text-fuchsia-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Abrir Prontuário <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 p-4 rounded-2xl bg-[#1b0633] border border-fuchsia-500/80 shadow-2xl text-white text-xs font-semibold shadow-purple-950/80 animate-in fade-in slide-in-from-bottom-5">
          <div className={`p-1.5 rounded-xl ${toastMessage.type === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50' : 'bg-rose-950 text-rose-400 border border-rose-600/50'}`}>
            {toastMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-purple-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
