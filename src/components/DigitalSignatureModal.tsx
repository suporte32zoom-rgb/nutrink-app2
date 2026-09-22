import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  CheckCircle2, 
  QrCode, 
  Fingerprint, 
  UserCheck, 
  Calendar, 
  Globe, 
  AlertCircle,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { UserAccount, DigitalSignature } from '../types';
import { createDigitalSignature } from '../utils/digitalSignatureUtils';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignature: (signature: DigitalSignature) => void;
  documentTitle: string;
  documentType: string;
  patientName: string;
  patientId: string;
  userAccount?: UserAccount;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirmSignature,
  documentTitle,
  documentType,
  patientName,
  patientId,
  userAccount
}) => {
  const [cpf, setCpf] = useState(userAccount?.cpf || '042.891.320-14');
  const [isSigning, setIsSigning] = useState(false);
  const [successSig, setSuccessSig] = useState<DigitalSignature | null>(null);

  if (!isOpen) return null;

  const professionalName = userAccount?.name || 'Dr(a). Nutricionista Responsável';
  const professionalCouncil = userAccount?.crn || 'CRN-3 48921 / SP';

  const handleSign = async () => {
    setIsSigning(true);
    try {
      // Simulate client IP
      const signature = await createDigitalSignature({
        professionalName,
        professionalCouncil,
        cpf,
        patientName,
        patientId,
        documentTitle,
        documentType,
        ip: '177.136.240.82'
      });

      setSuccessSig(signature);
      setTimeout(() => {
        onConfirmSignature(signature);
        setIsSigning(false);
        setSuccessSig(null);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Error creating digital signature:', err);
      setIsSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#140327] border border-purple-800/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-purple-950/80 text-white space-y-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-fuchsia-500 to-purple-600"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-purple-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                Assinatura Digital de Documento
              </h3>
              <p className="text-xs text-purple-300">
                Geração de Token SHA-256 e Selo de Autenticidade
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-purple-400 hover:text-white rounded-xl hover:bg-purple-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmação Principal Solicitada no Prompt */}
        <div className="p-4 bg-gradient-to-r from-[#210641] to-[#180430] border-2 border-emerald-500/40 rounded-2xl space-y-2">
          <div className="flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Confirmação do Profissional Responsável
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-0.5">
                Confirmar Assinatura Digital de {professionalName} - {professionalCouncil}
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Documento e Paciente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#1c0638] border border-purple-800/50 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">Documento a Assinar</span>
            <div className="font-bold text-white truncate flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>{documentTitle}</span>
            </div>
            <span className="text-[10px] text-purple-300/80 block">Tipo: {documentType}</span>
          </div>

          <div className="p-3 bg-[#1c0638] border border-purple-800/50 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">Paciente Destinatário</span>
            <div className="font-bold text-white truncate">{patientName}</div>
            <span className="text-[10px] text-purple-300/80 block">ID: {patientId}</span>
          </div>
        </div>

        {/* Informações de Autenticação */}
        <div className="space-y-3 bg-[#100220] border border-purple-900/60 rounded-2xl p-4 text-xs">
          <div>
            <label className="text-purple-200 font-bold block mb-1 flex items-center justify-between">
              <span>CPF do Profissional (para chave de integridade):</span>
              <span className="text-[10px] text-purple-400">Padrão ICP-Brasil / CFM / CFN</span>
            </label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full p-2.5 rounded-xl bg-[#1d0637] text-white border border-purple-700/60 focus:border-emerald-400 focus:outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-purple-300/90 border-t border-purple-900/40">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data/Hora: <strong>{new Date().toLocaleDateString('pt-BR')} (Agora)</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Registro de IP: <strong>177.136.240.82</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-600/30">
            <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Será gerado um <strong>Hash SHA-256</strong> inviolável e um <strong>QR Code</strong> de verificação no rodapé do PDF.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSigning}
            className="px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-800/60 text-xs font-bold transition-all disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSign}
            disabled={isSigning}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all hover:scale-[1.02] border border-emerald-400/40 disabled:opacity-50 cursor-pointer"
          >
            {isSigning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Gerando Hash SHA-256 & QR Code...</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4 text-emerald-200" />
                <span>Confirmar e Assinar Digitalmente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
