import React, { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { verifyResetCode, submitNewPassword, applyEmailVerification } from '../services/databaseService';

interface FirebaseAuthActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: string | null;
  oobCode: string | null;
  onSuccessLogin?: (email: string) => void;
}

export const FirebaseAuthActionModal: React.FC<FirebaseAuthActionModalProps> = ({
  isOpen,
  onClose,
  mode,
  oobCode,
  onSuccessLogin
}) => {
  const [accountEmail, setAccountEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !oobCode) {
      setIsVerifyingCode(false);
      return;
    }

    // If it's sample/test code from URL template
    if (oobCode === 'code') {
      setIsVerifyingCode(false);
      setErrorMessage('Este é um link modelo de autenticação. Para redefinir sua senha, solicite um novo link no botão "Esqueci minha senha" na tela de login.');
      return;
    }

    if (mode === 'resetPassword') {
      setIsVerifyingCode(true);
      setErrorMessage(null);
      verifyResetCode(oobCode)
        .then((email) => {
          setAccountEmail(email);
          setIsVerifyingCode(false);
        })
        .catch((err) => {
          console.warn('Erro ao verificar oobCode de redefinição de senha:', err);
          setIsVerifyingCode(false);
          setErrorMessage('O link de redefinição de senha é inválido ou já expirou. Por favor, solicite uma nova redefinição.');
        });
    } else if (mode === 'verifyEmail') {
      setIsVerifyingCode(true);
      setErrorMessage(null);
      applyEmailVerification(oobCode)
        .then(() => {
          setIsVerifyingCode(false);
          setSuccessMessage('Seu e-mail profissional foi verificado com sucesso no NutrinK!');
        })
        .catch((err) => {
          console.warn('Erro ao verificar e-mail:', err);
          setIsVerifyingCode(false);
          setErrorMessage('O link de verificação de e-mail é inválido ou já expirou.');
        });
    } else {
      setIsVerifyingCode(false);
    }
  }, [isOpen, mode, oobCode]);

  if (!isOpen) return null;

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    if (!oobCode || oobCode === 'code') {
      setErrorMessage('Código de redefinição inválido.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitNewPassword(oobCode, newPassword);
      setIsSubmitting(false);
      setSuccessMessage('Sua senha foi redefinida com sucesso! Você já pode acessar seu consultório.');
      if (onSuccessLogin && accountEmail) {
        setTimeout(() => {
          onSuccessLogin(accountEmail);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Erro ao confirmar nova senha:', err);
      setIsSubmitting(false);
      setErrorMessage('Não foi possível redefinir a senha. O link pode ter expirado. Tente solicitar um novo link.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-purple-800/60 shadow-2xl p-6 sm:p-8 text-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-fuchsia-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {mode === 'resetPassword' ? 'Redefinir Senha' : mode === 'verifyEmail' ? 'Verificação de E-mail' : 'Ação de Segurança'}
              </h3>
              <p className="text-xs text-purple-300">Autenticação Segura NutrinK</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading state */}
        {isVerifyingCode && (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-purple-300 text-sm">
            <div className="w-8 h-8 border-3 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
            <span>Validando link de segurança com o Firebase...</span>
          </div>
        )}

        {/* Error message */}
        {!isVerifyingCode && errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-700/50 text-rose-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-100 mb-0.5">Aviso de Segurança</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success message */}
        {!isVerifyingCode && successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-600/60 text-emerald-200 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-100 mb-0.5">Sucesso!</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Form: Reset Password */}
        {!isVerifyingCode && mode === 'resetPassword' && !successMessage && !errorMessage && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            {accountEmail && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200">
                Redefinindo senha para: <span className="font-bold text-white">{accountEmail}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Nova Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-purple-800/60 text-white text-sm focus:outline-none focus:border-fuchsia-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Confirmar Nova Senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-purple-800/60 text-white text-sm focus:outline-none focus:border-fuchsia-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Salvar Nova Senha</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Action Button for non-form or closed cases */}
        {(!isVerifyingCode && (successMessage || errorMessage || mode !== 'resetPassword')) && (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-100 font-semibold text-xs border border-purple-700/60 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Voltar ao Consultório NutrinK</span>
          </button>
        )}
      </div>
    </div>
  );
};
