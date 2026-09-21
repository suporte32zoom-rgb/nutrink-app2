import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Users, 
  Bot, 
  ChevronRight, 
  Activity, 
  Heart, 
  Plus, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Patient, UserAccount } from '../types';
import { PatientBiomarkersSubcategory } from './patient-subcategories/PatientBiomarkersSubcategory';

interface ExamsGlobalViewProps {
  patients: Patient[];
  onUpdatePatient: (updatedPatient: Patient) => void;
  onOpenNutriaWithPrompt: (prompt: string) => void;
  userAccount?: UserAccount;
  initialSelectedPatientId?: string | null;
}

export const ExamsGlobalView: React.FC<ExamsGlobalViewProps> = ({
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

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0] || null;

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchPatientQuery.toLowerCase()) ||
    p.objective.toLowerCase().includes(searchPatientQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1e073c] via-[#2a0b52] to-[#170530] border border-purple-800/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Central de Exames Laboratoriais & Biomarcadores
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/80">
                Interpretação clínica, painéis bioquímicos, faixas de referência e parecer com IA NÚTRIA.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNutriaWithPrompt("Interprete os últimos exames laboratoriais do meu paciente e aponte desvios de Ferritina, Vitamina D, B12 e Glicemia")}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md border border-fuchsia-400/40 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Interpretar com NÚTRIA</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Patient Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#140428] border border-purple-800/60 rounded-2xl p-4 space-y-3 shadow-md">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Selecione o Paciente ({patients.length})</span>
            </h3>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPatientQuery}
                onChange={(e) => setSearchPatientQuery(e.target.value)}
                placeholder="Buscar paciente..."
                className="w-full bg-[#1b0638] border border-purple-700/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                const examCount = p.labExams ? p.labExams.length : 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#29084f] border-fuchsia-500/70 text-white shadow-md'
                        : 'bg-[#180531] border-purple-800/40 hover:bg-[#220743] text-purple-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate text-white">{p.name}</div>
                      <div className="text-[10px] text-purple-300/80 mt-0.5">{p.age} anos • {p.gender}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-fuchsia-300 border border-purple-700/50">
                        {examCount} {examCount === 1 ? 'Exame' : 'Exames'}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-fuchsia-400' : 'text-purple-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Exams Area */}
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
                      Exames & Biomarcadores de {selectedPatient.name}
                    </h2>
                    <p className="text-xs text-purple-300">
                      Histórico laboratorial e metas clínicas
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/pacientes/${selectedPatient.id}`)}
                  className="px-3 py-1.5 rounded-xl bg-[#220743] hover:bg-[#2f0a5c] text-purple-200 text-xs font-bold flex items-center gap-1 border border-purple-700/50 transition-all cursor-pointer"
                >
                  <span>Ver Prontuário</span>
                  <ArrowRight className="w-3.5 h-3.5 text-fuchsia-400" />
                </button>
              </div>

              <PatientBiomarkersSubcategory
                patient={selectedPatient}
                onUpdatePatient={onUpdatePatient}
                onOpenNutriaWithPrompt={onOpenNutriaWithPrompt}
              />
            </div>
          ) : (
            <div className="bg-[#140428] border border-purple-800/60 rounded-3xl p-12 text-center text-purple-300">
              <Activity className="w-12 h-12 mx-auto text-purple-500/50 mb-3" />
              <p className="font-bold">Nenhum paciente selecionado</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
