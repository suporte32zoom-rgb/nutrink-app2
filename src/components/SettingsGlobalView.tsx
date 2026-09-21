import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Crown, 
  Save, 
  Sparkles, 
  Lock, 
  Mail, 
  Building2, 
  CreditCard,
  LogOut,
  CheckCircle2,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react';
import { UserAccount } from '../types';

interface SettingsGlobalViewProps {
  userAccount: UserAccount;
  onSaveProfile: (user: Partial<UserAccount>) => void;
  onOpenSubscriptionModal: () => void;
  onLogout: () => void;
}

export const SettingsGlobalView: React.FC<SettingsGlobalViewProps> = ({
  userAccount,
  onSaveProfile,
  onOpenSubscriptionModal,
  onLogout
}) => {
  const [name, setName] = useState(userAccount.name || '');
  const [email, setEmail] = useState(userAccount.email || '');
  const [crn, setCrn] = useState(userAccount.crn || '');
  const [specialty, setSpecialty] = useState(userAccount.specialty || 'Nutrição Clínica & Funcional');
  const [phone, setPhone] = useState(userAccount.phone || '');
  const [clinicName, setClinicName] = useState(userAccount.clinicName || 'Consultório NutrinK');
  const [consultationFee, setConsultationFee] = useState(userAccount.consultationFee || 250);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      email,
      crn,
      specialty,
      phone,
      clinicName,
      consultationFee: Number(consultationFee)
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isFree = userAccount.plan === 'free';
  const planLabel = userAccount.plan === 'premium_anual'
    ? 'Plano Anual PRO (Ativo)'
    : userAccount.plan === 'premium_mensal'
    ? 'Plano Mensal PRO (Ativo)'
    : 'Plano Gratuito (Free Tier)';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1e073c] via-[#2a0b52] to-[#170530] border border-purple-800/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Configurações do Consultório & Perfil
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80">
              Gerencie suas credenciais profissionais, dados de contato e plano de assinatura.
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3.5 py-2 rounded-xl bg-[#2a0740] hover:bg-rose-950/80 text-rose-300 border border-rose-800/50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start md:self-center"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Dados do consultório atualizados com sucesso e sincronizados!</span>
        </div>
      )}

      {/* Subscription Card */}
      <div className="bg-[#140428] border border-purple-800/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white">Assinatura Atual:</span>
            <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-amber-950 text-amber-300 border border-amber-500/50">
              {planLabel}
            </span>
          </div>
          <p className="text-xs text-purple-300">
            {isFree 
              ? 'Limite diário de 30 mensagens com a NÚTRIA. Faça upgrade para consultas ilimitadas.' 
              : 'Você possui acesso ilimitado a todos os módulos, NÚTRIA Copilot e teleconsultas HD.'}
          </p>
        </div>

        <button
          onClick={onOpenSubscriptionModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-fuchsia-500 hover:from-amber-400 hover:to-fuchsia-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer shrink-0"
        >
          {isFree ? 'Fazer Upgrade para PRO' : 'Gerenciar Plano'}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#140428] border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-purple-800/60 pb-3">
          <User className="w-4 h-4 text-fuchsia-400" />
          <span>Informações do Profissional</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Nome Completo do Profissional
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-fuchsia-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              E-mail Profissional
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-fuchsia-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Registro Profissional (CRN / CRM)
            </label>
            <input
              type="text"
              value={crn}
              onChange={(e) => setCrn(e.target.value)}
              placeholder="Ex: CRN-3 45678 ou CRM-SP 123456"
              className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-fuchsia-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Especialidade / Foco Clínico
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Telefone / WhatsApp de Contato
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-0000"
              className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Nome da Clínica / Consultório
            </label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Valor Padrão da Consulta (R$)
            </label>
            <input
              type="number"
              value={consultationFee}
              onChange={(e) => setConsultationFee(Number(e.target.value))}
              className="w-full bg-[#1b0638] border border-purple-700/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-fuchsia-400"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-purple-800/60 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>

      </form>

    </div>
  );
};
