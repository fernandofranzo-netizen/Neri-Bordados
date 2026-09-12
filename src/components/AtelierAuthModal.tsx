import { useState, FormEvent, useEffect, useRef } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
  Check,
  X,
  Smartphone,
  ArrowLeft,
  ShieldCheck,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { NeriLogo } from './NeriLogo';

const AUTHORIZED_CPF = '06169721480';

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

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
  const [authMode, setAuthMode] = useState<'login' | 'forgot_password'>('login');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // CPF verification states
  const [cpfInput, setCpfInput] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [isCpfVerified, setIsCpfVerified] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cpfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAuthMode('login');
      setEnteredPassword('');
      setError('');
      setCpfInput('');
      setCpfError('');
      setIsCpfVerified(false);
      setCopiedPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (authMode === 'forgot_password' && !isCpfVerified) {
      setTimeout(() => {
        cpfInputRef.current?.focus();
      }, 100);
    }
  }, [authMode, isCpfVerified]);

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
      setError('Senha incorreta. Verifique os dados ou clique em "Esqueci a senha".');
    }
  };

  const handleCpfVerification = (e: FormEvent) => {
    e.preventDefault();
    setCpfError('');
    const rawCpf = cpfInput.replace(/\D/g, '');

    if (!rawCpf) {
      setCpfError('Por favor, digite o número do seu CPF.');
      return;
    }

    if (rawCpf === AUTHORIZED_CPF) {
      setIsCpfVerified(true);
      setCpfError('');
    } else {
      setCpfError('CPF não autorizado ou incorreto. Por favor, verifique o número digitado.');
    }
  };

  const handleCopyPassword = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2500);
    }
  };

  const handleUnlockDirectly = () => {
    onSuccess();
    onClose();
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
            {authMode === 'login' ? (
              <>
                <Lock className="w-3 h-3 text-cyan-300" />
                Ambiente Seguro do Ateliê
              </>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3 text-cyan-300" />
                Recuperação de Acesso
              </>
            )}
          </div>

          <h3 className="text-xl font-bold text-white font-display">
            {authMode === 'login'
              ? 'Acesso Restrito ao Ateliê'
              : isCpfVerified
              ? 'Senha Liberada'
              : 'Esqueci a Senha'}
          </h3>
          <p className="text-xs text-cyan-100/75 mt-1 max-w-xs mx-auto">
            {authMode === 'login'
              ? 'Digite sua senha para desbloquear a gestão de pedidos, cálculos, estoque e relatórios.'
              : isCpfVerified
              ? 'Identidade confirmada com sucesso pelo CPF cadastrado.'
              : 'Para sua segurança, informe seu CPF para consultar a senha de acesso.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {authMode === 'login' ? (
            /* Login Form */
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
                    id="btn-forgot-password-flow"
                    onClick={() => {
                      setError('');
                      setAuthMode('forgot_password');
                    }}
                    className="text-cyan-800 hover:text-cyan-950 font-bold flex items-center gap-1.5 transition-colors group py-1"
                  >
                    <Smartphone className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
                    <span>Esqueci a senha</span>
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
          ) : !isCpfVerified ? (
            /* Forgot Password: CPF Verification Step */
            <form onSubmit={handleCpfVerification} className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  <span>Pergunta de Segurança:</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Por favor, informe o <strong>número do seu CPF</strong> para validar a titularidade e liberar a sua senha de acesso:
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número de CPF
                </label>
                <div className="relative">
                  <input
                    ref={cpfInputRef}
                    type="text"
                    inputMode="numeric"
                    value={cpfInput}
                    onChange={(e) => {
                      setCpfInput(formatCPF(e.target.value));
                      if (cpfError) setCpfError('');
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 tracking-wider font-bold text-center transition-all"
                  />
                </div>
                {cpfError && (
                  <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    {cpfError}
                  </p>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  id="btn-verify-cpf"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verificar CPF e Liberar Senha
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCpfError('');
                    setAuthMode('login');
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar para o Login
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password: Password Revealed Step (after CPF is verified) */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-900">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wide">
                      CPF Validado com Sucesso!
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Sua senha de acesso ao sistema do ateliê é:
                    </p>
                  </div>
                </div>

                {/* Password display card */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between gap-2 shadow-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Senha de Acesso:
                    </span>
                    <p className="font-mono text-xl font-black text-cyan-900 tracking-widest select-all">
                      {currentPassword}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200 hover:border-cyan-300 transition-all shrink-0"
                    title="Copiar senha para a área de transferência"
                  >
                    {copiedPassword ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Direct Unlock Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleUnlockDirectly}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Entrar no Ateliê Agora
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEnteredPassword(currentPassword);
                    setAuthMode('login');
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Voltar para a tela de senha
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

