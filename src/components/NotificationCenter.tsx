import { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Package, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { Order, MaterialItem } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';

interface NotificationCenterProps {
  orders: Order[];
  materials: MaterialItem[];
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
  onOpenChat: (order: Order) => void;
}

export function NotificationCenter({
  orders,
  materials,
  onClose,
  onSelectOrder,
  onOpenChat,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'delivery' | 'payment' | 'stock'>('all');

  const todayStr = '2026-09-10'; // Matching our environment date context

  // 1. Delivery alerts
  const deliveryAlerts = orders
    .filter((o) => o.status !== 'entregue' && o.status !== 'cancelado')
    .map((o) => {
      const isOverdue = o.deliveryDate < todayStr;
      const isToday = o.deliveryDate === todayStr;
      const isTomorrow = o.deliveryDate === '2026-09-11';
      return {
        order: o,
        isOverdue,
        isToday,
        isTomorrow,
        isUrgent: isOverdue || isToday || isTomorrow,
      };
    })
    .filter((a) => a.isUrgent);

  // 2. Payment alerts (pendente or atrasado)
  const paymentAlerts = orders.filter(
    (o) => o.pendingAmount > 0 && o.status !== 'cancelado'
  );

  // 3. Stock alerts
  const stockAlerts = materials.filter((m) => m.currentStock <= m.minStock);

  const totalAlertsCount = deliveryAlerts.length + paymentAlerts.length + stockAlerts.length;

  const sendWhatsAppNotification = (order: Order, type: 'delivery' | 'payment' | 'ready') => {
    let msg = '';
    const phoneClean = order.clientPhone.replace(/\D/g, '');

    if (type === 'ready') {
      msg = `Olá ${order.clientName}! 🎉 Seu pedido de bordado *#${order.trackingCode}* (${order.items[0]?.description}) já está bordado com perfeição e pronto para retirada!\n\n` +
        `💰 Valor restante: *${formatCurrencyBRL(order.pendingAmount)}* (Chave Pix disponível).\n` +
        `Aguardamos você no nosso ateliê! ✨`;
    } else if (type === 'payment') {
      msg = `Olá ${order.clientName}! Tudo bem? Passando para lembrar sobre o pagamento pendente do seu pedido de bordado *#${order.trackingCode}* no valor de *${formatCurrencyBRL(order.pendingAmount)}*.\n` +
        `Qualquer dúvida estamos à disposição! 🪡`;
    } else {
      msg = `Olá ${order.clientName}! Informamos que o seu pedido de bordado *#${order.trackingCode}* está com entrega prevista para *${order.deliveryDate}*.\n` +
        `A produção está a todo vapor em nossas máquinas Brother! ✨`;
    }

    const encoded = encodeURIComponent(msg);
    const url = `https://api.whatsapp.com/send?phone=55${phoneClean}&text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Central de Alertas & Notificações</h2>
              <p className="text-[11px] text-slate-300">
                {totalAlertsCount} pendências requerem sua atenção
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white shadow-xs text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({totalAlertsCount})
          </button>
          <button
            onClick={() => setFilter('delivery')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filter === 'delivery'
                ? 'bg-white shadow-xs text-rose-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prazos ({deliveryAlerts.length})
          </button>
          <button
            onClick={() => setFilter('payment')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filter === 'payment'
                ? 'bg-white shadow-xs text-amber-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pagamentos ({paymentAlerts.length})
          </button>
          <button
            onClick={() => setFilter('stock')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filter === 'stock'
                ? 'bg-white shadow-xs text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estoque ({stockAlerts.length})
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
          {/* Deliveries */}
          {(filter === 'all' || filter === 'delivery') &&
            deliveryAlerts.map((d) => (
              <div
                key={`del-${d.order.id}`}
                className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs space-y-2 hover:border-rose-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {d.isOverdue ? '⚠️ Pedido Atrasado!' : d.isToday ? '🔔 Entrega Hoje!' : '⏰ Entrega Amanhã!'}
                      </span>
                      <p className="text-[11px] text-slate-500">{d.order.clientName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {d.order.trackingCode}
                  </span>
                </div>

                <p className="text-xs text-slate-700 line-clamp-1">
                  {d.order.items[0]?.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Prazo: <strong>{d.order.deliveryDate}</strong></span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenChat(d.order)}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" /> Chat
                    </button>
                    <button
                      onClick={() => sendWhatsAppNotification(d.order, d.order.status === 'pronto' ? 'ready' : 'delivery')}
                      className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {/* Payments */}
          {(filter === 'all' || filter === 'payment') &&
            paymentAlerts.map((o) => (
              <div
                key={`pay-${o.id}`}
                className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs space-y-2 hover:border-amber-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                      <DollarSign className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        Saldo Pendente: {formatCurrencyBRL(o.pendingAmount)}
                      </span>
                      <p className="text-[11px] text-slate-500">{o.clientName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {o.paymentStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex justify-between">
                  <span>Total Pedido: {formatCurrencyBRL(o.finalPrice)}</span>
                  <span>Já Pago: {formatCurrencyBRL(o.amountPaid)}</span>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                  <button
                    onClick={() => onSelectOrder(o)}
                    className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Ver Pedido
                  </button>
                  <button
                    onClick={() => sendWhatsAppNotification(o, 'payment')}
                    className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1"
                  >
                    Cobrar no WhatsApp
                  </button>
                </div>
              </div>
            ))}

          {/* Stock */}
          {(filter === 'all' || filter === 'stock') &&
            stockAlerts.map((m) => (
              <div
                key={`stk-${m.id}`}
                className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs space-y-2 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                      <Package className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900">{m.name}</span>
                      <p className="text-[11px] text-slate-500">{m.brand} • {m.unit}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                    Estoque Baixo
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Estoque Atual: <strong className="text-rose-600">{m.currentStock}</strong> (Mín: {m.minStock})
                  </span>
                  <span className="text-[11px] text-slate-500">{m.location || 'Ateliê'}</span>
                </div>
              </div>
            ))}

          {totalAlertsCount === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="text-xs font-semibold text-slate-600">Tudo em dia!</p>
              <p className="text-[11px]">Nenhum pagamento pendente, entrega atrasada ou material em falta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
