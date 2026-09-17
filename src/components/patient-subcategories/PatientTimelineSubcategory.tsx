import React, { useState } from 'react';
import { 
  History, 
  Plus, 
  Calendar, 
  Award, 
  Heart, 
  Pill, 
  TrendingUp, 
  Activity, 
  FileText, 
  MessageSquare, 
  Sparkles, 
  Check, 
  Filter, 
  Clock, 
  User, 
  Bot, 
  ChevronRight,
  Send,
  Zap,
  Tag
} from 'lucide-react';
import { Patient, PatientTimelineItem, Appointment } from '../../types';

interface PatientTimelineSubcategoryProps {
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  appointments?: Appointment[];
  onOpenNutriaWithPrompt: (prompt: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenAppointmentDetails?: (appointment: Appointment) => void;
}

export const PatientTimelineSubcategory: React.FC<PatientTimelineSubcategoryProps> = ({
  patient,
  onUpdatePatient,
  appointments = [],
  onOpenNutriaWithPrompt,
  onNavigateTab,
  onOpenAppointmentDetails
}) => {
  const [filterType, setFilterType] = useState<string>('todos');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<PatientTimelineItem['type']>('nota');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Compilar eventos unificados da linha do tempo
  const customEvents = patient.timeline || [];
  
  // Eventos derivados automaticamente do prontuário
  const derivedEvents: PatientTimelineItem[] = [];

  // 1. Consultas
  const patientApts = appointments.filter(
    a => a.patientId === patient.id || a.patientName?.toLowerCase() === patient.name.toLowerCase()
  );
  patientApts.forEach(apt => {
    derivedEvents.push({
      id: `apt-${apt.id}`,
      date: apt.date,
      time: apt.time,
      type: 'consulta',
      title: `Consulta: ${apt.type.replace('_', ' ').toUpperCase()}`,
      description: `Status: ${apt.status.toUpperCase()} • Modalidade: ${apt.location === 'presencial_consultorio' ? 'Presencial' : 'Telemedicina'} • R$ ${apt.price}${apt.notes ? ` • Obs: "${apt.notes}"` : ''}`,
      author: 'Agenda NutrinK',
      badge: apt.status
    });
  });

  // 2. Criação / Atualização do Plano Alimentar
  if (patient.mealPlan) {
    derivedEvents.push({
      id: `plan-${patient.mealPlan.id || 'current'}`,
      date: patient.mealPlan.dateCreated || patient.createdAt.split('T')[0] || new Date().toISOString().split('T')[0],
      type: 'plano',
      title: `Plano Alimentar Atualizado: "${patient.mealPlan.title}"`,
      description: `Meta Energética: ${patient.mealPlan.targetCalories} kcal • P: ${patient.mealPlan.targetProteinGrams}g | C: ${patient.mealPlan.targetCarbsGrams}g | G: ${patient.mealPlan.targetFatGrams}g • ${patient.mealPlan.meals?.length || 0} refeições planejadas.`,
      author: 'Nutricionista',
      badge: `${patient.mealPlan.targetCalories} kcal`
    });
  }

  // 3. Prescrições
  (patient.prescriptions || []).forEach(rx => {
    derivedEvents.push({
      id: `rx-${rx.id}`,
      date: rx.date.includes('/') ? rx.date.split('/').reverse().join('-') : rx.date,
      type: 'prescricao',
      title: `Prescrição Emitida: ${rx.title}`,
      description: `Tipo: ${rx.type.toUpperCase()} • ${rx.items.length} ativos/compostos prescritos • "${rx.instructions || 'Uso contínuo'}"`,
      author: 'Dr. Tarciano Sousa',
      badge: `${rx.items.length} itens`
    });
  });

  // 4. Avaliações Antropométricas
  (patient.evolutionHistory || []).forEach(ev => {
    derivedEvents.push({
      id: `ev-${ev.id}`,
      date: ev.date,
      type: 'antropometria',
      title: `Avaliação Antropométrica: ${ev.weightKg} kg`,
      description: `IMC: ${ev.bmi}${ev.bodyFatPercentage ? ` • Gordura: ${ev.bodyFatPercentage}%` : ''}${ev.muscleMassPercentage ? ` • Músculo: ${ev.muscleMassPercentage}%` : ''}${ev.waistCircumferenceCm ? ` • Cintura: ${ev.waistCircumferenceCm}cm` : ''} • ${ev.notes || 'Acompanhamento de rotina'}`,
      author: 'Antropometria',
      badge: `${ev.weightKg} kg`
    });
  });

  // 5. Exames Laboratoriais
  (patient.labExams || []).forEach(exam => {
    derivedEvents.push({
      id: `exam-${exam.id}`,
      date: exam.date,
      type: 'exame',
      title: `Exames Laboratoriais: ${exam.title}`,
      description: `Laboratório: ${exam.laboratory || 'Análises Clínicas'} • ${exam.markers.length} marcadores analisados (Vitamina D, B12, Glicemia, Ferritina...) • Parecer: ${exam.nutriaClinicalReview?.slice(0, 100) || 'Análise completa registrada' }...`,
      author: 'Laudo Laboratorial',
      badge: `${exam.markers.length} marcadores`
    });
  });

  // Unir e ordenar por data decrescente (mais recente primeiro)
  const allTimelineEvents = [...customEvents, ...derivedEvents].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Filtrar eventos
  const filteredEvents = allTimelineEvents.filter(ev => {
    if (filterType === 'todos') return true;
    return ev.type === filterType;
  });

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const newItem: PatientTimelineItem = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: newNoteType,
      title: newNoteType === 'nota' ? 'Nota Rápida do Nutricionista' : `Registro Clínico (${newNoteType})`,
      description: newNoteText.trim(),
      author: 'Dr. Tarciano Sousa',
      badge: 'Nota Rápida'
    };

    const updatedTimeline = [newItem, ...(patient.timeline || [])];
    onUpdatePatient({
      ...patient,
      timeline: updatedTimeline
    });

    setNewNoteText('');
    setIsAddingNote(false);
  };

  const getEventIcon = (type: PatientTimelineItem['type']) => {
    switch (type) {
      case 'consulta':
        return <Calendar className="w-4 h-4 text-purple-300" />;
      case 'plano':
        return <Award className="w-4 h-4 text-emerald-300" />;
      case 'exame':
        return <Heart className="w-4 h-4 text-rose-300" />;
      case 'prescricao':
        return <Pill className="w-4 h-4 text-amber-300" />;
      case 'antropometria':
        return <TrendingUp className="w-4 h-4 text-cyan-300" />;
      case 'habito':
        return <Activity className="w-4 h-4 text-fuchsia-300" />;
      case 'nota':
      default:
        return <FileText className="w-4 h-4 text-fuchsia-400" />;
    }
  };

  const getEventBadgeColor = (type: PatientTimelineItem['type']) => {
    switch (type) {
      case 'consulta':
        return 'bg-purple-950 text-purple-200 border-purple-700/60';
      case 'plano':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
      case 'exame':
        return 'bg-rose-950 text-rose-300 border-rose-700/60';
      case 'prescricao':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      case 'antropometria':
        return 'bg-cyan-950 text-cyan-300 border-cyan-700/60';
      case 'habito':
        return 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-700/60';
      case 'nota':
      default:
        return 'bg-[#29094e] text-fuchsia-200 border-purple-700/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Superior: Resumo Geral da Jornada do Paciente */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/60 text-fuchsia-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Histórico & Linha do Tempo da Jornada Clínica
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Feed vertical unificado estilo rede social com todas as consultas, alterações de dieta, exames e notas do paciente em ordem cronológica
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all border border-fuchsia-400/40"
              id="btn-add-timeline-note"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingNote ? 'Fechar Editor' : '+ Nova Nota / Evolução'}</span>
            </button>

            <button
              onClick={() => onOpenNutriaWithPrompt(`Nutria, elabore um resumo executivo da linha do tempo clínica e da jornada de ${patient.name}, destacando as principais conquistas e próximos pontos de atenção.`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-fuchsia-200 border border-fuchsia-500/40 rounded-xl text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Resumo da Jornada com NUTRIA</span>
            </button>
          </div>
        </div>

        {/* Métricas Rápidas da Linha do Tempo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">Total de Eventos</span>
            <p className="text-lg font-black text-white mt-0.5">{allTimelineEvents.length}</p>
            <span className="text-[10px] text-purple-200">registros na timeline</span>
          </div>

          <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">Início do Tratamento</span>
            <p className="text-lg font-black text-white mt-0.5">
              {patient.createdAt ? patient.createdAt.split('T')[0] : 'Recente'}
            </p>
            <span className="text-[10px] text-emerald-300">Paciente Ativo</span>
          </div>

          <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">Consultas Realizadas</span>
            <p className="text-lg font-black text-fuchsia-300 mt-0.5">{patientApts.length}</p>
            <span className="text-[10px] text-purple-200">agendamentos registrados</span>
          </div>

          <div className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">Exames & Biomarcadores</span>
            <p className="text-lg font-black text-cyan-300 mt-0.5">{patient.labExams?.length || 0}</p>
            <span className="text-[10px] text-purple-200">laudos avaliados</span>
          </div>
        </div>

        {/* Box de Criação de Nota Rápida / Evento */}
        {isAddingNote && (
          <div className="mt-5 p-4 bg-[#1d0637] rounded-2xl border border-fuchsia-500/40 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-fuchsia-400" />
                Adicionar Nota Clínica ou Observação à Linha do Tempo
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value as any)}
                  className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#120326] text-purple-200 border border-purple-700/60 focus:outline-none"
                >
                  <option value="nota">Nota Rápida</option>
                  <option value="consulta">Registro de Retorno</option>
                  <option value="plano">Ajuste de Plano</option>
                  <option value="habito">Meta / Hábito</option>
                  <option value="exame">Exame / Laudo</option>
                  <option value="antropometria">Medição Física</option>
                </select>
              </div>
            </div>

            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Digite aqui anotações rápidas sobre a conduta, feedback do paciente, adesão à dieta, sintomas relatados..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none placeholder-purple-400/60 resize-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAddingNote(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Salvar na Linha do Tempo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filtros da Timeline */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-purple-300 font-bold flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filtrar:
        </span>
        {[
          { id: 'todos', label: `Todos (${allTimelineEvents.length})` },
          { id: 'consulta', label: `🩺 Consultas (${allTimelineEvents.filter(e => e.type === 'consulta').length})` },
          { id: 'plano', label: `🥗 Planos Alimentares (${allTimelineEvents.filter(e => e.type === 'plano').length})` },
          { id: 'exame', label: `🧪 Exames (${allTimelineEvents.filter(e => e.type === 'exame').length})` },
          { id: 'prescricao', label: `💊 Prescrições (${allTimelineEvents.filter(e => e.type === 'prescricao').length})` },
          { id: 'antropometria', label: `📏 Medidas (${allTimelineEvents.filter(e => e.type === 'antropometria').length})` },
          { id: 'nota', label: `📝 Notas (${allTimelineEvents.filter(e => e.type === 'nota').length})` }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              filterType === f.id
                ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-400 shadow-sm'
                : 'bg-[#150328] text-purple-200 border-purple-900/40 hover:bg-[#1f053a] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed Vertical da Linha do Tempo (Estilo Rede Social) */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md">
        {filteredEvents.length > 0 ? (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-fuchsia-500 before:via-purple-600 before:to-purple-950">
            {filteredEvents.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                {/* Marcador na linha vertical */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-7 h-7 rounded-full bg-[#150328] border-2 border-fuchsia-500 flex items-center justify-center shadow-md shadow-fuchsia-950/80 group-hover:scale-110 transition-transform">
                  {getEventIcon(item.type)}
                </div>

                {/* Card do Post da Linha do Tempo */}
                <div className="p-5 bg-[#1d0637] rounded-2xl border border-purple-800/40 hover:border-purple-700/80 transition-all shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getEventBadgeColor(item.type)}`}>
                        {item.type}
                      </span>
                      <h4 className="font-black text-sm text-white">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-purple-300">
                      <span className="flex items-center gap-1 font-bold text-white">
                        <Clock className="w-3 h-3 text-fuchsia-400" />
                        {item.date} {item.time ? `• ${item.time}` : ''}
                      </span>
                      {item.author && (
                        <span className="text-[11px] px-2 py-0.5 bg-[#120326] rounded-md border border-purple-800/60 text-purple-200">
                          {item.author}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-purple-100 leading-relaxed font-medium">
                    {item.description}
                  </p>

                  {/* Ações contextuais de acordo com o tipo */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-md bg-[#120326] text-fuchsia-300 font-bold border border-purple-800/50">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (item.type === 'consulta') {
                          const aptId = item.id.replace('apt-', '');
                          const foundApt = appointments.find(a => a.id === aptId) || 
                            appointments.find(a => a.patientId === patient.id && a.date === item.date);
                          if (foundApt && onOpenAppointmentDetails) {
                            onOpenAppointmentDetails(foundApt);
                          } else if (onOpenAppointmentDetails) {
                            // Fallback if appointment object wasn't in array
                            onOpenAppointmentDetails({
                              id: aptId,
                              patientId: patient.id,
                              patientName: patient.name,
                              patientPhone: patient.phone,
                              patientEmail: patient.email,
                              date: item.date,
                              time: item.time || '14:00',
                              durationMinutes: 50,
                              type: 'retorno',
                              status: 'confirmada',
                              price: 350,
                              paymentStatus: 'pendente',
                              location: 'presencial_consultorio'
                            });
                          }
                        } else if (onNavigateTab) {
                          if (item.type === 'plano') onNavigateTab('plano_alimentar');
                          else if (item.type === 'exame') onNavigateTab('exames_biomarcadores');
                          else if (item.type === 'prescricao') onNavigateTab('prescricoes_suplementacao');
                          else if (item.type === 'antropometria') onNavigateTab('evolucao_estetica');
                          else if (item.type === 'habito') onNavigateTab('habitos');
                        }
                      }}
                      className="text-fuchsia-300 hover:text-white font-bold inline-flex items-center gap-1 transition-colors"
                      id={`btn-timeline-details-${item.id}`}
                    >
                      <span>Ver detalhes</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-purple-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1d0637] border border-purple-800/50 text-fuchsia-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-sm">Nenhum evento registrado nesta categoria</h4>
            <p className="text-xs text-purple-300 max-w-sm mx-auto">
              Adicione notas rápidas ou realize consultas, prescrições e exames para popular o feed vertical do paciente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
