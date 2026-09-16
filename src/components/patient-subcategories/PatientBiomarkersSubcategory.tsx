import React, { useState } from 'react';
import { 
  Heart, 
  TrendingUp, 
  Plus, 
  FileText, 
  Sparkles, 
  Calendar, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Trash2,
  Sliders,
  Award,
  Zap
} from 'lucide-react';
import { Patient, LabExam, LabMarker } from '../../types';

interface PatientBiomarkersSubcategoryProps {
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
}

export const PatientBiomarkersSubcategory: React.FC<PatientBiomarkersSubcategoryProps> = ({
  patient,
  onUpdatePatient,
  onOpenNutriaWithPrompt
}) => {
  // Lista padrão de exames ou do paciente
  const defaultExams: LabExam[] = patient.labExams && patient.labExams.length > 0 ? patient.labExams : [
    {
      id: 'exam-1',
      date: '2026-02-10',
      laboratory: 'Laboratório Fleury / Sabin',
      title: 'Painel Metabólico, Hormonal & Micronutrientes (Inicial)',
      nutriaClinicalReview: 'Vitamina D em nível subótimo (24 ng/mL) e Ferritina baixa (28 ng/mL). Glicemia de jejum e perfil lipídico dentro dos padrões normais. Recomendada reposição de colecalciferol e otimização de ferro.',
      markers: [
        { id: 'm-1', marker: 'Vitamina D (25-OH)', value: '24.2', unit: 'ng/mL', referenceRange: '30 - 60', status: 'baixo' },
        { id: 'm-2', marker: 'Vitamina B12', value: '380', unit: 'pg/mL', referenceRange: '350 - 900', status: 'normal' },
        { id: 'm-3', marker: 'Ferritina Sérica', value: '28.0', unit: 'ng/mL', referenceRange: '30 - 200', status: 'baixo' },
        { id: 'm-4', marker: 'Glicemia de Jejum', value: '88', unit: 'mg/dL', referenceRange: '70 - 99', status: 'normal' },
        { id: 'm-5', marker: 'Hemoglobina Glicada (HbA1c)', value: '5.2', unit: '%', referenceRange: '< 5.7', status: 'normal' },
        { id: 'm-6', marker: 'Colesterol Total', value: '182', unit: 'mg/dL', referenceRange: '< 190', status: 'normal' },
        { id: 'm-7', marker: 'Colesterol LDL', value: '108', unit: 'mg/dL', referenceRange: '< 130', status: 'normal' },
        { id: 'm-8', marker: 'Colesterol HDL', value: '56', unit: 'mg/dL', referenceRange: '> 40', status: 'normal' },
        { id: 'm-9', marker: 'Triglicerídeos', value: '110', unit: 'mg/dL', referenceRange: '< 150', status: 'normal' },
        { id: 'm-10', marker: 'TSH Ultra Sensível', value: '2.4', unit: 'mUI/L', referenceRange: '0.4 - 4.5', status: 'normal' }
      ]
    },
    {
      id: 'exam-2',
      date: '2026-08-20',
      laboratory: 'Laboratório Fleury / Sabin',
      title: 'Painel de Controle Bioquímico & Evolução',
      nutriaClinicalReview: 'Excelente resposta à suplementação: Vitamina D subiu para 48.5 ng/mL (faixa ideal) e Ferritina normalizada para 72 ng/mL. Manutenção de glicemia e melhora da sensibilidade à insulina.',
      markers: [
        { id: 'm-11', marker: 'Vitamina D (25-OH)', value: '48.5', unit: 'ng/mL', referenceRange: '30 - 60', status: 'normal' },
        { id: 'm-12', marker: 'Vitamina B12', value: '620', unit: 'pg/mL', referenceRange: '350 - 900', status: 'normal' },
        { id: 'm-13', marker: 'Ferritina Sérica', value: '72.0', unit: 'ng/mL', referenceRange: '30 - 200', status: 'normal' },
        { id: 'm-14', marker: 'Glicemia de Jejum', value: '82', unit: 'mg/dL', referenceRange: '70 - 99', status: 'normal' },
        { id: 'm-15', marker: 'Hemoglobina Glicada (HbA1c)', value: '4.9', unit: '%', referenceRange: '< 5.7', status: 'normal' },
        { id: 'm-16', marker: 'Colesterol Total', value: '168', unit: 'mg/dL', referenceRange: '< 190', status: 'normal' },
        { id: 'm-17', marker: 'Colesterol LDL', value: '94', unit: 'mg/dL', referenceRange: '< 130', status: 'normal' },
        { id: 'm-18', marker: 'Colesterol HDL', value: '62', unit: 'mg/dL', referenceRange: '> 40', status: 'normal' },
        { id: 'm-19', marker: 'Triglicerídeos', value: '85', unit: 'mg/dL', referenceRange: '< 150', status: 'normal' },
        { id: 'm-20', marker: 'TSH Ultra Sensível', value: '1.9', unit: 'mUI/L', referenceRange: '0.4 - 4.5', status: 'normal' }
      ]
    }
  ];

  const [examsList, setExamsList] = useState<LabExam[]>(defaultExams);

  // Biomarcador selecionado para o Gráfico de Linha de Evolução
  const [selectedMarkerName, setSelectedMarkerName] = useState<string>('Vitamina D (25-OH)');

  // Modal para Novo Exame
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamLab, setNewExamLab] = useState('');
  const [newExamDate, setNewExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExamReview, setNewExamReview] = useState('');
  const [newExamMarkers, setNewExamMarkers] = useState<LabMarker[]>([
    { id: 'mk-1', marker: 'Vitamina D (25-OH)', value: '', unit: 'ng/mL', referenceRange: '30 - 60', status: 'normal' },
    { id: 'mk-2', marker: 'Vitamina B12', value: '', unit: 'pg/mL', referenceRange: '350 - 900', status: 'normal' },
    { id: 'mk-3', marker: 'Ferritina Sérica', value: '', unit: 'ng/mL', referenceRange: '30 - 200', status: 'normal' },
    { id: 'mk-4', marker: 'Glicemia de Jejum', value: '', unit: 'mg/dL', referenceRange: '70 - 99', status: 'normal' },
    { id: 'mk-5', marker: 'Colesterol Total', value: '', unit: 'mg/dL', referenceRange: '< 190', status: 'normal' },
    { id: 'mk-6', marker: 'Triglicerídeos', value: '', unit: 'mg/dL', referenceRange: '< 150', status: 'normal' }
  ]);

  // Lista de todos os biomarcadores únicos encontrados para o seletor
  const allAvailableMarkers = Array.from(
    new Set(
      examsList.flatMap(e => e.markers.map(m => m.marker))
    )
  );

  // Extrair pontos históricos do marcador selecionado ordenados por data
  const markerHistory = examsList
    .map(e => {
      const found = e.markers.find(m => m.marker.toLowerCase() === selectedMarkerName.toLowerCase());
      if (!found || !found.value) return null;
      const numVal = parseFloat(found.value.replace(',', '.'));
      return {
        date: e.date,
        examTitle: e.title,
        value: numVal,
        unit: found.unit,
        refRange: found.referenceRange,
        status: found.status
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime()) as {
      date: string;
      examTitle: string;
      value: number;
      unit: string;
      refRange: string;
      status: string;
    }[];

  const handleSaveNewExam = () => {
    if (!newExamTitle.trim()) return;

    const filledMarkers = newExamMarkers.filter(m => m.value.trim() !== '');

    const created: LabExam = {
      id: `exam-${Date.now()}`,
      date: newExamDate,
      laboratory: newExamLab.trim() || 'Laboratório de Análises',
      title: newExamTitle.trim(),
      nutriaClinicalReview: newExamReview.trim() || 'Exame cadastrado no prontuário do paciente.',
      markers: filledMarkers
    };

    const updated = [created, ...examsList];
    setExamsList(updated);

    onUpdatePatient({
      ...patient,
      labExams: updated
    });

    setIsAddingExam(false);
    setNewExamTitle('');
    setNewExamLab('');
    setNewExamReview('');
  };

  const handleDeleteExam = (id: string) => {
    const updated = examsList.filter(e => e.id !== id);
    setExamsList(updated);
    onUpdatePatient({
      ...patient,
      labExams: updated
    });
  };

  // SVG Chart Geometry
  const minVal = markerHistory.length > 0 ? Math.min(...markerHistory.map(h => h.value)) * 0.8 : 0;
  const maxVal = markerHistory.length > 0 ? Math.max(...markerHistory.map(h => h.value)) * 1.2 : 100;
  const chartHeight = 160;
  const chartWidth = 500;

  const getCoordinates = (index: number, val: number, total: number) => {
    const x = total <= 1 ? chartWidth / 2 : (index / (total - 1)) * (chartWidth - 60) + 30;
    const range = maxVal - minVal || 1;
    const y = chartHeight - ((val - minVal) / range) * (chartHeight - 40) - 20;
    return { x, y };
  };

  const points = markerHistory.map((h, i) => getCoordinates(i, h.value, markerHistory.length));
  const pathD = points.length > 1 
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}` 
    : points.length === 1 ? `M ${points[0].x},${points[0].y}` : '';

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Central de Exames */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/60 text-fuchsia-400">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Central de Exames Laboratoriais & Biomarcadores
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Gerenciamento da saúde bioquímica com gráficos de linha de evolução comparados às faixas ideais
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddingExam(!isAddingExam)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all border border-fuchsia-400/40"
              id="btn-add-lab-exam"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingExam ? 'Fechar' : '+ Novo Exame Laboratorial'}</span>
            </button>

            <button
              onClick={() => onOpenNutriaWithPrompt(`Nutria, elabore um parecer clínico bioquímico integrativo para ${patient.name}, analisando todos os marcadores dos exames laboratoriais cadastrados e correlacionando com os objetivos nutricionais.`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-fuchsia-200 border border-fuchsia-500/40 rounded-xl text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Interpretação Bioquímica NUTRIA</span>
            </button>
          </div>
        </div>

        {/* Modal de Cadastro de Exames */}
        {isAddingExam && (
          <div className="mt-5 p-5 bg-[#1d0637] rounded-2xl border border-fuchsia-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-fuchsia-400" />
                Cadastrar Novo Exame & Biomarcadores
              </h4>
              <button onClick={() => setIsAddingExam(false)} className="text-xs text-purple-300 hover:text-white">
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-purple-200 font-bold block mb-1">Título do Painel: *</label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder="Ex: Hemograma & Perfil Lipídico 2026"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Laboratório:</label>
                <input
                  type="text"
                  value={newExamLab}
                  onChange={(e) => setNewExamLab(e.target.value)}
                  placeholder="Ex: Laboratório Fleury"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Data da Coleta:</label>
                <input
                  type="date"
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-purple-200 border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-white block">Preencher Valores dos Biomarcadores:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {newExamMarkers.map((marker, idx) => (
                  <div key={marker.id} className="p-2.5 bg-[#120326] rounded-xl border border-purple-800/50 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-white block text-[11px]">{marker.marker}</span>
                      <span className="text-[10px] text-purple-400">Ref: {marker.referenceRange} {marker.unit}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Valor"
                      value={marker.value}
                      onChange={(e) => {
                        const updated = [...newExamMarkers];
                        updated[idx].value = e.target.value;
                        setNewExamMarkers(updated);
                      }}
                      className="w-20 p-1.5 text-center font-bold rounded-lg bg-[#1d0637] text-fuchsia-300 border border-purple-700/60 focus:outline-none text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-purple-200 font-bold block mb-1 text-xs">Parecer do Nutricionista:</label>
              <textarea
                value={newExamReview}
                onChange={(e) => setNewExamReview(e.target.value)}
                placeholder="Observações clínicas e conduta adotada..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleSaveNewExam}
                disabled={!newExamTitle.trim()}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Salvar Exame Laboratorial
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* GRÁFICO DE LINHA DE EVOLUÇÃO DOS BIOMARCADORES                  */}
      {/* ============================================================== */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/60 text-fuchsia-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">
                  Gráfico de Linha de Evolução do Biomarcador
                </h4>
                <p className="text-xs text-purple-200 mt-0.5">
                  Acompanhe a curva subindo ou descendo ao longo dos meses e compare com o valor ideal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-300 font-bold">Selecionar Biomarcador:</span>
            <select
              value={selectedMarkerName}
              onChange={(e) => setSelectedMarkerName(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#120326] text-fuchsia-300 border border-purple-700/60 focus:outline-none"
            >
              {allAvailableMarkers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Renderizador do Gráfico de Linha SVG */}
        {markerHistory.length > 0 ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#120326] rounded-2xl border border-purple-800/50 space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-purple-900/40">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{selectedMarkerName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-700/50 font-bold">
                    Ref: {markerHistory[0]?.refRange} {markerHistory[0]?.unit}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-purple-300">Último valor: </span>
                  <span className="font-black text-fuchsia-300 text-sm">
                    {markerHistory[markerHistory.length - 1]?.value} {markerHistory[0]?.unit}
                  </span>
                </div>
              </div>

              {/* Área do SVG */}
              <div className="w-full overflow-x-auto py-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-44 sm:h-52 overflow-visible"
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#e879f9" />
                    </linearGradient>
                    <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Linhas de Grade de Fundo */}
                  <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#3b0764" strokeDasharray="3 3" strokeWidth="1" />
                  <line x1="20" y1={chartHeight / 2} x2={chartWidth - 20} y2={chartHeight / 2} stroke="#3b0764" strokeDasharray="3 3" strokeWidth="1" />
                  <line x1="20" y1={chartHeight - 20} x2={chartWidth - 20} y2={chartHeight - 20} stroke="#3b0764" strokeDasharray="3 3" strokeWidth="1" />

                  {/* Linha do Gráfico */}
                  {points.length > 1 && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Pontos de Dados */}
                  {points.map((p, idx) => {
                    const item = markerHistory[idx];
                    return (
                      <g key={idx} className="cursor-pointer">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="6"
                          fill="#150328"
                          stroke="#e879f9"
                          strokeWidth="3"
                        />
                        <text
                          x={p.x}
                          y={p.y - 12}
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {item.value}
                        </text>
                        <text
                          x={p.x}
                          y={chartHeight - 4}
                          fill="#c084fc"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {item.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Destaque da Análise do Marcador */}
            <div className="p-3.5 bg-[#1d0637] rounded-2xl border border-purple-800/40 flex items-center justify-between text-xs">
              <span className="text-purple-200">
                💡 <strong>Análise Evolutiva:</strong> O biomarcador <strong>{selectedMarkerName}</strong> evoluiu de{' '}
                <strong>{markerHistory[0]?.value} {markerHistory[0]?.unit}</strong> ({markerHistory[0]?.date}) para{' '}
                <strong className="text-fuchsia-300">{markerHistory[markerHistory.length - 1]?.value} {markerHistory[0]?.unit}</strong> ({markerHistory[markerHistory.length - 1]?.date}).
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-purple-200 bg-[#120326] rounded-2xl border border-purple-800/30">
            <p className="text-xs">Nenhum dado numérico encontrado para este biomarcador nos exames cadastrados.</p>
          </div>
        )}
      </div>

      {/* Lista de Exames Anexados e Avaliações */}
      <div className="space-y-4">
        <h4 className="font-bold text-white text-base flex items-center gap-2">
          <FileText className="w-5 h-5 text-fuchsia-400" />
          Laudos e Painéis Laboratoriais Cadastrados ({examsList.length})
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {examsList.map((exam) => (
            <div key={exam.id} className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-purple-950 text-rose-300 border border-purple-700/50">
                      Exame Laboratorial
                    </span>
                    <h5 className="font-bold text-base text-white">{exam.title}</h5>
                  </div>
                  <span className="text-xs text-purple-300 mt-1 block">
                    {exam.laboratory} • Coleta em {exam.date}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="text-purple-400 hover:text-rose-400 text-xs p-1"
                  title="Remover Exame"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Tabela de Marcadores do Exame */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {exam.markers.map((m) => (
                  <div key={m.id} className="p-3 bg-[#1d0637] rounded-2xl border border-purple-800/40 space-y-1">
                    <span className="text-[10px] font-bold text-purple-300 block truncate">{m.marker}</span>
                    <p className="text-sm font-black text-white">{m.value} <span className="text-[10px] font-normal text-purple-400">{m.unit}</span></p>
                    <span className="text-[9px] text-purple-400 block">Ref: {m.referenceRange}</span>
                  </div>
                ))}
              </div>

              {exam.nutriaClinicalReview && (
                <div className="p-4 bg-[#120326] rounded-2xl border border-fuchsia-900/40 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-fuchsia-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parecer Clínico Integrativo (NUTRIA / Nutricionista):</span>
                  </div>
                  <p className="text-purple-200 leading-relaxed">
                    {exam.nutriaClinicalReview}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
