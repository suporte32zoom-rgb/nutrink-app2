import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  Printer, 
  Send, 
  Sparkles, 
  FileText, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle,
  Share2,
  Download,
  Calendar,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { Patient, ClinicalPrescription, PrescriptionItem, UserAccount } from '../../types';
import { printPrescriptionPdf, sendPrescriptionViaWhatsApp } from '../../utils/pdfExportUtils';

interface PatientPrescriptionsSubcategoryProps {
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  userAccount?: UserAccount;
  onOpenNutriaWithPrompt: (prompt: string) => void;
}

export const PatientPrescriptionsSubcategory: React.FC<PatientPrescriptionsSubcategoryProps> = ({
  patient,
  onUpdatePatient,
  userAccount,
  onOpenNutriaWithPrompt
}) => {
  // Prescrições padrão caso não existam
  const defaultPrescriptions: ClinicalPrescription[] = patient.prescriptions && patient.prescriptions.length > 0 ? patient.prescriptions : [
    {
      id: 'rx-1',
      title: 'Shot Matinal Anti-inflamatório & Digestivo',
      date: new Date().toLocaleDateString('pt-BR'),
      type: 'fitoterapico',
      instructions: 'Diluir em 50ml de água morna com meio limão espremido e consumir em jejum logo ao acordar.',
      items: [
        { id: 'item-1', name: 'Cúrcuma longa padronizada (95% curcuminóides)', dosage: '300 mg', form: 'po', posology: '1 dose ao acordar em jejum', indication: 'Anti-inflamatório e antioxidante' },
        { id: 'item-2', name: 'Própolis Verde em Extrato Alcoólico', dosage: '15 gotas', form: 'gotas', posology: 'Pingar no shot', indication: 'Imunomodulação e saúde intestinal' },
        { id: 'item-3', name: 'Gengibre em pó (Zingiber officinale)', dosage: '200 mg', form: 'po', posology: 'Adicionar ao shot', indication: 'Termogênese e estímulo à digestão' }
      ]
    },
    {
      id: 'rx-2',
      title: 'Fórmula Noturna para Sono Reparador & Relaxamento Neural',
      date: new Date().toLocaleDateString('pt-BR'),
      type: 'manipulado',
      instructions: 'Ingerir 1 sachê ou 2 cápsulas diluídas em 150ml de água morna 45 minutos antes de dormir.',
      items: [
        { id: 'item-4', name: 'Magnésio Inositol (Bisglicinato + Inositol)', dosage: '350 mg', form: 'sache', posology: '1 sachê à noite', indication: 'Relaxamento muscular e síntese de GABA' },
        { id: 'item-5', name: 'L-Teanina', dosage: '200 mg', form: 'sache', posology: 'Junto com o sachê noturno', indication: 'Atenuação de ondas beta e foco na indução do sono' },
        { id: 'item-6', name: 'Passiflora incarnata (extrato seco)', dosage: '250 mg', form: 'sache', posology: 'À noite', indication: 'Fitoterápico anxiolítico e calmante' }
      ]
    },
    {
      id: 'rx-3',
      title: 'Suplementação Esportiva & Performance Mitocondrial',
      date: new Date().toLocaleDateString('pt-BR'),
      type: 'suplemento',
      instructions: 'Consumir diariamente, inclusive em dias de descanso, preferencialmente junto a uma refeição com carboidratos.',
      items: [
        { id: 'item-7', name: 'Creatina Monohidratada 100% Pura Creapure', dosage: '5 g', form: 'po', posology: '5g dissolvidos em água ou shake pós-treino', indication: 'Ressíntese rápida de ATP e hipertrofia' },
        { id: 'item-8', name: 'Whey Protein Isolado (WPI 90%)', dosage: '30 g', form: 'po', posology: '1 scoop (30g) diluído em 200ml de água', indication: 'Aporte de aminoácidos essenciais e leucina' },
        { id: 'item-9', name: 'Ômega-3 Ultra Concentrado (TG) - 1000mg EPA / 400mg DHA', dosage: '2 cápsulas', form: 'capsula', posology: '2 cápsulas com o almoço', indication: 'Cardioproteção e fluidez de membrana' }
      ]
    }
  ];

  const [prescriptionsList, setPrescriptionsList] = useState<ClinicalPrescription[]>(defaultPrescriptions);
  const [isAddingRx, setIsAddingRx] = useState(false);
  const [newRxTitle, setNewRxTitle] = useState('');
  const [newRxType, setNewRxType] = useState<ClinicalPrescription['type']>('manipulado');
  const [newRxInstructions, setNewRxInstructions] = useState('');
  const [newRxItems, setNewRxItems] = useState<PrescriptionItem[]>([
    { id: 'it-1', name: '', dosage: '', form: 'capsula', posology: '', indication: '' }
  ]);

  const handleAddItemRow = () => {
    setNewRxItems([
      ...newRxItems,
      { id: `it-${Date.now()}`, name: '', dosage: '', form: 'capsula', posology: '', indication: '' }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (newRxItems.length <= 1) return;
    setNewRxItems(newRxItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PrescriptionItem, value: any) => {
    const updated = [...newRxItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewRxItems(updated);
  };

  const handleSavePrescription = () => {
    if (!newRxTitle.trim()) return;

    const validItems = newRxItems.filter(it => it.name.trim() !== '');

    const newPrescription: ClinicalPrescription = {
      id: `rx-${Date.now()}`,
      title: newRxTitle.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      type: newRxType,
      instructions: newRxInstructions.trim() || 'Uso conforme posologia indicada.',
      items: validItems.length > 0 ? validItems : [
        { id: 'it-def', name: 'Composto Ativo', dosage: '1 dose', form: 'capsula', posology: '1x ao dia', indication: 'Apoio nutricional' }
      ]
    };

    const updated = [newPrescription, ...prescriptionsList];
    setPrescriptionsList(updated);

    onUpdatePatient({
      ...patient,
      prescriptions: updated
    });

    setIsAddingRx(false);
    setNewRxTitle('');
    setNewRxInstructions('');
    setNewRxItems([{ id: 'it-1', name: '', dosage: '', form: 'capsula', posology: '', indication: '' }]);
  };

  const handleDeletePrescription = (id: string) => {
    const updated = prescriptionsList.filter(rx => rx.id !== id);
    setPrescriptionsList(updated);
    onUpdatePatient({
      ...patient,
      prescriptions: updated
    });
  };

  // Carregar prescrição inteligente da biblioteca NÚTRIA
  const handleLoadTemplate = (templateTitle: string, type: ClinicalPrescription['type'], instructions: string, items: PrescriptionItem[]) => {
    const newRx: ClinicalPrescription = {
      id: `rx-${Date.now()}`,
      title: templateTitle,
      date: new Date().toLocaleDateString('pt-BR'),
      type: type,
      instructions: instructions,
      items: items
    };

    const updated = [newRx, ...prescriptionsList];
    setPrescriptionsList(updated);
    onUpdatePatient({
      ...patient,
      prescriptions: updated
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Central de Prescrições */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/60 text-fuchsia-400">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Prescrições, Manipulados & Suplementação Clínica
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Área dedicada para receitas de fórmulas manipuladas, fitoterápicos e suplementos com exportação direta em PDF limpo e WhatsApp
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddingRx(!isAddingRx)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-md transition-all border border-fuchsia-400/40"
              id="btn-new-prescription"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingRx ? 'Fechar' : '+ Nova Prescrição'}</span>
            </button>

            <button
              onClick={() => onOpenNutriaWithPrompt(`Nutria, elabore uma prescrição clínica integrativa personalizada para ${patient.name} (Objetivo: ${patient.objective}, Peso: ${patient.currentWeightKg}kg, Queixas: sono e recuperação muscular), incluindo dosagens exatas de manipulados e fitoterápicos baseados em evidências.`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#220743] hover:bg-[#2f0b5a] text-fuchsia-200 border border-fuchsia-500/40 rounded-xl text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Sugerir Fórmula com NUTRIA</span>
            </button>
          </div>
        </div>

        {/* Modal de Criação de Prescrição */}
        {isAddingRx && (
          <div className="mt-5 p-5 bg-[#1d0637] rounded-2xl border border-fuchsia-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Pill className="w-4 h-4 text-fuchsia-400" />
                Criar Nova Prescrição ou Fórmula Manipulada
              </h4>
              <button onClick={() => setIsAddingRx(false)} className="text-xs text-purple-300 hover:text-white">
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-purple-200 font-bold block mb-1">Título da Receita / Fórmula: *</label>
                <input
                  type="text"
                  value={newRxTitle}
                  onChange={(e) => setNewRxTitle(e.target.value)}
                  placeholder="Ex: Otimização Mitocondrial & Energética"
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Tipo de Prescrição:</label>
                <select
                  value={newRxType}
                  onChange={(e) => setNewRxType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#120326] text-purple-200 border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none"
                >
                  <option value="manipulado">Fórmula Manipulada (Farmácia)</option>
                  <option value="suplemento">Suplemento Esportivo / Comercial</option>
                  <option value="fitoterapico">Fitoterápico / Tintura / Extrato</option>
                  <option value="fitoterapico_cha">Infusão / Chá Funcional</option>
                </select>
              </div>
            </div>

            {/* Itens / Compostos Dinâmicos */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Compostos Ativos & Dosagens:</span>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="text-xs font-bold text-fuchsia-300 hover:text-white flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Adicionar Composto
                </button>
              </div>

              {newRxItems.map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-[#120326] rounded-xl border border-purple-800/50 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Nome do ativo (ex: Coenzima Q10)"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#1d0637] text-white border border-purple-700/60 focus:outline-none text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Dosagem (ex: 100mg)"
                      value={item.dosage}
                      onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#1d0637] text-white border border-purple-700/60 focus:outline-none text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={item.form}
                      onChange={(e) => handleItemChange(idx, 'form', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#1d0637] text-purple-200 border border-purple-700/60 focus:outline-none text-xs"
                    >
                      <option value="capsula">Cápsula</option>
                      <option value="sache">Sachê</option>
                      <option value="gotas">Gotas</option>
                      <option value="po">Pó / Scoop</option>
                      <option value="comprimido">Comprimido</option>
                      <option value="flaconete">Flaconete</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Posologia (ex: 1 dose com almoço)"
                      value={item.posology}
                      onChange={(e) => handleItemChange(idx, 'posology', e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#1d0637] text-white border border-purple-700/60 focus:outline-none text-xs"
                    />
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="text-purple-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="text-purple-200 font-bold block mb-1 text-xs">Instruções de Uso & Recomendações:</label>
              <textarea
                value={newRxInstructions}
                onChange={(e) => setNewRxInstructions(e.target.value)}
                placeholder="Ex: Mandar aviar em embalagem protegida da luz. Tomar preferencialmente com refeições que contenham lipídios..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#120326] text-white border border-purple-800/60 focus:border-fuchsia-400 focus:outline-none text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleSavePrescription}
                disabled={!newRxTitle.trim()}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Salvar Prescrição no Prontuário
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sugestões Pré-Prontas da NÚTRIA */}
      <div className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md space-y-3">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-fuchsia-400" />
          Modelos Rápidos de Prescrição Inteligente (Clique para carregar):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleLoadTemplate(
              'Complexo Antioxidante & Mitocondrial',
              'manipulado',
              'Ingerir 1 dose após o café da manhã ou almoço.',
              [
                { id: 't-1', name: 'Coenzima Q10 (Ubiquinona)', dosage: '100 mg', form: 'capsula', posology: '1 cápsula ao dia', indication: 'Energia celular mitocondrial' },
                { id: 't-2', name: 'PQQ (Pirroloquinolina Quinona)', dosage: '10 mg', form: 'capsula', posology: '1 cápsula ao dia', indication: 'Biogênese mitocondrial' },
                { id: 't-3', name: 'Vitamina E (Alfa-tocoferol)', dosage: '200 UI', form: 'capsula', posology: '1 cápsula ao dia', indication: 'Proteção lipídica' }
              ]
            )}
            className="p-3 bg-[#1d0637] hover:bg-[#29094e] border border-purple-800/40 rounded-2xl text-left transition-all group"
          >
            <span className="font-bold text-xs text-white group-hover:text-fuchsia-300 block">⚡ Complexo Mitocondrial</span>
            <span className="text-[10px] text-purple-300">CoQ10 + PQQ + Vit E (Manipulado)</span>
          </button>

          <button
            onClick={() => handleLoadTemplate(
              'Modulação Intestinal & Eixo Cérebro-Intestino',
              'manipulado',
              'Dissolver o sachê em 100ml de água e tomar à noite antes de dormir.',
              [
                { id: 't-4', name: 'L-Glutamina Pura', dosage: '5 g', form: 'sache', posology: '1 sachê à noite', indication: 'Trofeobiótico para enterócitos' },
                { id: 't-5', name: 'Goma Acácia (Fibregum B)', dosage: '3 g', form: 'sache', posology: 'No mesmo sachê', indication: 'Prebiótico de fermentação lenta' },
                { id: 't-6', name: 'Mix de Probióticos (L. acidophilus, B. lactis)', dosage: '5 Bilhões UFC', form: 'sache', posology: 'À noite', indication: 'Equilíbrio da microbiota' }
              ]
            )}
            className="p-3 bg-[#1d0637] hover:bg-[#29094e] border border-purple-800/40 rounded-2xl text-left transition-all group"
          >
            <span className="font-bold text-xs text-white group-hover:text-fuchsia-300 block">🌿 Saúde Intestinal & Probióticos</span>
            <span className="text-[10px] text-purple-300">Glutamina + Goma Acácia + Probióticos</span>
          </button>

          <button
            onClick={() => handleLoadTemplate(
              'Combinação Ergogênica para Hipertrofia',
              'suplemento',
              'Tomar a creatina diariamente. Whey no pós-treino ou lanches intermediários.',
              [
                { id: 't-7', name: 'Creatina Creapure 100%', dosage: '5 g', form: 'po', posology: '5g todos os dias', indication: 'Força e volume celular' },
                { id: 't-8', name: 'Beta-Alanina', dosage: '3 g', form: 'po', posology: 'Fracionado 1.5g 2x ao dia', indication: 'Tamponamento de H+ e resistência' },
                { id: 't-9', name: 'Proteína do Soro do Leite (Whey 80%)', dosage: '30 g', form: 'po', posology: '1 scoop com água', indication: 'Aporte de MPS' }
              ]
            )}
            className="p-3 bg-[#1d0637] hover:bg-[#29094e] border border-purple-800/40 rounded-2xl text-left transition-all group"
          >
            <span className="font-bold text-xs text-white group-hover:text-fuchsia-300 block">💪 Hipertrofia & Força Muscular</span>
            <span className="text-[10px] text-purple-300">Creatina + Beta-Alanina + Whey</span>
          </button>
        </div>
      </div>

      {/* Lista de Prescrições do Paciente */}
      <div className="space-y-4">
        <h4 className="font-bold text-white text-base flex items-center gap-2">
          <Pill className="w-5 h-5 text-fuchsia-400" />
          Prescrições Emitidas para {patient.name} ({prescriptionsList.length})
        </h4>

        <div className="grid grid-cols-1 gap-5">
          {prescriptionsList.map((rx) => (
            <div key={rx.id} className="bg-[#150328] border border-purple-900/50 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-purple-950 text-amber-300 border border-purple-700/60">
                      {rx.type}
                    </span>
                    <h5 className="font-bold text-base text-white">{rx.title}</h5>
                  </div>
                  <span className="text-xs text-purple-300 mt-0.5 block">
                    Emitida em {rx.date} • {rx.items.length} componentes ativos
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Botão Exportar PDF Limpo */}
                  <button
                    onClick={() => printPrescriptionPdf(patient, rx, userAccount)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#29094e] hover:bg-[#380b6a] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold transition-all shadow-sm"
                    title="Exportar Receituário em PDF limpo para impressão"
                  >
                    <Printer className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Exportar PDF</span>
                  </button>

                  {/* Botão WhatsApp Direto */}
                  <button
                    onClick={() => sendPrescriptionViaWhatsApp(patient, rx, userAccount)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-bold transition-all shadow-sm"
                    title="Enviar receita via WhatsApp para paciente ou farmácia"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleDeletePrescription(rx.id)}
                    className="p-1.5 text-purple-400 hover:text-rose-400 rounded-lg transition-colors"
                    title="Remover Prescrição"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabela de Compostos da Prescrição */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-purple-100">
                  <thead className="bg-[#1d0637] text-purple-200 uppercase font-bold border-b border-purple-900/40">
                    <tr>
                      <th className="p-2.5">Composto / Ativo</th>
                      <th className="p-2.5">Dosagem</th>
                      <th className="p-2.5">Forma</th>
                      <th className="p-2.5">Posologia / Como Tomar</th>
                      <th className="p-2.5">Indicação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {rx.items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#1d0637]/50">
                        <td className="p-2.5 font-bold text-white">{item.name}</td>
                        <td className="p-2.5 font-black text-fuchsia-300">{item.dosage}</td>
                        <td className="p-2.5 capitalize">{item.form}</td>
                        <td className="p-2.5 text-purple-200">{item.posology}</td>
                        <td className="p-2.5 text-purple-300 italic">{item.indication || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rx.instructions && (
                <div className="p-3.5 bg-[#120326] rounded-2xl border border-purple-800/40 text-xs text-purple-200 flex items-start gap-2">
                  <span className="font-bold text-white shrink-0">📝 Modo de Uso:</span>
                  <span>{rx.instructions}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
