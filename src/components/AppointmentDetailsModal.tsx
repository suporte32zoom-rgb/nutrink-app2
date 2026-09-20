import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  Save, 
  Send, 
  Check, 
  User, 
  DollarSign, 
  CreditCard, 
  FileText, 
  ExternalLink,
  Bot,
  CalendarClock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Appointment, Patient, AppointmentType, LocationType, AppointmentStatus } from '../types';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  patients: Patient[];
  onSaveAppointment: (updated: Appointment) => Promise<void> | void;
  onDeleteAppointment: (appointmentId: string) => Promise<void> | void;
  onSelectPatient?: (patientId: string) => void;
  onStartTelemedicine?: (patientId: string) => void;
  onOpenNutriaWithPrompt?: (prompt: string) => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patients,
  onSaveAppointment,
  onDeleteAppointment,
  onSelectPatient,
  onStartTelemedicine,
  onOpenNutriaWithPrompt
}) => {
  if (!isOpen || !appointment) return null;

  const [patientId, setPatientId] = useState(appointment.patientId || '');
  const [patientName, setPatientName] = useState(appointment.patientName || '');
  const [patientPhone, setPatientPhone] = useState(appointment.patientPhone || '');
  const [patientEmail, setPatientEmail] = useState(appointment.patientEmail || '');
  const [date, setDate] = useState(appointment.date || '');
  const [time, setTime] = useState(appointment.time || '');
  const [durationMinutes, setDurationMinutes] = useState(appointment.durationMinutes || 50);
  const [type, setType] = useState<AppointmentType>(appointment.type || 'retorno');
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status || 'confirmada');
  const [location, setLocation] = useState<LocationType>(appointment.location || 'presencial_consultorio');
  const [price, setPrice] = useState<number>(appointment.price || 0);
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente'>(appointment.paymentStatus || 'pendente');
  const [paymentMethod, setPaymentMethod] = useState(appointment.paymentMethod || 'pix');
  const [notes, setNotes] = useState(appointment.notes || '');

  const [isCopiedWhatsApp, setIsCopiedWhatsApp] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Sync state when appointment prop changes
  useEffect(() => {
    if (appointment) {
      setPatientId(appointment.patientId || '');
      setPatientName(appointment.patientName || '');
      setPatientPhone(appointment.patientPhone || '');
      setPatientEmail(appointment.patientEmail || '');
      setDate(appointment.date || '');
      setTime(appointment.time || '');
      setDurationMinutes(appointment.durationMinutes || 50);
      setType(appointment.type || 'retorno');
      setStatus(appointment.status || 'confirmada');
      setLocation(appointment.location || 'presencial_consultorio');
      setPrice(appointment.price || 0);
      setPaymentStatus(appointment.paymentStatus || 'pendente');
      setPaymentMethod(appointment.paymentMethod || 'pix');
      setNotes(appointment.notes || '');
      setShowDeleteConfirm(false);
      setSaveFeedback(null);
    }
  }, [appointment]);

  const handlePatientSelectChange = (newPatId: string) => {
    setPatientId(newPatId);
    const found = patients.find(p => p.id === newPatId);
    if (found) {
      setPatientName(found.name);
      setPatientPhone(found.phone || '');
      setPatientEmail(found.email || '');
    }
  };

  const handleCopyWhatsApp = () => {
    const formattedDate = date ? date.split('-').reverse().join('/') : '';
    const locationText = location === 'presencial_consultorio' ? 'Presencial no Consultório' : 'Online por Telemedicina (Vídeo)';
    const msg = `Olá, ${patientName}! Tudo bem? Passando para confirmar seu agendamento nutricional no NutrinK para o dia ${formattedDate} às ${time} (${locationText}). Qualquer dúvida estamos à disposição!`;
    
    navigator.clipboard.writeText(msg);
    setIsCopiedWhatsApp(true);
    setTimeout(() => setIsCopiedWhatsApp(false), 3000);
  };

  const handleQuickStatusChange = async (newStatus: AppointmentStatus) => {
    setStatus(newStatus);
    const updated: Appointment = {
      ...appointment,
      patientId: patientId || undefined,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || undefined,
      patientEmail: patientEmail.trim() || undefined,
      date,
      time,
      durationMinutes: Number(durationMinutes) || 50,
      type,
      status: newStatus,
      location,
      price: Number(price) || 0,
      paymentStatus: newStatus === 'realizada' ? 'pago' : paymentStatus,
      paymentMethod: paymentMethod as any,
      notes: notes.trim() || undefined
    };

    setIsSaving(true);
    try {
      await onSaveAppointment(updated);
      setSaveFeedback(`Status atualizado para: ${newStatus.toUpperCase()}`);
      setTimeout(() => setSaveFeedback(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !date || !time) return;

    const updated: Appointment = {
      ...appointment,
      patientId: patientId || undefined,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim() || undefined,
      patientEmail: patientEmail.trim() || undefined,
      date,
      time,
      durationMinutes: Number(durationMinutes) || 50,
      type,
      status,
      location,
      price: Number(price) || 0,
      paymentStatus,
      paymentMethod: paymentMethod as any,
      notes: notes.trim() || undefined
    };

    setIsSaving(true);
    try {
      await onSaveAppointment(updated);
      setSaveFeedback('Consulta salva com sucesso no banco de dados!');
      setTimeout(() => {
        setSaveFeedback(null);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Erro ao salvar consulta:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!appointment.id) return;
    setIsSaving(true);
    try {
      await onDeleteAppointment(appointment.id);
      onClose();
    } catch (err) {
      console.error('Erro ao deletar consulta:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (st: AppointmentStatus) => {
    switch (st) {
      case 'realizada':
        return {
          label: 'Realizada',
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'confirmada':
        return {
          label: 'Confirmada',
          bg: 'bg-purple-950/80 text-purple-200 border-purple-500/60',
          icon: <Check className="w-3.5 h-3.5 text-fuchsia-300" />
        };
      case 'cancelada':
        return {
          label: 'Cancelada',
          bg: 'bg-rose-950/80 text-rose-300 border-rose-600/60',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />
        };
      default:
        return {
          label: 'Pendente',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
          icon: <Clock className="w-3.5 h-3.5 text-amber-400" />
        };
    }
  };

  const currentBadge = getStatusBadge(status);

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0217]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#150328] border border-purple-800/60 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 shadow-fuchsia-950/50 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-purple-900/40 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-fuchsia-950/50 border border-fuchsia-400/30 shrink-0">
              <CalendarIcon className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-black text-white text-base sm:text-lg">Gerenciamento da Consulta</h3>
                <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${currentBadge.bg}`}>
                  {currentBadge.icon}
                  <span>{currentBadge.label}</span>
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                ID: <span className="font-mono text-fuchsia-300">{appointment.id}</span> • Sincronização em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-2 rounded-xl hover:bg-[#250847] transition-all cursor-pointer"
            title="Fechar detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {saveFeedback && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{saveFeedback}</span>
          </div>
        )}

        {/* Quick Action Bar / Status Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-purple-300 uppercase tracking-wider">Ações Rápidas de Status</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            <button
              type="button"
              onClick={() => handleQuickStatusChange('realizada')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                status === 'realizada'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/50'
                  : 'bg-[#200741] text-emerald-300 border-emerald-700/40 hover:bg-emerald-950/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Realizada</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickStatusChange('confirmada')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                status === 'confirmada'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-purple-950/50'
                  : 'bg-[#200741] text-purple-200 border-purple-700/40 hover:bg-purple-950/60'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Confirmada</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickStatusChange('pendente')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                status === 'pendente'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-amber-950/50'
                  : 'bg-[#200741] text-amber-300 border-amber-700/40 hover:bg-amber-950/60'
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              <span>Reagendar</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickStatusChange('cancelada')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                status === 'cancelada'
                  ? 'bg-rose-700 text-white border-rose-400 shadow-rose-950/50'
                  : 'bg-[#200741] text-rose-300 border-rose-700/40 hover:bg-rose-950/60'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Cancelar</span>
            </button>

          </div>
        </div>

        {/* Clinical Utilities Strip (WhatsApp, Telemedicina, Prontuário, NUTRIA) */}
        <div className="flex items-center gap-2 flex-wrap p-3 rounded-2xl bg-[#1d0637] border border-purple-800/40">
          
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="px-3 py-2 rounded-xl bg-[#2b0a54] hover:bg-[#380d6b] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Copiar texto pronto para envio no WhatsApp"
          >
            {isCopiedWhatsApp ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-black">Lembrete Copiado!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-fuchsia-300" />
                <span>WhatsApp Lembrete</span>
              </>
            )}
          </button>

          {location === 'online_video' && onStartTelemedicine && patientId && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartTelemedicine(patientId);
              }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:from-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-fuchsia-950/50 transition-all border border-rose-400/40"
            >
              <Video className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Abrir Sala de Vídeo</span>
            </button>
          )}

          {patientId && onSelectPatient && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectPatient(patientId);
              }}
              className="px-3 py-2 rounded-xl bg-[#260849] hover:bg-[#340b64] text-fuchsia-300 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Abrir Prontuário</span>
              <ExternalLink className="w-3 h-3 text-purple-400" />
            </button>
          )}

          {onOpenNutriaWithPrompt && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNutriaWithPrompt(`Nutria, prepare um briefing clínico completo para a consulta de ${patientName} agendada para ${date} às ${time} (${type.replace('_', ' ')}).`);
              }}
              className="px-3 py-2 rounded-xl bg-[#260849] hover:bg-[#340b64] text-purple-200 hover:text-white border border-purple-700/60 text-xs font-bold flex items-center gap-1.5 transition-all ml-auto"
            >
              <Bot className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Briefing com NUTRIA</span>
            </button>
          )}

        </div>

        {/* Detailed Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          
          {/* Section 1: Paciente e Contato */}
          <div className="p-4 bg-[#1b0534] rounded-2xl border border-purple-800/50 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <User className="w-4 h-4 text-fuchsia-400" />
              Dados do Paciente
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-purple-200 font-bold block mb-1">Paciente Cadastrado</label>
                {patients.length > 0 ? (
                  <select
                    value={patientId}
                    onChange={(e) => handlePatientSelectChange(e.target.value)}
                    className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-fuchsia-400"
                  >
                    <option value="">-- Paciente Avulso / Não Vinculado --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.phone ? `(${p.phone})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-fuchsia-400"
                    placeholder="Nome completo do paciente"
                  />
                )}
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Nome no Agendamento *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                  placeholder="Nome exibido na grade"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">E-mail do Paciente</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="paciente@exemplo.com"
                  className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-fuchsia-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data, Horário e Modalidade */}
          <div className="p-4 bg-[#1b0534] rounded-2xl border border-purple-800/50 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-fuchsia-400" />
              Data, Horário & Atendimento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-purple-200 font-bold block mb-1">Data da Consulta *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Horário de Início *</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-fuchsia-300 font-black focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Duração Estimada</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-fuchsia-400"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={50}>50 minutos (Padrão)</option>
                  <option value={60}>60 minutos (1 hora)</option>
                  <option value={90}>90 minutos (1h 30m)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-purple-200 font-bold block mb-1">Tipo de Consulta</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AppointmentType)}
                  className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-fuchsia-400"
                >
                  <option value="primeira_consulta">Primeira Consulta (Anamnese Completa)</option>
                  <option value="retorno">Retorno / Acompanhamento Periódico</option>
                  <option value="avaliacao_bioimpedancia">Avaliação Antropométrica / Bioimpedância</option>
                  <option value="ajuste_plano">Ajuste / Atualização de Cardápio</option>
                  <option value="consultoria_online">Consultoria Rápida Online</option>
                </select>
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Modalidade do Atendimento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocation('presencial_consultorio')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      location === 'presencial_consultorio'
                        ? 'bg-fuchsia-950 text-fuchsia-200 border-fuchsia-500 shadow-sm'
                        : 'bg-[#140326] text-purple-300 border-purple-800/60 hover:bg-[#1f063a]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
                    <span>Presencial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocation('online_video')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      location === 'online_video'
                        ? 'bg-indigo-950 text-indigo-200 border-indigo-500 shadow-sm'
                        : 'bg-[#140326] text-purple-300 border-purple-800/60 hover:bg-[#1f063a]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Vídeo Online</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Financeiro & Pagamento */}
          <div className="p-4 bg-[#1b0534] rounded-2xl border border-purple-800/50 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Financeiro & Pagamento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-purple-200 font-bold block mb-1">Valor da Consulta (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Status do Pagamento</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as 'pago' | 'pendente')}
                  className={`w-full border rounded-xl p-2.5 font-bold focus:outline-none ${
                    paymentStatus === 'pago'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                      : 'bg-amber-950/80 text-amber-300 border-amber-600'
                  }`}
                >
                  <option value="pendente">Pendente de Pagamento</option>
                  <option value="pago">Pago / Confirmado</option>
                </select>
              </div>

              <div>
                <label className="text-purple-200 font-bold block mb-1">Método de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-fuchsia-400"
                >
                  <option value="pix">PIX Instantâneo</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="boleto">Boleto Bancário</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Observações e Queixas */}
          <div className="p-4 bg-[#1b0534] rounded-2xl border border-purple-800/50 space-y-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Observações & Anotações Clínicas do Agendamento
            </h4>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Paciente solicitou envio prévio de recordatório alimentar; retorno para ajuste calórico de hipertrofia."
              className="w-full bg-[#140326] border border-purple-700/60 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-fuchsia-400 placeholder:text-purple-400/40"
            />
          </div>

          {/* Delete Confirmation Box */}
          {showDeleteConfirm && (
            <div className="p-4 bg-rose-950/90 border border-rose-600 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-sm">Tem certeza que deseja excluir este agendamento?</h5>
                  <p className="text-xs text-rose-200 mt-0.5">
                    Essa ação removerá o registro permanentemente do banco de dados e da agenda.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-xl bg-purple-900/60 text-purple-200 hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sim, Excluir Registro</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-purple-900/40">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 border border-rose-800/40 transition-all text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Agendamento</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#220743] hover:bg-[#2e0a59] text-purple-200 hover:text-white text-xs font-bold border border-purple-700/60 transition-all"
              >
                Fechar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-fuchsia-950/60 border border-fuchsia-400/40 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
