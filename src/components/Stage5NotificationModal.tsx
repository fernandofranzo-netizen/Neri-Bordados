import { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Zap, 
  PackageCheck, 
  AlertCircle,
  MessageSquare,
  Sparkles,
  QrCode
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';
import { 
  buildStage5WhatsAppMessage, 
  openWhatsAppNotification, 
  ATELIER_PIX_KEY 
} from '../utils/whatsappHelper';

interface Stage5NotificationModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSent?: (orderId: string, messageText: string) => void;
}

export function Stage5NotificationModal({
  order,
  isOpen,
  onClose,
  onConfirmSent,
}: Stage5NotificationModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const isUrgent = !!order.isUrgent;

  const [messageText, setMessageText] = useState(() => 
    buildStage5WhatsAppMessage(order, ATELIER_PIX_KEY)
  );

  useEffect(() => {
    setMessageText(buildStage5WhatsAppMessage(order, ATELIER_PIX_KEY));
  }, [order]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(ATELIER_PIX_KEY);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleSendWhatsApp = () => {
    openWhatsAppNotification(order.clientPhone, messageText);
    if (onConfirmSent) {
      onConfirmSent(order.id, messageText);
    }
    onClose();
  };

  const remaining = order.pendingAmount > 0 
    ? order.pendingAmount 
    : Math.max(0, order.finalPrice - order.amountPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isUrgent 
            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700' 
            : 'bg-gradient-to-r from-teal-700 via-cyan-800 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs">
              {isUrgent ? <Zap className="w-6 h-6 text-amber-300 fill-amber-300" /> : <PackageCheck className="w-6 h-6 text-cyan-200" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white">
                  Etapa 5 • Produto Pronto
                </span>
                {isUrgent ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-amber-950" /> Pedido Urgente
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-900/60 text-cyan-100">
                    Pedido Regular
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display mt-0.5">
                Aviso Automático de Coleta no WhatsApp
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Rule banner explained */}
          <div className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-1.5 ${
            isUrgent
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-cyan-50/80 border-cyan-200 text-cyan-950'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Regra da Etapa 5 aplicada a este pedido:</span>
            </div>
            {isUrgent ? (
              <p className="text-xs leading-relaxed text-amber-900/90 pl-6">
                Como este pedido entrou no <strong>critério urgente</strong> e foi aprovado com <strong>100% do valor pago antecipadamente</strong> ({formatCurrencyBRL(order.finalPrice)}), o saldo está totalmente quitado. A mensagem instrui o cliente a <strong>solicitar apenas a coleta</strong>!
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-cyan-950/90 pl-6">
                Como este é um <strong>pedido regular</strong> aprovado com sinal de 50%, a mensagem informa que o produto está pronto e orienta o cliente a <strong>providenciar a coleta após o pagamento do restante do valor aprovado</strong> ({formatCurrencyBRL(remaining)}).
              </p>
            )}
          </div>

          {/* Client & Order quick summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Cliente</span>
              <span className="font-bold text-slate-800 truncate block">{order.clientName}</span>
              <span className="text-[11px] text-slate-600">{order.clientPhone || 'Sem telefone'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Código</span>
              <span className="font-mono font-bold text-cyan-800">{order.trackingCode}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Valor Total</span>
              <span className="font-bold text-slate-900">{formatCurrencyBRL(order.finalPrice)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Saldo Restante</span>
              {isUrgent ? (
                <span className="font-bold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                  R$ 0,00 (100% Pago)
                </span>
              ) : (
                <span className="font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded text-[11px]">
                  {formatCurrencyBRL(remaining)}
                </span>
              )}
            </div>
          </div>

          {/* WhatsApp Message Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                Mensagem formatada para o WhatsApp do Cliente:
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={9}
                className="w-full p-3.5 rounded-2xl border border-slate-300 font-sans text-xs sm:text-[13px] leading-relaxed text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none shadow-inner"
              />
            </div>
          </div>

          {/* Quick PIX Copy Bar for Regular Orders */}
          {!isUrgent && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-amber-900 font-medium">
                  Chave PIX do Ateliê: <strong>{ATELIER_PIX_KEY}</strong>
                </span>
              </div>
              <button
                onClick={handleCopyPix}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
              >
                {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPix ? 'Copiada!' : 'Copiar Chave PIX'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
          >
            Fechar sem Enviar
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Disparar WhatsApp para {order.clientPhone || 'o Cliente'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
