import { useState, FormEvent, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, KeyRound, Check, X, MessageCircle } from 'lucide-react';
import { NeriLogo } from './NeriLogo';
import { openWhatsAppNotification, ATELIER_WHATSAPP_RAW, ATELIER_PHONE_DISPLAY } from '../utils/whatsappHelper';

interface AtelierAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPassword: string;
  onUpdatePassword?: (newPass: string) => void;
}

export function AtelierAuthModal({
  isOpen,
  onClose,
  onSuccess,
  currentPassword,
}: AtelierAuthModalProps) {
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [sentToWhatsApp, setSentToWhatsApp] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEnteredPassword('');
      setError('');
      setSentToWhatsApp(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!enteredPassword.trim()) {
      setError('Por favor, digite a senha de acesso.');
      return;
    }

    if (enteredPassword === currentPassword) {
      setError('');
      onSuccess();
      onClose();
    } else {
      setError('Senha incorreta. Verifique os dados ou solicite o envio pelo WhatsApp.');
    }
  };

  const handleSendPasswordToWhatsApp = () => {
    setError('');
    const message =
      `Olá Ateliê Neri Bordados! 🔐🧵\n\n` +
      `Aqui está a sua *Senha de Acesso ao Sistema*:\n\n` +
      `🔑 *Senha de Acesso:* ${currentPassword}\n\n` +
      `Utilize esta senha para desbloquear a gestão de pedidos, cálculos, estoque e relatórios no painel administrativo.\n\n` +
      `_Ateliê Neri Bordados Computadorizados_ ✨`;

    openWhatsAppNotification(ATELIER_WHATSAPP_RAW, message);
    setSentToWhatsApp(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top brand header */}
        <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar e continuar como cliente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center mb-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <NeriLogo size="sm" showText={false} />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 mb-2">
            <Lock className="w-3 h-3 text-cyan-300" />
            Ambiente Seguro do Ateliê
          </div>

          <h3 className="text-xl font-bold text-white font-display">
            Acesso Restrito ao Ateliê
          </h3>
          <p className="text-xs text-cyan-100/75 mt-1 max-w-xs mx-auto">
            Digite sua senha para desbloquear a gestão de pedidos, cálculos, estoque e relatórios.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={enteredPassword}
                  onChange={(e) => {
                    setEnteredPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Digite a senha..."
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>

            {/* Notification when password was sent to WhatsApp */}
            {sentToWhatsApp && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold text-emerald-900">Senha enviada para o WhatsApp!</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    A senha de acesso foi enviada para o número <strong>{ATELIER_PHONE_DISPLAY}</strong>. Verifique seu aplicativo WhatsApp.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                id="btn-confirm-atelier-auth"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Desbloquear e Entrar no Ateliê
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleSendPasswordToWhatsApp}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 transition-colors group py-1"
                  title={`Enviar senha de acesso para o WhatsApp ${ATELIER_PHONE_DISPLAY}`}
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100 group-hover:scale-110 transition-transform" />
                  <span>Alterar senha</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-800 font-medium transition-colors py-1"
                >
                  Continuar como Cliente
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
