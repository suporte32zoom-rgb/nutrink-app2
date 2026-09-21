import React, { useState } from 'react';
import { 
  Apple, 
  Search, 
  Plus, 
  Users, 
  Sparkles, 
  Bot, 
  ChevronRight, 
  FileText, 
  Printer, 
  Share2, 
  Scale, 
  Flame, 
  CheckCircle2, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Patient, FoodItem, UserAccount } from '../types';
import { MealPlanEditor } from './MealPlanEditor';
import { EXTENDED_TACO_DATABASE } from '../data/tacoDatabase';

interface MealPlansGlobalViewProps {
  patients: Patient[];
  onUpdatePatient: (updatedPatient: Patient) => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
  userAccount?: UserAccount;
  initialSelectedPatientId?: string | null;
}

export const MealPlansGlobalView: React.FC<MealPlansGlobalViewProps> = ({
  patients,
  onUpdatePatient,
  onOpenNutriaWithPrompt,
  userAccount,
  initialSelectedPatientId
}) => {
  const navigate = useNavigate();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    initialSelectedPatientId || (patients.length > 0 ? patients[0].id : null)
  );
  const [searchPatientQuery, setSearchPatientQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'taco_library'>('editor');
  const [tacoSearch, setTacoSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0] || null;

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchPatientQuery.toLowerCase()) ||
    p.objective.toLowerCase().includes(searchPatientQuery.toLowerCase())
  );

  const tacoCategories = [
    'todos',
    'Cereais e derivados',
    'Verduras, hortaliças e derivados',
    'Frutas e derivados',
    'Gorduras e óleos',
    'Pescados e frutos do mar',
    'Carnes e derivados',
    'Leite e derivados',
    'Leguminosas e derivados',
    'Nozes e sementes',
    'Açúcares e produtos de confeitaria',
    'Bebidas (alcoólicas e não alcoólicas)',
    'Ovos e derivados',
    'Produtos açucarados',
    'Alimentos preparados',
    'Legumes',
    'Suplementos'
  ];

  const filteredFoods = EXTENDED_TACO_DATABASE.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(tacoSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1e073c] via-[#2a0b52] to-[#170530] border border-purple-800/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Central de Planos Alimentares & Dietas
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/80">
                Prescrição dietética individualizada, Tabela TACO/IBGE e exportação em PDF/WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'editor'
                ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/50'
                : 'bg-[#220743] text-purple-200 hover:text-white border border-purple-700/50'
            }`}
          >
            Prescritor por Paciente
          </button>

          <button
            onClick={() => setActiveTab('taco_library')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'taco_library'
                ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/50'
                : 'bg-[#220743] text-purple-200 hover:text-white border border-purple-700/50'
            }`}
          >
            Tabela de Alimentos (TACO)
          </button>

          <button
            onClick={() => onOpenNutriaWithPrompt("Gere um plano alimentar estruturado com distribuição de macros para meu paciente ativo")}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md border border-fuchsia-400/40 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Gerar com NÚTRIA</span>
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Patient Selector Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-[#140428] border border-purple-800/60 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Selecione o Paciente ({patients.length})</span>
                </h3>
              </div>

              {/* Patient Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchPatientQuery}
                  onChange={(e) => setSearchPatientQuery(e.target.value)}
                  placeholder="Buscar paciente por nome..."
                  className="w-full bg-[#1b0638] border border-purple-700/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              {/* Patient List */}
              <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                {filteredPatients.length === 0 ? (
                  <p className="text-xs text-purple-400 py-4 text-center">Nenhum paciente cadastrado.</p>
                ) : (
                  filteredPatients.map((p) => {
                    const isSelected = selectedPatient?.id === p.id;
                    const hasPlan = Boolean(p.mealPlan && p.mealPlan.meals && p.mealPlan.meals.length > 0);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPatientId(p.id);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#29084f] border-fuchsia-500/70 text-white shadow-md'
                            : 'bg-[#180531] border-purple-800/40 hover:bg-[#220743] text-purple-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate text-white">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-purple-300/80 flex items-center gap-2 mt-0.5">
                            <span>{p.currentWeightKg} kg</span>
                            <span>•</span>
                            <span>GET: {p.get || 2000} kcal</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {hasPlan ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                              Dieta Ativa
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-950 text-purple-300 border border-purple-800/50">
                              Sem Dieta
                            </span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-fuchsia-400' : 'text-purple-400'}`} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Meal Plan Editor Area */}
          <div className="lg:col-span-8">
            {selectedPatient ? (
              <div className="bg-[#140428] border border-purple-800/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-purple-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white">
                        Plano Alimentar de {selectedPatient.name}
                      </h2>
                      <p className="text-xs text-purple-300">
                        {selectedPatient.objective.replace('_', ' ').toUpperCase()} • {selectedPatient.age} anos • {selectedPatient.currentWeightKg} kg
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/pacientes/${selectedPatient.id}`)}
                    className="px-3 py-1.5 rounded-xl bg-[#220743] hover:bg-[#2f0a5c] text-purple-200 text-xs font-bold flex items-center gap-1 border border-purple-700/50 transition-all cursor-pointer"
                  >
                    <span>Ver Prontuário Completo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-fuchsia-400" />
                  </button>
                </div>

                <MealPlanEditor
                  patient={selectedPatient}
                  onUpdatePatient={onUpdatePatient}
                  onOpenNutriaWithPrompt={onOpenNutriaWithPrompt}
                  userAccount={userAccount}
                />
              </div>
            ) : (
              <div className="bg-[#140428] border border-purple-800/60 rounded-3xl p-12 text-center text-purple-300 space-y-3">
                <Apple className="w-12 h-12 mx-auto text-purple-500/50" />
                <p className="font-bold">Nenhum paciente selecionado</p>
                <p className="text-xs text-purple-400 max-w-sm mx-auto">
                  Cadastre ou selecione um paciente para estruturar e prescrever o plano alimentar individualizado.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        
        /* TABELA DE ALIMENTOS TACO COMPLETA */
        <div className="bg-[#140428] border border-purple-800/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-fuchsia-400" />
                <span>Base Oficial de Alimentos TACO (UNICAMP) & Suplementação</span>
              </h2>
              <p className="text-xs text-purple-300">
                Mais de 100+ alimentos padronizados com calorias, proteínas, carboidratos, lipídios e fibras.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tacoSearch}
                onChange={(e) => setTacoSearch(e.target.value)}
                placeholder="Filtrar por alimento..."
                className="w-full bg-[#1b0638] border border-purple-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-fuchsia-400"
              />
            </div>
          </div>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-1.5">
            {tacoCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-fuchsia-600 text-white shadow-sm'
                    : 'bg-[#1c063b] text-purple-300 hover:text-white border border-purple-800/40'
                }`}
              >
                {cat === 'todos' ? 'Todos' : cat}
              </button>
            ))}
          </div>

          {/* Food Items Table */}
          <div className="overflow-x-auto rounded-2xl border border-purple-800/60 bg-[#0e021f]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1b063a] text-purple-200 uppercase font-bold text-[10px] border-b border-purple-800/80">
                <tr>
                  <th className="p-3">Alimento</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3 text-right">Porção Padrão</th>
                  <th className="p-3 text-right">Calorias (kcal)</th>
                  <th className="p-3 text-right">Proteína (g)</th>
                  <th className="p-3 text-right">Carboidrato (g)</th>
                  <th className="p-3 text-right">Lipídios (g)</th>
                  <th className="p-3 text-right">Fibras (g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30">
                {filteredFoods.slice(0, 100).map((food) => (
                  <tr key={food.id} className="hover:bg-[#1a0636] transition-colors text-slate-200">
                    <td className="p-3 font-semibold text-white">{food.name}</td>
                    <td className="p-3 text-purple-300">{food.category}</td>
                    <td className="p-3 text-right font-mono">{food.servingSize}</td>
                    <td className="p-3 text-right font-bold text-amber-300">{food.calories}</td>
                    <td className="p-3 text-right font-bold text-rose-300">{food.protein}</td>
                    <td className="p-3 text-right font-bold text-sky-300">{food.carbs}</td>
                    <td className="p-3 text-right font-bold text-amber-400">{food.fat}</td>
                    <td className="p-3 text-right font-bold text-emerald-300">{food.fiber}</td>
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
