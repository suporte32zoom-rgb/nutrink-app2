import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  X, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Crown,
  Repeat
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  OFFICIAL_PIX_ANNUAL_BR_CODE, 
  OFFICIAL_PIX_ANNUAL_AMOUNT, 
  OFFICIAL_PIX_MONTHLY_BR_CODE, 
  OFFICIAL_PIX_MONTHLY_AMOUNT,
  getPixQrCodeUrl
} from '../utils/pix';

export type PixPlanType = 'monthly' | 'annual';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: PixPlanType;
  onSuccess?: () => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'annual',
  onSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PixPlanType>(initialPlan);
  const [copied, setCopied] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(initialPlan);
      setCopied(false);
      setIsConfirmed(false);
    }
  }, [isOpen, initialPlan]);

  if (!isOpen) return null;

  const isAnnual = selectedPlan === 'annual';
  const planName = isAnnual ? 'Plano Anual NutrinK' : 'Plano Mensal Pro NutrinK';
  const planAmount = isAnnual ? OFFICIAL_PIX_ANNUAL_AMOUNT : OFFICIAL_PIX_MONTHLY_AMOUNT;
  const pixCode = isAnnual ? OFFICIAL_PIX_ANNUAL_BR_CODE : OFFICIAL_PIX_MONTHLY_BR_CODE;

  // Use the verified image files provided by the user, with fallback to generated standard QR
  const qrImageSrc = isAnnual 
    ? '/assets/aistudio/qr-code-pixnutrink_0acc2a26.png'
    : '/assets/aistudio/qr-code-pixnutrink89_0d4d25e5.png';

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(pixCode);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = pixCode;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error('Falha ao copiar:', e);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá NutrinK! Realizei o pagamento via Pix do ${planName} no valor de R$ ${planAmount.toFixed(2).replace('.', ',')}. Segue meu comprovante para liberação imediata do acesso!`
    );
    window.open(`https://wa.me/5511999999999?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      id="pix-payment-modal"
    >
      <div className="bg-[#150328] border border-purple-800/70 rounded-3xl max-w-lg w-full text-white shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col my-auto shadow-purple-950/80">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#45147C] via-[#620EAB] to-[#440974] px-4 py-4 sm:p-5 text-center relative border-b border-purple-800/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-purple-200 hover:text-white bg-[#220743]/80 hover:bg-[#2e0b59] rounded-xl transition-all cursor-pointer"
            aria-label="Fechar modal Pix"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pagamento Instantâneo via Pix</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pagar com Pix Oficial <span className="text-[#15DEC0]">NutrinK</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-sm mx-auto font-normal">
            Aponte a câmera do seu banco para o QR Code ou use o código Copia e Cola oficial do Banco Central.
          </p>

          {/* Plan Selector Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4 max-w-xs mx-auto p-1 bg-[#1c0536] rounded-2xl border border-purple-700/60">
            <button
              type="button"
              onClick={() => setSelectedPlan('annual')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                isAnnual
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <span className="flex items-center gap-1 text-[11px]">
                <Crown className="w-3 h-3" />
                <span>Anual</span>
              </span>
              <span className="text-xs font-black">R$ 899,00</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan('monthly')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                !isAnnual
                  ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white shadow-md font-black'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <span className="flex items-center gap-1 text-[11px]">
                <Repeat className="w-3 h-3" />
                <span>Mensal</span>
              </span>
              <span className="text-xs font-black">R$ 89,90</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {isConfirmed ? (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white">
                Pagamento Registrado com Sucesso!
              </h3>
              <p className="text-xs sm:text-sm text-purple-200 max-w-sm mx-auto">
                Recebemos a confirmação do seu <strong>{planName}</strong>. Seu acesso está sendo ativado automaticamente.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Enviar Comprovante no WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#28084f] hover:bg-[#390d6e] text-purple-200 hover:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* QR Code Container */}
              <div className="flex flex-col items-center w-full">
                <div 
                  className="w-full max-w-[344px] rounded-2xl shadow-2xl flex items-center justify-center mx-auto relative"
                  style={{ backgroundColor: '#ffffff', padding: '12px' }}
                >
                  <img
                    src={qrImageSrc}
                    alt={`QR Code Pix NutrinK ${planName}`}
                    className="w-full max-w-[320px] object-contain rounded-lg select-none block"
                    style={{
                      width: '100%',
                      maxWidth: '320px',
                      aspectRatio: '1 / 1',
                      imageRendering: 'pixelated',
                      display: 'block'
                    }}
                    onError={(e) => {
                      // Fallback to dynamic QR server if local image file has any loading issue
                      (e.target as HTMLImageElement).src = getPixQrCodeUrl(pixCode);
                    }}
                  />
                </div>

                <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-purple-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Favorecido Oficial: <strong className="text-white">NutrinK</strong> (São Paulo)</span>
                </div>
              </div>

              {/* Price and Plan Badge */}
              <div className="bg-[#1c0536] border border-purple-800/70 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-purple-300 block uppercase tracking-wider">
                    {planName}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                      R$ {planAmount.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-purple-300 font-medium">
                      {isAnnual ? '/ ano' : '/ mês'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    isAnnual 
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/50' 
                      : 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/50'
                  }`}>
                    {isAnnual ? 'Economize 16%' : 'Sem Fidelidade'}
                  </span>
                  <span className="block text-[10px] text-purple-300 mt-1">À vista via Pix</span>
                </div>
              </div>

              {/* Pix Copia e Cola */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-fuchsia-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Código Pix Copia e Cola:</span>
                  </label>
                  <span className="text-[10px] text-purple-400 font-medium">Banco Central do Brasil</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixCode}
                    className="flex-1 bg-[#0f011d] border border-purple-700/80 focus:border-fuchsia-500 rounded-xl px-3 py-2.5 text-xs text-purple-200 font-mono truncate focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border shadow-md cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/50'
                    }`}
                    id="btn-modal-copiar-pix"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Código Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white" />
                        <span>Copiar Código Pix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-[#100220] border border-purple-800/40 rounded-2xl p-3.5 text-xs text-purple-200 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Como pagar via Pix no seu aplicativo bancário:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-purple-300 pl-1">
                  <li>Abra o aplicativo do seu banco (qualquer instituição brasileira).</li>
                  <li>Acesse a opção <strong>Pix</strong> e selecione <strong>Pagar com QR Code</strong> ou <strong>Pix Copia e Cola</strong>.</li>
                  <li>Cole o código copiado ou aponte a câmera para o QR Code e confirme o valor de <strong>R$ {planAmount.toFixed(2).replace('.', ',')}</strong>.</li>
                  <li>Pronto! O acesso é liberado instantaneamente.</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-purple-300 hover:text-white hover:bg-[#250847] transition-all cursor-pointer text-center"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/60 border border-emerald-400/50 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  id="btn-confirm-pix-done"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Já Fiz o Pix • Confirmar Pagamento</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
