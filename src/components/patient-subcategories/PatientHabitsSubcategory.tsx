import React, { useState } from 'react';
import { 
  Activity, 
  Moon, 
  Droplets, 
  Dumbbell, 
  Target, 
  Plus, 
  Check, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Smile, 
  AlertCircle,
  Zap,
  Coffee,
  Footprints,
  Brain,
  Trash2
} from 'lucide-react';
import { Patient, HabitItem } from '../../types';
import { calculateWaterRecommendation } from '../../utils/nutritionCalculations';

interface PatientHabitsSubcategoryProps {
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
}

export const PatientHabitsSubcategory: React.FC<PatientHabitsSubcategoryProps> = ({
  patient,
  onUpdatePatient,
  onOpenNutriaWithPrompt
}) => {
  // Metas padrão ou salvas no paciente
  const waterRec = calculateWaterRecommendation(patient.currentWeightKg || 70);
  
  const [sleepTarget, setSleepTarget] = useState<number>(
    patient.habits?.sleepHoursTarget || patient.anamnese?.sleepHoursPerNight || 8
  );
  const [sleepCurrent, setSleepCurrent] = useState<number>(
    patient.habits?.sleepHoursCurrent || 7.5
  );
  // Histórico de sono dos últimos 7 dias
  const [sleepWeekly, setSleepWeekly] = useState<number[]>([7.0, 7.5, 8.0, 6.5, 7.5, 8.5, 7.5]);

  const [workoutTarget, setWorkoutTarget] = useState<number>(
    patient.habits?.workoutsTargetPerWeek || 4
  );
  const [workoutDays, setWorkoutDays] = useState<{ [key: string]: boolean }>({
    'Seg': true,
    'Ter': true,
    'Qua': false,
    'Qui': true,
    'Sex': true,
    'Sáb': false,
    'Dom': false
  });

  const [waterTarget, setWaterTarget] = useState<number>(
    patient.habits?.waterLitersTarget || waterRec.liters || 2.5
  );
  const [waterCurrent, setWaterCurrent] = useState<number>(
    patient.habits?.waterLitersCurrent || (waterRec.liters * 0.8) || 2.0
  );

  // Lista de hábitos customizados
  const initialHabits: HabitItem[] = patient.habits?.habitsList || [
    {
      id: 'h-1',
      title: 'Passos Diários (NEAT)',
      category: 'passos',
      targetValue: 10000,
      currentValue: 8400,
      unit: 'passos/dia',
      frequency: 'diario',
      weeklyHistory: [8500, 10200, 9100, 7800, 11000, 8400, 9500],
      status: 'em_progresso',
      notes: 'Caminhadas leves após as principais refeições.'
    },
    {
      id: 'h-2',
      title: 'Higiene do Sono (Sem Telas 45m antes)',
      category: 'sono',
      targetValue: 7,
      currentValue: 5,
      unit: 'dias/semana',
      frequency: 'semanal',
      weeklyHistory: [1, 1, 1, 0, 1, 1, 0],
      status: 'cumprido',
      notes: 'Substituir celular por leitura ou chá calmante.'
    },
    {
      id: 'h-3',
      title: 'Consumo de Saladas & Fibras no Almoço e Jantar',
      category: 'refeicoes',
      targetValue: 14,
      currentValue: 12,
      unit: 'refeições/sem',
      frequency: 'semanal',
      weeklyHistory: [2, 2, 2, 1, 2, 2, 1],
      status: 'cumprido',
      notes: 'Mínimo 1 prato de sobremesa de vegetais crus e cozidos.'
    }
  ];

  const [habitsList, setHabitsList] = useState<HabitItem[]>(initialHabits);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitTarget, setNewHabitTarget] = useState('1');
  const [newHabitUnit, setNewHabitUnit] = useState('vezes/dia');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitItem['category']>('personalizado');
  const [newHabitNotes, setNewHabitNotes] = useState('');

  // Salvar no estado global do paciente
  const persistHabits = (updatedList: HabitItem[], wCurrent = waterCurrent, sCurrent = sleepCurrent) => {
    const updated = {
      ...patient,
      habits: {
        waterLitersTarget: waterTarget,
        waterLitersCurrent: wCurrent,
        sleepHoursTarget: sleepTarget,
        sleepHoursCurrent: sCurrent,
        workoutsTargetPerWeek: workoutTarget,
        workoutsCurrentPerWeek: Object.values(workoutDays).filter(Boolean).length,
        habitsList: updatedList
      }
    };
    onUpdatePatient(updated);
  };

  const handleToggleWorkoutDay = (day: string) => {
    const updated = { ...workoutDays, [day]: !workoutDays[day] };
    setWorkoutDays(updated);
    const completedWorkouts = Object.values(updated).filter(Boolean).length;
    onUpdatePatient({
      ...patient,
      habits: {
        waterLitersTarget: waterTarget,
        waterLitersCurrent: waterCurrent,
        sleepHoursTarget: sleepTarget,
        sleepHoursCurrent: sleepCurrent,
        workoutsTargetPerWeek: workoutTarget,
        workoutsCurrentPerWeek: completedWorkouts,
        habitsList: habitsList
      }
    });
  };

  const handleAddWater = (amountLiters: number) => {
    const newVal = Math.min(Math.round((waterCurrent + amountLiters) * 10) / 10, waterTarget * 1.5);
    setWaterCurrent(newVal);
    persistHabits(habitsList, newVal, sleepCurrent);
  };

  const handleResetWater = () => {
    setWaterCurrent(0);
    persistHabits(habitsList, 0, sleepCurrent);
  };

  const handleCreateCustomHabit = () => {
    if (!newHabitTitle.trim()) return;

    const newItem: HabitItem = {
      id: `habit-${Date.now()}`,
      title: newHabitTitle.trim(),
      category: newHabitCategory,
      targetValue: parseFloat(newHabitTarget) || 1,
      currentValue: 0,
      unit: newHabitUnit.trim() || 'un',
      frequency: 'diario',
      weeklyHistory: [0, 0, 0, 0, 0, 0, 0],
      status: 'em_progresso',
      notes: newHabitNotes.trim()
    };

    const updated = [newItem, ...habitsList];
    setHabitsList(updated);
    persistHabits(updated);

    setNewHabitTitle('');
    setNewHabitTarget('1');
    setNewHabitUnit('vezes/dia');
    setNewHabitNotes('');
    setIsAddingHabit(false);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habitsList.filter(h => h.id !== id);
    setHabitsList(updated);
    persistHabits(updated);
  };

  // Cálculo do Score Geral de Consistência
  const workoutsDone = Object.values(workoutDays).filter(Boolean).length;
  const workoutScore = Math.min(100, Math.round((workoutsDone / workoutTarget) * 100));
  const waterScore = Math.min(100, Math.round((waterCurrent / waterTarget) * 100));
  const sleepScore = Math.min(100, Math.round((sleepCurrent / sleepTarget) * 100));
  const overallScore = Math.round((workoutScore + waterScore + sleepScore) / 3);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Bloco de Hábitos */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/60 text-fuchsia-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Metas & Hábitos Não-Dietéticos Atuais
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Acompanhamento visual diário e semanal de sono, frequência de treinos, hidratação e metas comportamentais
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddingHabit(!isAddingHabit)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all border border-fuchsia-400/40"
              id="btn-add-custom-habit"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingHabit ? 'Fechar' : '+ Nova Meta de Hábito'}</span>
            </button>

            <button
              onClick={() => onOpenNutriaWithPrompt(`Nutria, avalie o cumprimento de hábitos de ${patient.name} (Sono: ${sleepCurrent}h/${sleepTarget}h, Treinos: ${workoutsDone}/${workoutTarget}x por semana, Água: ${waterCurrent}L/${waterTarget}L) e elabore estratégias comportamentais para elevar a consistência.`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-fuchsia-200 border border-fuchsia-500/40 rounded-xl text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Análise Comportamental NUTRIA</span>
            </button>
          </div>
        </div>

        {/* Resumo de Consistência Geral */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-purple-300 font-bold uppercase block">Score de Consistência</span>
              <p className="text-2xl font-black text-white mt-0.5">{overallScore}%</p>
              <span className={`text-[10px] font-bold ${overallScore >= 80 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                {overallScore >= 80 ? '🌟 Alta Consistência' : overallScore >= 60 ? '⚡ Em Evolução' : '⚠️ Atenção'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-950 flex items-center justify-center border border-purple-700/60 text-fuchsia-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-purple-300 font-bold uppercase block">Sono Médio</span>
              <p className="text-2xl font-black text-purple-200 mt-0.5">{sleepCurrent}h <span className="text-xs text-purple-400 font-normal">/ {sleepTarget}h</span></p>
              <span className="text-[10px] text-purple-300 font-medium">Meta de recuperação neural</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 flex items-center justify-center border border-indigo-700/60 text-indigo-300">
              <Moon className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-purple-300 font-bold uppercase block">Frequência de Treino</span>
              <p className="text-2xl font-black text-fuchsia-300 mt-0.5">{workoutsDone}x <span className="text-xs text-purple-400 font-normal">/ {workoutTarget}x</span></p>
              <span className="text-[10px] text-emerald-400 font-medium">{workoutScore}% da meta semanal</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-950/80 flex items-center justify-center border border-fuchsia-700/60 text-fuchsia-400">
              <Dumbbell className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-purple-300 font-bold uppercase block">Meta de Água</span>
              <p className="text-2xl font-black text-cyan-300 mt-0.5">{waterCurrent}L <span className="text-xs text-purple-400 font-normal">/ {waterTarget}L</span></p>
              <span className="text-[10px] text-cyan-400 font-medium">35ml/kg corporal</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 flex items-center justify-center border border-cyan-700/60 text-cyan-300">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Modal de Criação de Hábito Personalizado */}
        {isAddingHabit && (
          <div className="mt-5 p-5 bg-[#1d0637] rounded-2xl border border-fuchsia-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-fuchsia-400" />
                Cadastrar Nova Meta de Hábito Não-Dietético
              </h4>
              <button
                onClick={() => setIsAddingHabit(false)}
                className="text-xs text-purple-300 hover:text-white"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-purple-200 font-bold block mb-1">Título do Hábito:</label>
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="Ex: 10.000 Passos diários, Tomar Creatina pós-treino, Chá de Camomila à noite..."
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Categoria:</label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-purple-200 border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                >
                  <option value="passos">Passos & Movimento (NEAT)</option>
                  <option value="sono">Sono & Descanso</option>
                  <option value="agua">Hidratação</option>
                  <option value="treino">Treino Resistido / Cardio</option>
                  <option value="mindfulness">Mindfulness / Estresse</option>
                  <option value="refeicoes">Comportamento Alimentar</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Meta Numérica:</label>
                <input
                  type="number"
                  value={newHabitTarget}
                  onChange={(e) => setNewHabitTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Unidade de Medida:</label>
                <input
                  type="text"
                  value={newHabitUnit}
                  onChange={(e) => setNewHabitUnit(e.target.value)}
                  placeholder="Ex: passos, copos, minutos, vezes/sem"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Observação Clínica:</label>
                <input
                  type="text"
                  value={newHabitNotes}
                  onChange={(e) => setNewHabitNotes(e.target.value)}
                  placeholder="Instruções para o paciente..."
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCreateCustomHabit}
                disabled={!newHabitTitle.trim()}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Salvar Hábito no PWA do Paciente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid Principal: 3 Blocos de Hábitos Fundamentais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BLOCO 1: META DE SONO */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              1. Qualidade & Meta de Sono
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 font-bold">
              Meta: {sleepTarget}h
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between">
              <div>
                <span className="text-purple-200 font-bold block">Horas Dormidas (Média)</span>
                <span className="text-[10px] text-purple-300">Últimos 7 dias registrados</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = Math.max(4, sleepCurrent - 0.5);
                    setSleepCurrent(next);
                    persistHabits(habitsList, waterCurrent, next);
                  }}
                  className="w-7 h-7 rounded-lg bg-[#29094e] text-purple-200 hover:text-white font-bold flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-base font-black text-white">{sleepCurrent}h</span>
                <button
                  onClick={() => {
                    const next = Math.min(12, sleepCurrent + 0.5);
                    setSleepCurrent(next);
                    persistHabits(habitsList, waterCurrent, next);
                  }}
                  className="w-7 h-7 rounded-lg bg-[#29094e] text-purple-200 hover:text-white font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Mini Gráfico de Barras dos 7 dias */}
            <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-2">
              <span className="text-[11px] font-bold text-purple-200 block">Evolução dos Últimos 7 Dias (Horas):</span>
              <div className="flex items-end justify-between gap-1.5 h-20 pt-2 px-1">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, i) => {
                  const val = sleepWeekly[i] || 7;
                  const pct = Math.min(100, (val / 10) * 100);
                  const isOk = val >= sleepTarget;
                  return (
                    <div key={d} className="flex flex-col items-center flex-1 h-full justify-end group">
                      <span className="text-[9px] text-purple-300 mb-1 opacity-80 group-hover:opacity-100 font-bold">
                        {val}h
                      </span>
                      <div
                        style={{ height: `${pct}%` }}
                        className={`w-full max-w-[20px] rounded-t-lg transition-all ${
                          isOk 
                            ? 'bg-gradient-to-t from-indigo-600 to-indigo-400' 
                            : 'bg-gradient-to-t from-amber-600 to-amber-400'
                        }`}
                      />
                      <span className="text-[10px] text-purple-300 font-medium mt-1">{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-[#120326] rounded-xl border border-indigo-900/40 text-[11px] text-indigo-200">
              💡 <strong>Impacto Metabólico:</strong> O sono profundo estimula o hormônio do crescimento (GH) e equilibra leptina/grelina para controle do apetite.
            </div>
          </div>
        </div>

        {/* BLOCO 2: META DE TREINO & FREQUÊNCIA */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-fuchsia-400" />
              2. Frequência de Treinos Semanal
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-700/50 font-bold">
              Meta: {workoutTarget}x / sem
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200 font-bold">Dias de Treino Realizados:</span>
                <span className="text-fuchsia-300 font-black text-sm">{workoutsDone} de {workoutTarget}</span>
              </div>
              
              {/* Barra de Progresso Semanal */}
              <div className="w-full bg-[#120326] h-2.5 rounded-full overflow-hidden border border-purple-900/50">
                <div
                  style={{ width: `${workoutScore}%` }}
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Seletor Interativo dos 7 Dias */}
            <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-2">
              <span className="text-[11px] font-bold text-purple-200 block">Marcar Dias Cumpridos nesta Semana:</span>
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => {
                  const active = workoutDays[day];
                  return (
                    <button
                      key={day}
                      onClick={() => handleToggleWorkoutDay(day)}
                      className={`py-2 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 border ${
                        active
                          ? 'bg-gradient-to-b from-fuchsia-600 to-purple-700 text-white border-fuchsia-400 shadow-sm'
                          : 'bg-[#120326] text-purple-400 border-purple-900/40 hover:bg-[#1a0533]'
                      }`}
                    >
                      <span>{day}</span>
                      {active ? (
                        <Check className="w-3 h-3 text-emerald-300" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-purple-700/60 inline-block" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-[#120326] rounded-xl border border-fuchsia-900/40 text-[11px] text-fuchsia-200">
              🔥 <strong>Preservação Muscular:</strong> O estímulo mecanotransdutivo garante que o déficit calórico mobilize prioritariamente triglicerídeos do tecido adiposo.
            </div>
          </div>
        </div>

        {/* BLOCO 3: META DE ÁGUA / HIDRATAÇÃO */}
        <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              3. Meta de Hidratação Diária
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-bold">
              Meta: {waterTarget} L/dia
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 text-center space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-200">
                <span>Consumo Hoje:</span>
                <span className="text-cyan-300 text-base">{waterCurrent} L ({waterScore}%)</span>
              </div>

              {/* Medidor visual de nível d'água */}
              <div className="w-full bg-[#120326] h-4 rounded-full overflow-hidden border border-cyan-900/50 p-0.5">
                <div
                  style={{ width: `${Math.min(100, waterScore)}%` }}
                  className="h-full bg-gradient-to-r from-cyan-600 via-sky-400 to-teal-300 rounded-full transition-all duration-500 shadow-sm"
                />
              </div>

              {/* Botões Rápidos de Registro */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleAddWater(0.25)}
                  className="px-3 py-1.5 bg-[#250849] hover:bg-[#340b67] text-cyan-200 rounded-xl text-xs font-bold border border-cyan-800/50 transition-all"
                >
                  +250 ml (1 copo)
                </button>
                <button
                  onClick={() => handleAddWater(0.5)}
                  className="px-3 py-1.5 bg-[#250849] hover:bg-[#340b67] text-cyan-200 rounded-xl text-xs font-bold border border-cyan-800/50 transition-all"
                >
                  +500 ml (garrafa)
                </button>
                <button
                  onClick={handleResetWater}
                  className="p-1.5 text-purple-400 hover:text-rose-300 rounded-xl transition-colors"
                  title="Zerar dia"
                >
                  Zerar
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#120326] rounded-xl border border-cyan-900/40 text-[11px] text-cyan-200">
              💧 <strong>Cálculo Clínico:</strong> 35ml × {patient.currentWeightKg || 70}kg = {waterRec.liters} Litros recomendados para taxa de filtração glomerular e balanço osmótico.
            </div>
          </div>
        </div>

      </div>

      {/* BLOCO 4: METAS E HÁBITOS PERSONALIZADOS */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div>
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Hábitos Comportamentais & Metas do Paciente ({habitsList.length})
            </h4>
            <p className="text-xs text-purple-200 mt-0.5">
              Definidos pelo nutricionista e sincronizados com o PWA do paciente
            </p>
          </div>

          <button
            onClick={() => setIsAddingHabit(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#220743] hover:bg-[#2f0b5a] text-purple-100 border border-purple-700/60 rounded-xl text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>+ Adicionar Hábito</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {habitsList.map((habit) => {
            const pct = Math.min(100, Math.round((habit.currentValue / habit.targetValue) * 100));
            return (
              <div key={habit.id} className="p-4 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-purple-950 text-fuchsia-300 border border-purple-800/50">
                      {habit.category}
                    </span>
                    <h5 className="font-bold text-sm text-white mt-1">{habit.title}</h5>
                  </div>
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-purple-400 hover:text-rose-400 p-1"
                    title="Remover Hábito"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-200">Meta:</span>
                    <span className="text-white font-bold">{habit.targetValue} {habit.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-200">Realizado:</span>
                    <span className="text-fuchsia-300 font-bold">{habit.currentValue} {habit.unit}</span>
                  </div>

                  <div className="w-full bg-[#120326] h-2 rounded-full overflow-hidden border border-purple-900/40">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-400 rounded-full"
                    />
                  </div>
                </div>

                {habit.notes && (
                  <p className="text-[11px] text-purple-200 italic bg-[#120326] p-2 rounded-lg border border-purple-800/40">
                    "{habit.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
