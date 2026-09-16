import React, { useState, useRef } from 'react';
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
  Maximize2,
  Upload,
  UploadCloud,
  Image as ImageIcon,
  FolderUp,
  Smartphone,
  X,
  RefreshCw
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

  // Fotos de Antes e Depois do Paciente (apenas fotos reais cadastradas pelo profissional)
  const cleanPatientPhotos = (patient.evolutionPhotos || []).filter(
    (p) => p && p.photoUrl && !p.photoUrl.includes('unsplash.com') && !p.photoUrl.startsWith('mock-')
  );

  const [photosList, setPhotosList] = useState<PatientEvolutionPhoto[]>(cleanPatientPhotos);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoPose, setNewPhotoPose] = useState<PatientEvolutionPhoto['pose']>('frente');
  const [newPhotoDate, setNewPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPhotoWeight, setNewPhotoWeight] = useState(String(patient.currentWeightKg || ''));
  const [newPhotoBf, setNewPhotoBf] = useState(String(patient.bodyFatPercentage || ''));
  const [newPhotoNotes, setNewPhotoNotes] = useState('');
  const [targetSlot, setTargetSlot] = useState<'gallery' | 'slotA' | 'slotB'>('gallery');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Hidden File Inputs Refs
  const generalFileInputRef = useRef<HTMLInputElement>(null);
  const slotAFileInputRef = useRef<HTMLInputElement>(null);
  const slotBFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Estados do Comparador Lado a Lado
  const [photoAId, setPhotoAId] = useState<string>(cleanPatientPhotos[0]?.id || '');
  const [photoBId, setPhotoBId] = useState<string>(cleanPatientPhotos[1]?.id || cleanPatientPhotos[0]?.id || '');
  const [isComparisonMode, setIsComparisonMode] = useState(true);

  const selectedPhotoA = photosList.find(p => p.id === photoAId) || (photosList.length > 0 ? photosList[0] : null);
  const selectedPhotoB = photosList.find(p => p.id === photoBId) || (photosList.length > 1 ? photosList[photosList.length - 1] : null);

  // Drag over states for dropzones
  const [isDragOverA, setIsDragOverA] = useState(false);
  const [isDragOverB, setIsDragOverB] = useState(false);
  const [isDragOverGeneral, setIsDragOverGeneral] = useState(false);

  // Helper para comprimir e converter imagem do aparelho para DataURL leve e de alta qualidade
  const processImageFile = (file: File, onComplete: (dataUrl: string) => void) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsProcessingUpload(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onComplete(compressedDataUrl);
        } else {
          onComplete(event.target?.result as string);
        }
        setIsProcessingUpload(false);
      };
      img.onerror = () => {
        setIsProcessingUpload(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessingUpload(false);
    };
    reader.readAsDataURL(file);
  };

  // Upload direto para Foto 1 (Antes) ou Foto 2 (Depois)
  const handleDirectSlotUpload = (file: File, slot: 'slotA' | 'slotB') => {
    processImageFile(file, (dataUrl) => {
      const newPhotoId = `photo-${Date.now()}`;
      const newPhoto: PatientEvolutionPhoto = {
        id: newPhotoId,
        date: new Date().toISOString().split('T')[0],
        pose: 'frente',
        photoUrl: dataUrl,
        weightKg: slot === 'slotA' ? (patient.initialWeightKg || patient.currentWeightKg || 0) : (patient.currentWeightKg || patient.initialWeightKg || 0),
        bodyFatPercentage: patient.bodyFatPercentage || 0,
        notes: slot === 'slotA' ? 'Foto de Antes enviada pelo profissional' : 'Foto de Depois enviada pelo profissional'
      };

      const updatedPhotos = [newPhoto, ...photosList];
      setPhotosList(updatedPhotos);

      if (slot === 'slotA') {
        setPhotoAId(newPhotoId);
        if (!photoBId && updatedPhotos.length > 1) {
          const other = updatedPhotos.find(p => p.id !== newPhotoId);
          if (other) setPhotoBId(other.id);
        }
      } else {
        setPhotoBId(newPhotoId);
        if (!photoAId && updatedPhotos.length > 1) {
          const other = updatedPhotos.find(p => p.id !== newPhotoId);
          if (other) setPhotoAId(other.id);
        }
      }

      onUpdatePatient({
        ...patient,
        evolutionPhotos: updatedPhotos
      });
    });
  };

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

    const newPhotoId = `photo-${Date.now()}`;
    const newPhoto: PatientEvolutionPhoto = {
      id: newPhotoId,
      date: newPhotoDate,
      pose: newPhotoPose,
      photoUrl: newPhotoUrl.trim(),
      weightKg: parseFloat(newPhotoWeight) || patient.currentWeightKg,
      bodyFatPercentage: parseFloat(newPhotoBf) || patient.bodyFatPercentage,
      notes: newPhotoNotes.trim()
    };

    const updatedPhotos = [newPhoto, ...photosList];
    setPhotosList(updatedPhotos);

    if (targetSlot === 'slotA') {
      setPhotoAId(newPhotoId);
    } else if (targetSlot === 'slotB') {
      setPhotoBId(newPhotoId);
    }

    onUpdatePatient({
      ...patient,
      evolutionPhotos: updatedPhotos
    });

    setNewPhotoUrl('');
    setNewPhotoNotes('');
    setTargetSlot('gallery');
    setIsAddingPhoto(false);
  };

  const handleDeletePhoto = (id: string) => {
    const updated = photosList.filter(p => p.id !== id);
    setPhotosList(updated);
    onUpdatePatient({
      ...patient,
      evolutionPhotos: updated
    });
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs for Device Uploads */}
      <input
        type="file"
        ref={generalFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            processImageFile(file, (dataUrl) => {
              setNewPhotoUrl(dataUrl);
              setIsAddingPhoto(true);
            });
          }
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            processImageFile(file, (dataUrl) => {
              setNewPhotoUrl(dataUrl);
              setIsAddingPhoto(true);
            });
          }
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={slotAFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleDirectSlotUpload(file, 'slotA');
          }
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={slotBFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleDirectSlotUpload(file, 'slotB');
          }
          e.target.value = '';
        }}
      />

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
              onClick={() => {
                setTargetSlot('gallery');
                setIsAddingPhoto(!isAddingPhoto);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-100 border border-purple-700/60 rounded-xl text-xs font-bold"
              id="btn-upload-patient-photo"
            >
              <Camera className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>+ Adicionar Foto</span>
            </button>

            <button
              onClick={() => generalFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-purple-100 border border-purple-700/60 rounded-xl text-xs font-bold"
              id="btn-quick-upload-device"
              title="Fazer upload de foto direto do dispositivo"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Upload do Aparelho</span>
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

        {/* Modal de Adicionar Foto de Evolução com Upload do Aparelho */}
        {isAddingPhoto && (
          <div className="mt-5 p-5 bg-[#1d0637] rounded-2xl border-2 border-fuchsia-500/50 space-y-4 animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-fuchsia-600/30 text-fuchsia-300">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Adicionar Nova Foto de Antes / Depois
                  </h4>
                  <p className="text-[11px] text-purple-200">
                    Faça upload do seu computador, tablet ou smartphone (câmera ou galeria)
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAddingPhoto(false)} className="text-xs text-purple-300 hover:text-white p-1">
                ✕ Fechar
              </button>
            </div>

            {/* Zona de Upload / Seleção de Arquivo */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverGeneral(true);
              }}
              onDragLeave={() => setIsDragOverGeneral(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverGeneral(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  processImageFile(file, (dataUrl) => setNewPhotoUrl(dataUrl));
                }
              }}
              className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-3 ${
                isDragOverGeneral
                  ? 'border-fuchsia-400 bg-fuchsia-950/40'
                  : 'border-purple-700/60 bg-[#120326]/60 hover:bg-[#120326]'
              }`}
            >
              {newPhotoUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-fuchsia-500/50 shadow-md shrink-0 bg-purple-950">
                    <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Foto carregada com sucesso do aparelho!
                    </span>
                    <p className="text-[11px] text-purple-200">
                      A imagem foi otimizada para carregamento instantâneo no comparador.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => generalFileInputRef.current?.click()}
                        className="text-xs px-2.5 py-1 bg-purple-900/80 hover:bg-purple-800 text-purple-100 rounded-lg font-bold border border-purple-700"
                      >
                        Trocar Imagem
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPhotoUrl('')}
                        className="text-xs px-2 py-1 text-rose-300 hover:text-rose-200"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-700/60 text-fuchsia-300 flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Arraste e solte a foto aqui, ou escolha do seu aparelho
                    </p>
                    <p className="text-[11px] text-purple-300 mt-0.5">
                      Suporta JPG, PNG, WEBP e fotos tiradas diretamente pelo celular
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => generalFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                    >
                      <FolderUp className="w-4 h-4" />
                      <span>Selecionar do Aparelho (Arquivos / Fotos)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#250849] hover:bg-[#340b67] text-fuchsia-200 border border-fuchsia-500/40 rounded-xl text-xs font-bold"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Tirar Foto com a Câmera</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-purple-200 font-bold block mb-1">
                  Ou Cole a URL da Imagem (opcional):
                </label>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://... ou use o botão de upload acima"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Destino no Comparador:</label>
                <select
                  value={targetSlot}
                  onChange={(e) => setTargetSlot(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-fuchsia-300 font-bold border border-fuchsia-500/50 focus:border-fuchsia-400 focus:outline-none"
                >
                  <option value="gallery">Apenas salvar na Galeria</option>
                  <option value="slotA">Definir como Foto 1 (Antes / Inicial)</option>
                  <option value="slotB">Definir como Foto 2 (Depois / Atual)</option>
                </select>
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

              <div className="sm:col-span-1">
                <label className="text-purple-200 font-bold block mb-1">% Gordura na Data:</label>
                <input
                  type="number"
                  step="0.1"
                  value={newPhotoBf}
                  onChange={(e) => setNewPhotoBf(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-purple-200 font-bold block mb-1">Notas / Observações:</label>
                <input
                  type="text"
                  value={newPhotoNotes}
                  onChange={(e) => setNewPhotoNotes(e.target.value)}
                  placeholder="Ex: Foto de retorno após 60 dias de dieta cetogênica..."
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleAddPhoto}
                disabled={!newPhotoUrl.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Foto no Prontuário</span>
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
                  Selecione duas avaliações ou envie fotos direto do seu aparelho (PC, tablet ou celular) para comparar o progresso
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {weightDelta !== null && (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-600/60 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <span>Variação Total:</span>
                <span className="text-white font-black">{weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg</span>
                {bfDelta !== null && (
                  <span className="text-emerald-300">({bfDelta > 0 ? '+' : ''}{bfDelta.toFixed(1)}% BF)</span>
                )}
              </div>
            )}

            <button
              onClick={() => generalFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all border border-fuchsia-400/40"
              id="btn-comparator-upload-device"
              title="Fazer upload de foto direto do dispositivo"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>+ Upload do Aparelho</span>
            </button>
          </div>
        </div>

        {/* Seletores das Fotos A e B com Ações Rápidas de Upload (visível quando há fotos) */}
        {photosList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-200 font-bold">Foto 1 (Inicial / Antes):</span>
              </div>
              <div className="flex items-center gap-2">
                {photosList.length > 0 ? (
                  <select
                    value={photoAId}
                    onChange={(e) => setPhotoAId(e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#120326] text-purple-200 border border-purple-700/60 focus:outline-none"
                  >
                    {photosList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.date} • {p.pose.toUpperCase()} ({p.weightKg || '-'} kg)
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-purple-300 italic">Nenhuma foto</span>
                )}
                <button
                  onClick={() => slotAFileInputRef.current?.click()}
                  className="p-1.5 rounded-xl bg-[#250849] hover:bg-[#340b67] text-fuchsia-300 border border-purple-700/60 text-xs font-bold flex items-center gap-1 shrink-0"
                  title="Fazer upload direto do aparelho para a Foto 1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-fuchsia-300 font-bold">Foto 2 (Atual / Depois):</span>
              </div>
              <div className="flex items-center gap-2">
                {photosList.length > 1 ? (
                  <select
                    value={photoBId}
                    onChange={(e) => setPhotoBId(e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#120326] text-purple-200 border border-purple-700/60 focus:outline-none"
                  >
                    {photosList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.date} • {p.pose.toUpperCase()} ({p.weightKg || '-'} kg)
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-fuchsia-300 italic">Aguardando 2ª foto</span>
                )}
                <button
                  onClick={() => slotBFileInputRef.current?.click()}
                  className="p-1.5 rounded-xl bg-fuchsia-950 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-600/60 text-xs font-bold flex items-center gap-1 shrink-0"
                  title="Fazer upload direto do aparelho para a Foto 2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visualizador Comparativo Lado a Lado: Casos 0 fotos, 1 foto ou 2+ fotos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Quadro 1: Foto 1 (Antes / Inicial) */}
          {selectedPhotoA ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverA(true);
              }}
              onDragLeave={() => setIsDragOverA(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverA(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleDirectSlotUpload(file, 'slotA');
              }}
              className={`bg-[#120326] rounded-3xl border transition-all overflow-hidden shadow-lg group relative ${
                isDragOverA ? 'border-fuchsia-400 ring-2 ring-fuchsia-400/50 scale-[1.01]' : 'border-purple-800/60'
              }`}
            >
              <div className="p-3.5 bg-[#1d0637] border-b border-purple-800/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-purple-950 text-purple-300 border border-purple-700/60">
                    Foto Inicial (Antes) • {selectedPhotoA?.pose}
                  </span>
                  <p className="text-xs text-white font-bold mt-1">{selectedPhotoA?.date}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    {selectedPhotoA?.weightKg ? (
                      <span className="text-sm font-black text-white block">{selectedPhotoA.weightKg} kg</span>
                    ) : null}
                    {selectedPhotoA?.bodyFatPercentage ? (
                      <span className="text-[10px] text-purple-300">{selectedPhotoA.bodyFatPercentage}% Gordura</span>
                    ) : null}
                  </div>
                  <button
                    onClick={() => handleDeletePhoto(selectedPhotoA.id)}
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors"
                    title="Excluir esta foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-80 sm:h-96 w-full relative bg-purple-950/40 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhotoA.photoUrl}
                  alt="Foto Antes"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Botão Flutuante de Upload para Foto 1 */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-[#150328]/85 backdrop-blur-md p-2 rounded-2xl border border-purple-700/60">
                  <span className="text-[11px] text-purple-200 font-semibold pl-1">
                    Arraste ou envie foto:
                  </span>
                  <button
                    onClick={() => slotAFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-700 to-fuchsia-700 hover:from-purple-600 hover:to-fuchsia-600 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>Trocar Foto 1</span>
                  </button>
                </div>
              </div>

              {selectedPhotoA.notes && (
                <div className="p-3 bg-[#1d0637] text-xs text-purple-200 italic border-t border-purple-800/40">
                  "{selectedPhotoA.notes}"
                </div>
              )}
            </div>
          ) : (
            /* Slot 1 Vazio / Dropzone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverA(true);
              }}
              onDragLeave={() => setIsDragOverA(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverA(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleDirectSlotUpload(file, 'slotA');
              }}
              className={`bg-[#120326]/70 rounded-3xl border-2 border-dashed p-8 h-80 sm:h-96 flex flex-col items-center justify-center text-center transition-all ${
                isDragOverA ? 'border-fuchsia-400 bg-fuchsia-950/40' : 'border-purple-800/60 hover:border-purple-600'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-700/60 text-fuchsia-300 flex items-center justify-center mb-3">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full font-bold uppercase bg-purple-950 text-purple-300 border border-purple-700/60 mb-2">
                Foto 1 (Inicial / Antes)
              </span>
              <p className="text-xs font-bold text-white max-w-xs">
                Nenhuma foto inicial cadastrada
              </p>
              <p className="text-[11px] text-purple-300 max-w-xs mt-1 mb-4">
                Arraste uma foto do paciente aqui ou faça upload do seu aparelho
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => slotAFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-700 to-fuchsia-700 hover:from-purple-600 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <FolderUp className="w-4 h-4" />
                  <span>+ Upload Foto 1</span>
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#250849] hover:bg-[#340b67] text-fuchsia-200 border border-purple-700/60 rounded-xl text-xs font-bold"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Câmera</span>
                </button>
              </div>
            </div>
          )}

          {/* Quadro 2: Foto 2 (Depois / Atual) */}
          {selectedPhotoB ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverB(true);
              }}
              onDragLeave={() => setIsDragOverB(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverB(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleDirectSlotUpload(file, 'slotB');
              }}
              className={`bg-[#120326] rounded-3xl border-2 transition-all overflow-hidden shadow-xl shadow-fuchsia-950/40 group relative ${
                isDragOverB ? 'border-emerald-400 ring-2 ring-emerald-400/50 scale-[1.01]' : 'border-fuchsia-500/60'
              }`}
            >
              <div className="p-3.5 bg-gradient-to-r from-purple-900 to-[#1d0637] border-b border-fuchsia-500/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/60">
                    Foto Atual (Depois) • {selectedPhotoB?.pose}
                  </span>
                  <p className="text-xs text-white font-bold mt-1">{selectedPhotoB?.date}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    {selectedPhotoB?.weightKg ? (
                      <span className="text-sm font-black text-fuchsia-300 block">{selectedPhotoB.weightKg} kg</span>
                    ) : null}
                    {selectedPhotoB?.bodyFatPercentage ? (
                      <span className="text-[10px] text-emerald-300 font-bold">{selectedPhotoB.bodyFatPercentage}% Gordura</span>
                    ) : null}
                  </div>
                  <button
                    onClick={() => handleDeletePhoto(selectedPhotoB.id)}
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors"
                    title="Excluir esta foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-80 sm:h-96 w-full relative bg-purple-950/40 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhotoB.photoUrl}
                  alt="Foto Depois"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Botão Flutuante de Upload para Foto 2 */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-[#150328]/85 backdrop-blur-md p-2 rounded-2xl border border-fuchsia-500/60">
                  <span className="text-[11px] text-fuchsia-200 font-semibold pl-1">
                    Arraste ou envie foto:
                  </span>
                  <button
                    onClick={() => slotBFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>Trocar Foto 2</span>
                  </button>
                </div>
              </div>

              {selectedPhotoB.notes && (
                <div className="p-3 bg-[#1d0637] text-xs text-fuchsia-200 italic border-t border-fuchsia-800/40">
                  "{selectedPhotoB.notes}"
                </div>
              )}
            </div>
          ) : (
            /* Slot 2 Vazio / Dropzone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverB(true);
              }}
              onDragLeave={() => setIsDragOverB(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverB(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleDirectSlotUpload(file, 'slotB');
              }}
              className={`bg-[#120326]/70 rounded-3xl border-2 border-dashed p-8 h-80 sm:h-96 flex flex-col items-center justify-center text-center transition-all ${
                isDragOverB ? 'border-emerald-400 bg-emerald-950/20' : 'border-fuchsia-500/40 hover:border-fuchsia-400'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-700/60 text-fuchsia-300 flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full font-bold uppercase bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-700/60 mb-2">
                Foto 2 (Atual / Depois)
              </span>
              <p className="text-xs font-bold text-white max-w-xs">
                Aguardando foto de evolução / retorno
              </p>
              <p className="text-[11px] text-purple-300 max-w-xs mt-1 mb-4">
                Envie a foto de reavaliação para ativar o comparador lado a lado instantâneo
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => slotBFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <FolderUp className="w-4 h-4" />
                  <span>+ Upload Foto 2</span>
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#250849] hover:bg-[#340b67] text-fuchsia-200 border border-fuchsia-500/40 rounded-xl text-xs font-bold"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Câmera</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Galeria de Todas as Fotos Registradas do Paciente */}
        {photosList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-fuchsia-400" />
                Todas as Fotos Salvas no Prontuário ({photosList.length})
              </span>
              <button
                onClick={() => {
                  setTargetSlot('gallery');
                  setIsAddingPhoto(true);
                }}
                className="text-xs text-fuchsia-300 hover:text-fuchsia-200 font-bold"
              >
                + Adicionar Outra Foto
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {photosList.map((p) => (
                <div
                  key={p.id}
                  className="group relative bg-[#120326] rounded-xl overflow-hidden border border-purple-800/50 hover:border-fuchsia-500/60 transition-all shadow-sm"
                >
                  <div className="h-24 w-full bg-purple-950 flex items-center justify-center overflow-hidden">
                    <img src={p.photoUrl} alt={p.pose} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-1.5 bg-[#1d0637] text-[10px] space-y-0.5">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{p.date}</span>
                      <span className="text-fuchsia-300 uppercase text-[9px]">{p.pose}</span>
                    </div>
                    {p.weightKg ? (
                      <p className="text-purple-300">{p.weightKg} kg {p.bodyFatPercentage ? `• ${p.bodyFatPercentage}% BF` : ''}</p>
                    ) : null}
                  </div>
                  <button
                    onClick={() => handleDeletePhoto(p.id)}
                    className="absolute top-1 right-1 p-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
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
