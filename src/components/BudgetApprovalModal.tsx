import { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Zap, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Clock,
  AlertTriangle 
} from 'lucide-react';
import { Order, PaymentMethod } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';
import { calculateBudgetValidity, getBudgetApprovalCriteria } from '../utils/whatsappHelper';

interface BudgetApprovalModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApproval: (updatedOrder: Order, depositAmount: number, method: PaymentMethod) => void;
}

export function BudgetApprovalModal({
  order,
  isOpen,
  onClose,
  onConfirmApproval,
}: BudgetApprovalModalProps) {
  const [isUrgent, setIsUrgent] = useState<boolean>(!!order.isUrgent);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(order.paymentMethod || 'pix');

  if (!isOpen) return null;

  const criteria = getBudgetApprovalCriteria(order.finalPrice, isUrgent);
  const validity = calculateBudgetValidity(order.createdAt);

  const handleApprove = () => {
    const deposit = criteria.requiredAmount;
    const newPending = Math.max(0, order.finalPrice - deposit);
    const newPaymentStatus = isUrgent ? 'pago_total' : 'sinal_pago';

    const updatedOrder: Order = {
      ...order,
      isUrgent,
      status: 'aprovado',
      amountPaid: deposit,
      pendingAmount: newPending,
      paymentStatus: newPaymentStatus,
      paymentMethod,
    };

    onConfirmApproval(updatedOrder, deposit, paymentMethod);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-200">
                Aprovação do Orçamento • #{order.trackingCode}
              </span>
              <h2 className="text-base sm:text-lg font-bold font-display mt-0.5">
                Comprovação de Pagamento
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Validity banner (30 dias) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-cyan-700" />
              <span>
                Validade do Orçamento: <strong>30 dias corridos</strong>
              </span>
            </div>
            <span className="font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 text-[11px]">
              {validity.daysRemaining} dias restantes
            </span>
          </div>

          {/* Urgent Selector Toggle */}
          <div className="p-4 rounded-2xl border bg-slate-50/70 border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                  <Zap className={`w-4 h-4 ${isUrgent ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                  Critério de Pedido Urgente?
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pedidos urgentes têm prioridade na máquina Brother e regras específicas de quitação.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsUrgent(!isUrgent)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isUrgent ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isUrgent ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Rule Explanatory Card */}
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
              isUrgent
                ? 'bg-amber-50 border-amber-200 text-amber-950 font-medium'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              {isUrgent ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Zap className="w-3.5 h-3.5 fill-amber-900" />
                    Regra para Pedido Urgente:
                  </div>
                  <p>
                    O orçamento será aprovado mediante a comprovação do pagamento de <strong>100% do valor</strong> antecipadamente ({formatCurrencyBRL(order.finalPrice)}).
                  </p>
                  <p className="text-[11px] text-amber-800 pt-1">
                    ✓ Na Etapa 5 (Pronto), o cliente deverá <strong>solicitar apenas a coleta</strong> pois já estará 100% quitado.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Regra para Pedido Regular:
                  </div>
                  <p>
                    O orçamento será aprovado mediante a comprovação do pagamento de <strong>50% do valor</strong> ({formatCurrencyBRL(criteria.requiredAmount)}).
                  </p>
                  <p className="text-[11px] text-emerald-800 pt-1">
                    ✓ Na Etapa 5 (Pronto), o cliente providenciará a coleta <strong>após o pagamento do saldo restante de 50%</strong> ({formatCurrencyBRL(criteria.stage5PendingAmount)}).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Forma de Comprovação do Pagamento:
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['pix', 'cartao_credito', 'dinheiro'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-2 rounded-xl border text-center font-bold capitalize transition-all ${
                    paymentMethod === method
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {method === 'pix' ? 'PIX' : method === 'cartao_credito' ? 'Cartão' : 'Dinheiro'}
                </button>
              ))}
            </div>
          </div>

          {/* Summary values */}
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Valor a Comprovar Agora</span>
              <span className="text-base font-extrabold text-slate-900">
                {formatCurrencyBRL(criteria.requiredAmount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Saldo na Retirada (Etapa 5)</span>
              <span className={`text-base font-extrabold ${isUrgent ? 'text-emerald-600' : 'text-slate-700'}`}>
                {isUrgent ? 'R$ 0,00' : formatCurrencyBRL(criteria.stage5PendingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className={`px-5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-98 ${
              isUrgent 
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Pagamento & Aprovar Orçamento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
