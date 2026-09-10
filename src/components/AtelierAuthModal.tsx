import { useState, FormEvent, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, KeyRound, Check, X, ArrowLeft } from 'lucide-react';
import { NeriLogo } from './NeriLogo';

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
  onUpdatePassword,
}: AtelierAuthModalProps) {
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Change password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEnteredPassword('');
      setError('');
      setChangeSuccess('');
      setIsChangingPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!enteredPassword.trim()) {
      setError('Por favor, digite a senha.');
      return;
    }

    if (enteredPassword === currentPassword) {
      setError('');
      onSuccess();
      onClose();
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setChangeSuccess('');

    if (oldPassword !== currentPassword) {
      setError('A senha atual digitada está incorreta.');
      return;
    }

    if (newPassword.length < 4) {
      setError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não confere.');
      return;
    }

    if (onUpdatePassword) {
      onUpdatePassword(newPassword);
      setChangeSuccess('Senha alterada com sucesso!');
      setTimeout(() => {
        setIsChangingPassword(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1200);
    }
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
            {isChangingPassword ? 'Alterar Senha do Ateliê' : 'Acesso Restrito ao Ateliê'}
          </h3>
          <p className="text-xs text-cyan-100/75 mt-1 max-w-xs mx-auto">
            {isChangingPassword
              ? 'Defina uma nova senha para proteger o acesso às funções administrativas.'
              : 'Digite sua senha para desbloquear a gestão de pedidos, cálculos, estoque e relatórios.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!isChangingPassword ? (
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

              {/* Informative Hint Box */}
              <div className="bg-cyan-50/70 border border-cyan-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-cyan-900">
                <span className="font-bold text-cyan-700 bg-cyan-100 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                  Dica
                </span>
                <div className="leading-relaxed">
                  A senha padrão de acesso é: <strong className="font-mono text-cyan-800 font-bold bg-white px-1.5 py-0.5 rounded border border-cyan-200">neri2026</strong>
                </div>
              </div>

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
                    onClick={() => setIsChangingPassword(true)}
                    className="text-slate-500 hover:text-cyan-700 font-medium transition-colors"
                  >
                    Alterar senha
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
                  >
                    Continuar como Cliente
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Change Password View */
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Senha atual..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 dígitos..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>

              {error && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </p>
              )}

              {changeSuccess && (
                <p className="text-xs font-semibold text-teal-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  {changeSuccess}
                </p>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow transition-colors"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
