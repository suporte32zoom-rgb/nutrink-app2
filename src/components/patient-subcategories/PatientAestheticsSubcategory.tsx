import React, { useState } from 'react';
import { 
  Camera, 
  TrendingUp, 
  Plus, 
  Scale, 
  Layers, 
  Sparkles, 
  Calendar, 
  Eye, 
  SplitSquareHorizontal, 
  Sliders, 
  Award, 
  Check, 
  Trash2, 
  Activity, 
  ArrowRight,
  Flame,
  User,
  Maximize2
} from 'lucide-react';
import { Patient, AnthropometricRecord, PatientEvolutionPhoto } from '../../types';
import { calculateBMI, calculateMifflinTMB, calculateGET } from '../../utils/nutritionCalculations';

interface PatientAestheticsSubcategoryProps {
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
}

export const PatientAestheticsSubcategory: React.FC<PatientAestheticsSubcategoryProps> = ({
  patient,
  onUpdatePatient,
  onOpenNutriaWithPrompt
}) => {
  // Estado para Nova Avaliação Antropométrica
  const [isAddingAntro, setIsAddingAntro] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newBf, setNewBf] = useState('');
  const [newMuscle, setNewMuscle] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newHip, setNewHip] = useState('');
  const [newArm, setNewArm] = useState('');
  const [newThigh, setNewThigh] = useState('');
  const [newTriceps, setNewTriceps] = useState('');
  const [newSubscapular, setNewSubscapular] = useState('');
  const [newSuprailiac, setNewSuprailiac] = useState('');
  const [newAbdominal, setNewAbdominal] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Fotos de Antes e Depois do Paciente
  const defaultPhotos: PatientEvolutionPhoto[] = patient.evolutionPhotos || [
    {
      id: 'photo-1',
      date: '2026-01-15',
      pose: 'frente',
      photoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
      weightKg: patient.initialWeightKg || 78.5,
      bodyFatPercentage: 26.8,
      notes: 'Avaliação Inicial - Início do protocolo NutrinK'
    },
    {
      id: 'photo-2',
      date: '2026-09-10',
      pose: 'frente',
      photoUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
      weightKg: patient.currentWeightKg || 71.2,
      bodyFatPercentage: patient.bodyFatPercentage || 19.5,
      notes: 'Avaliação Atual - 8 meses de acompanhamento consistente'
    }
  ];

  const [photosList, setPhotosList] = useState<PatientEvolutionPhoto[]>(defaultPhotos);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoPose, setNewPhotoPose] = useState<PatientEvolutionPhoto['pose']>('frente');
  const [newPhotoDate, setNewPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPhotoWeight, setNewPhotoWeight] = useState(String(patient.currentWeightKg || ''));
  const [newPhotoBf, setNewPhotoBf] = useState(String(patient.bodyFatPercentage || ''));
  const [newPhotoNotes, setNewPhotoNotes] = useState('');

  // Estados do Comparador Lado a Lado
  const [photoAId, setPhotoAId] = useState<string>(defaultPhotos[0]?.id || '');
  const [photoBId, setPhotoBId] = useState<string>(defaultPhotos[1]?.id || defaultPhotos[0]?.id || '');
  const [isComparisonMode, setIsComparisonMode] = useState(true);

  const selectedPhotoA = photosList.find(p => p.id === photoAId) || photosList[0];
  const selectedPhotoB = photosList.find(p => p.id === photoBId) || photosList[photosList.length - 1];

  // Cálculo da variação do comparador
  const weightDelta = (selectedPhotoB?.weightKg && selectedPhotoA?.weightKg)
    ? selectedPhotoB.weightKg - selectedPhotoA.weightKg
    : null;

  const bfDelta = (selectedPhotoB?.bodyFatPercentage && selectedPhotoA?.bodyFatPercentage)
    ? selectedPhotoB.bodyFatPercentage - selectedPhotoA.bodyFatPercentage
    : null;

  const handleSaveAnthropometry = () => {
    if (!newWeight) return;
    const weightNum = parseFloat(newWeight);
    const heightCm = patient.heightCm || 170;
    const bmiData = calculateBMI(weightNum, heightCm);
    const bfNum = newBf ? parseFloat(newBf) : patient.bodyFatPercentage;
    const muscleNum = newMuscle ? parseFloat(newMuscle) : patient.muscleMassPercentage;
    const newTmb = calculateMifflinTMB(patient.gender, weightNum, heightCm, patient.age);
    const newGet = calculateGET(newTmb, patient.activityFactor || 1.2);

    const newRecord: AnthropometricRecord = {
      id: `ev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: weightNum,
      heightCm: heightCm,
      bmi: bmiData.bmi,
      bodyFatPercentage: bfNum,
      muscleMassPercentage: muscleNum,
      waistCircumferenceCm: newWaist ? parseFloat(newWaist) : undefined,
      hipCircumferenceCm: newHip ? parseFloat(newHip) : undefined,
      armCircumferenceCm: newArm ? parseFloat(newArm) : undefined,
      thighCircumferenceCm: newThigh ? parseFloat(newThigh) : undefined,
      tricepsFoldMm: newTriceps ? parseFloat(newTriceps) : undefined,
      subscapularFoldMm: newSubscapular ? parseFloat(newSubscapular) : undefined,
      suprailiacFoldMm: newSuprailiac ? parseFloat(newSuprailiac) : undefined,
      abdominalFoldMm: newAbdominal ? parseFloat(newAbdominal) : undefined,
      notes: newNotes.trim() || 'Acompanhamento antropométrico'
    };

    const updated: Patient = {
      ...patient,
      currentWeightKg: weightNum,
      bmi: bmiData.bmi,
      tmb: newTmb,
      get: newGet,
      bodyFatPercentage: bfNum,
      muscleMassPercentage: muscleNum,
      evolutionHistory: [newRecord, ...(patient.evolutionHistory || [])]
    };

    onUpdatePatient(updated);
    setIsAddingAntro(false);
    setNewWeight('');
    setNewBf('');
    setNewMuscle('');
    setNewWaist('');
    setNewHip('');
    setNewArm('');
    setNewThigh('');
    setNewTriceps('');
    setNewSubscapular('');
    setNewSuprailiac('');
    setNewAbdominal('');
    setNewNotes('');
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;

    const newPhoto: PatientEvolutionPhoto = {
      id: `photo-${Date.now()}`,
      date: newPhotoDate,
      pose: newPhotoPose,
      photoUrl: newPhotoUrl.trim(),
      weightKg: parseFloat(newPhotoWeight) || patient.currentWeightKg,
      bodyFatPercentage: parseFloat(newPhotoBf) || patient.bodyFatPercentage,
      notes: newPhotoNotes.trim()
    };

    const updatedPhotos = [newPhoto, ...photosList];
    setPhotosList(updatedPhotos);

    onUpdatePatient({
      ...patient,
      evolutionPhotos: updatedPhotos
    });

    setNewPhotoUrl('');
    setNewPhotoNotes('');
    setIsAddingPhoto(false);
  };

  const handleDeletePhoto = (id: string) => {
    const updated = photosList.filter(p => p.id !== id);
    setPhotosList(updated);
    onUpdatePatient({
      ...patient,
      evolutionPhotos: updatedPhotos
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Bloco de Evolução Estética */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/60 text-fuchsia-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Evolução Estética, Antropometria & Comparador de Fotos
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Registro de composição corporal, bioimpedância, dobras cutâneas e galeria comparativa de "Antes e Depois" lado a lado
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddingAntro(!isAddingAntro)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all border border-fuchsia-400/40"
              id="btn-new-anthropometric-eval"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingAntro ? 'Fechar' : '+ Nova Avaliação Física'}</span>
            </button>

            <button
              onClick={() => setIsAddingPhoto(!isAddingPhoto)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-100 border border-purple-700/60 rounded-xl text-xs font-bold"
              id="btn-upload-patient-photo"
            >
              <Camera className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>+ Adicionar Foto</span>
            </button>

            <button
              onClick={() => onOpenNutriaWithPrompt(`Nutria, analise a evolução estética e antropométrica de ${patient.name} (Peso inicial: ${patient.initialWeightKg}kg, Peso atual: ${patient.currentWeightKg}kg, Meta: ${patient.targetWeightKg}kg, % Gordura: ${patient.bodyFatPercentage}%) e gere um relatório de progresso para apresentar na consulta.`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-fuchsia-200 border border-fuchsia-500/40 rounded-xl text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Laudo Antropométrico NUTRIA</span>
            </button>
          </div>
        </div>

        {/* Resumo de Metas Físicas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
            <span className="text-[11px] text-purple-300 font-bold uppercase block">Peso Inicial</span>
            <p className="text-xl font-black text-white mt-1">
              {patient.initialWeightKg > 0 ? `${patient.initialWeightKg} kg` : '-'}
            </p>
            <span className="text-[10px] text-purple-300">Início do protocolo</span>
          </div>

          <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
            <span className="text-[11px] text-purple-300 font-bold uppercase block">Peso Atual</span>
            <p className="text-xl font-black text-fuchsia-300 mt-1">
              {patient.currentWeightKg > 0 ? `${patient.currentWeightKg} kg` : '-'}
            </p>
            {patient.initialWeightKg > 0 && patient.currentWeightKg > 0 && (
              <span className={`text-[11px] font-bold ${patient.currentWeightKg < patient.initialWeightKg ? 'text-emerald-400' : 'text-amber-400'}`}>
                Δ {(patient.currentWeightKg - patient.initialWeightKg).toFixed(1)} kg
              </span>
            )}
          </div>

          <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
            <span className="text-[11px] text-purple-300 font-bold uppercase block">% Gordura Atual</span>
            <p className="text-xl font-black text-white mt-1">
              {patient.bodyFatPercentage > 0 ? `${patient.bodyFatPercentage}%` : '-'}
            </p>
            <span className="text-[10px] text-purple-300">Massa Gorda</span>
          </div>

          <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center">
            <span className="text-[11px] text-purple-300 font-bold uppercase block">Meta Alvo</span>
            <p className="text-xl font-black text-emerald-400 mt-1">
              {patient.targetWeightKg > 0 ? `${patient.targetWeightKg} kg` : '-'}
            </p>
            <span className="text-[10px] text-emerald-300 font-medium">Objetivo final</span>
          </div>
        </div>

        {/* Modal de Nova Avaliação Antropométrica */}
        {isAddingAntro && (
          <div className="mt-5 p-5 bg-[#1d0637] rounded-2xl border border-fuchsia-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-fuchsia-400" />
                Registrar Nova Avaliação Antropométrica & Medidas
              </h4>
              <button onClick={() => setIsAddingAntro(false)} className="text-xs text-purple-300 hover:text-white">
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-purple-200 font-bold block mb-1">Peso Atual (kg): *</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Ex: 72.5"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">% Gordura (BF):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newBf}
                  onChange={(e) => setNewBf(e.target.value)}
                  placeholder="Ex: 21.4"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">% Massa Muscular:</label>
                <input
                  type="number"
                  step="0.1"
                  value={newMuscle}
                  onChange={(e) => setNewMuscle(e.target.value)}
                  placeholder="Ex: 34.0"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Cintura (cm):</label>
                <input
                  type="number"
                  step="0.5"
                  value={newWaist}
                  onChange={(e) => setNewWaist(e.target.value)}
                  placeholder="Ex: 78.0"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Quadril (cm):</label>
                <input
                  type="number"
                  step="0.5"
                  value={newHip}
                  onChange={(e) => setNewHip(e.target.value)}
                  placeholder="Ex: 102.0"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Braço Relaxado (cm):</label>
                <input
                  type="number"
                  step="0.5"
                  value={newArm}
                  onChange={(e) => setNewArm(e.target.value)}
                  placeholder="Ex: 31.5"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Dobra Tricipital (mm):</label>
                <input
                  type="number"
                  step="0.5"
                  value={newTriceps}
                  onChange={(e) => setNewTriceps(e.target.value)}
                  placeholder="Ex: 12.0"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Dobra Abdominal (mm):</label>
                <input
                  type="number"
                  step="0.5"
                  value={newAbdominal}
                  onChange={(e) => setNewAbdominal(e.target.value)}
                  placeholder="Ex: 18.0"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-purple-200 font-bold block mb-1 text-xs">Observações do Nutricionista:</label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Ex: Redução expressiva de retenção hídrica e melhora do tônus..."
                className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleSaveAnthropometry}
                disabled={!newWeight}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Salvar Avaliação Física
              </button>
            </div>
          </div>
        )}

        {/* Modal de Adicionar Foto de Evolução */}
        {isAddingPhoto && (
          <div className="mt-5 p-5 bg-[#1d0637] rounded-2xl border border-fuchsia-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-fuchsia-400" />
                Adicionar Nova Foto de Antes / Depois
              </h4>
              <button onClick={() => setIsAddingPhoto(false)} className="text-xs text-purple-300 hover:text-white">
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-purple-200 font-bold block mb-1">URL da Foto ou Upload:</label>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://... ou cole a imagem"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Posição / Pose:</label>
                <select
                  value={newPhotoPose}
                  onChange={(e) => setNewPhotoPose(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-purple-200 border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                >
                  <option value="frente">Frente</option>
                  <option value="costas">Costas</option>
                  <option value="perfil_direito">Perfil Direito</option>
                  <option value="perfil_esquerdo">Perfil Esquerdo</option>
                </select>
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Data da Foto:</label>
                <input
                  type="date"
                  value={newPhotoDate}
                  onChange={(e) => setNewPhotoDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-purple-200 border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Peso na Data (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newPhotoWeight}
                  onChange={(e) => setNewPhotoWeight(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">% Gordura na Data:</label>
                <input
                  type="number"
                  step="0.1"
                  value={newPhotoBf}
                  onChange={(e) => setNewPhotoBf(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleAddPhoto}
                disabled={!newPhotoUrl.trim()}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Salvar Foto na Galeria
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* O GRANDE DIFERENCIAL: COMPARADOR LADO A LADO DE FOTOS          */}
      {/* ============================================================== */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md">
                <SplitSquareHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">
                  Comparador Lado a Lado de Fotos (Antes vs Depois)
                </h4>
                <p className="text-xs text-purple-200 mt-0.5">
                  Selecione duas avaliações de datas diferentes para comparar a transformação estética na mesma tela durante o atendimento
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {weightDelta !== null && (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-600/60 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <span>Variação Total:</span>
                <span className="text-white font-black">{weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg</span>
                {bfDelta !== null && (
                  <span className="text-emerald-300">({bfDelta > 0 ? '+' : ''}{bfDelta.toFixed(1)}% BF)</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seletores das Fotos A e B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
            <span className="text-xs text-purple-200 font-bold">Foto 1 (Inicial / Antes):</span>
            <select
              value={photoAId}
              onChange={(e) => setPhotoAId(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#120326] text-purple-200 border border-purple-700/60 focus:outline-none"
            >
              {photosList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.date} • {p.pose.toUpperCase()} ({p.weightKg} kg)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
            <span className="text-xs text-fuchsia-300 font-bold">Foto 2 (Atual / Depois):</span>
            <select
              value={photoBId}
              onChange={(e) => setPhotoBId(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#120326] text-purple-200 border border-purple-700/60 focus:outline-none"
            >
              {photosList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.date} • {p.pose.toUpperCase()} ({p.weightKg} kg)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visualizador Comparativo Lado a Lado */}
        {photosList.length >= 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Foto 1 (Antes) */}
            <div className="bg-[#120326] rounded-3xl border border-purple-800/60 overflow-hidden shadow-lg group relative">
              <div className="p-3.5 bg-[#1d0637] border-b border-purple-800/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-purple-950 text-purple-300 border border-purple-700/60">
                    Foto Inicial • {selectedPhotoA?.pose}
                  </span>
                  <p className="text-xs text-white font-bold mt-1">{selectedPhotoA?.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white block">{selectedPhotoA?.weightKg} kg</span>
                  <span className="text-[10px] text-purple-300">{selectedPhotoA?.bodyFatPercentage}% Gordura</span>
                </div>
              </div>

              <div className="h-80 sm:h-96 w-full relative bg-purple-950/40 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhotoA?.photoUrl}
                  alt="Foto Antes"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {selectedPhotoA?.notes && (
                <div className="p-3 bg-[#1d0637] text-xs text-purple-200 italic border-t border-purple-800/40">
                  "{selectedPhotoA.notes}"
                </div>
              )}
            </div>

            {/* Foto 2 (Depois) */}
            <div className="bg-[#120326] rounded-3xl border-2 border-fuchsia-500/60 overflow-hidden shadow-xl shadow-fuchsia-950/40 group relative">
              <div className="p-3.5 bg-gradient-to-r from-purple-900 to-[#1d0637] border-b border-fuchsia-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/60">
                    Foto Atual • {selectedPhotoB?.pose}
                  </span>
                  <p className="text-xs text-white font-bold mt-1">{selectedPhotoB?.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-fuchsia-300 block">{selectedPhotoB?.weightKg} kg</span>
                  <span className="text-[10px] text-emerald-300 font-bold">{selectedPhotoB?.bodyFatPercentage}% Gordura</span>
                </div>
              </div>

              <div className="h-80 sm:h-96 w-full relative bg-purple-950/40 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhotoB?.photoUrl}
                  alt="Foto Depois"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {selectedPhotoB?.notes && (
                <div className="p-3 bg-[#1d0637] text-xs text-fuchsia-200 italic border-t border-fuchsia-800/40">
                  "{selectedPhotoB.notes}"
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="py-12 text-center text-purple-200 bg-[#1d0637]/40 rounded-2xl border border-purple-800/30 space-y-3">
            <Camera className="w-8 h-8 text-fuchsia-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Adicione pelo menos 2 fotos para ativar a comparação lado a lado</h4>
            <p className="text-xs text-purple-300 max-w-sm mx-auto">
              Com duas ou mais fotos de datas distintas, você poderá apresentar o antes e depois diretamente na tela.
            </p>
          </div>
        )}
      </div>

      {/* Histórico Completo de Medições Antropométricas */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md space-y-4">
        <h4 className="font-bold text-white text-base flex items-center gap-2 border-b border-purple-900/40 pb-3">
          <TrendingUp className="w-5 h-5 text-fuchsia-400" />
          Histórico e Tabela de Medidas Antropométricas ({patient.evolutionHistory?.length || 0})
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-purple-100">
            <thead className="bg-[#1d0637] text-purple-200 uppercase font-bold border-b border-purple-900/40">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Peso (kg)</th>
                <th className="p-3">IMC</th>
                <th className="p-3">% Gordura</th>
                <th className="p-3">% Músculo</th>
                <th className="p-3">Cintura</th>
                <th className="p-3">Quadril</th>
                <th className="p-3">Braço</th>
                <th className="p-3">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30">
              {(patient.evolutionHistory || []).map((rec) => (
                <tr key={rec.id} className="hover:bg-[#1d0637]/60 transition-colors">
                  <td className="p-3 font-bold text-white">{rec.date}</td>
                  <td className="p-3 font-black text-fuchsia-300">{rec.weightKg} kg</td>
                  <td className="p-3 font-semibold">{rec.bmi}</td>
                  <td className="p-3 font-semibold text-emerald-400">{rec.bodyFatPercentage ? `${rec.bodyFatPercentage}%` : '-'}</td>
                  <td className="p-3 font-semibold">{rec.muscleMassPercentage ? `${rec.muscleMassPercentage}%` : '-'}</td>
                  <td className="p-3">{rec.waistCircumferenceCm ? `${rec.waistCircumferenceCm} cm` : '-'}</td>
                  <td className="p-3">{rec.hipCircumferenceCm ? `${rec.hipCircumferenceCm} cm` : '-'}</td>
                  <td className="p-3">{rec.armCircumferenceCm ? `${rec.armCircumferenceCm} cm` : '-'}</td>
                  <td className="p-3 text-purple-300 italic">{rec.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
