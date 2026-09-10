import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  MessageSquare, 
  Printer, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Share2, 
  Layers,
  Sparkles,
  User,
  Phone,
  Heart
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';
import { NeriLogo } from './NeriLogo';

interface OrdersManagerProps {
  orders: Order[];
  onNewOrder: () => void;
  onEditOrder: (order: Order) => void;
  onOpenChat: (order: Order) => void;
  onOpenPdf: (order: Order, type?: 'orcamento' | 'os' | 'recibo') => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
}

export function OrdersManager({
  orders,
  onNewOrder,
  onEditOrder,
  onOpenChat,
  onOpenPdf,
  onUpdateStatus,
  onDeleteOrder,
}: OrdersManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'todos' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'orcamento':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Orçamento
          </span>
        );
      case 'aprovado':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Aprovado
          </span>
        );
      case 'aguardando_matriz':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Aguardando Matriz
          </span>
        );
      case 'em_producao':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Bordando (Brother)
          </span>
        );
      case 'acabamento':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            Acabamento
          </span>
        );
      case 'pronto':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Pronto p/ Retirada
          </span>
        );
      case 'entregue':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Entregue
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'orcamento':
        return 'aprovado';
      case 'aprovado':
        return 'em_producao';
      case 'aguardando_matriz':
        return 'em_producao';
      case 'em_producao':
        return 'acabamento';
      case 'acabamento':
        return 'pronto';
      case 'pronto':
        return 'entregue';
      default:
        return null;
    }
  };

  const handleShareWhatsApp = (order: Order) => {
    const phoneClean = order.clientPhone.replace(/\D/g, '');
    const msg = `Olá *${order.clientName}*! Tudo bem?\n` +
      `Aqui é do Ateliê *Neri Bordados*. Seu pedido *#${order.trackingCode}* (${order.items[0]?.description || 'Bordado'}) está com status: *${order.status.toUpperCase()}*.\n` +
      `📅 Previsão de entrega: *${order.deliveryDate}*\n` +
      `💰 Valor Total: *${formatCurrencyBRL(order.finalPrice)}* (Restante: ${formatCurrencyBRL(order.pendingAmount)})\n` +
      `Acompanhe em tempo real pelo nosso portal! Qualquer dúvida estamos à disposição! ✨`;
    const url = `https://api.whatsapp.com/send?phone=55${phoneClean}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cyan-100 shadow-xs">
        <div className="flex items-center gap-3.5">
          <NeriLogo size="md" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
              Pedidos & Orçamentos • Neri Bordados
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gerencie o ciclo de produção dos bordados, prazos na Brother e aprovações
            </p>
          </div>
        </div>

        <button
          id="btn-create-order-orders-page"
          onClick={onNewOrder}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido / Orçamento
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, código ou peça..."
            className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar text-xs">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              statusFilter === 'todos'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('orcamento')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              statusFilter === 'orcamento'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Orçamentos ({orders.filter((o) => o.status === 'orcamento').length})
          </button>
          <button
            onClick={() => setStatusFilter('em_producao')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              statusFilter === 'em_producao'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Em Produção ({orders.filter((o) => o.status === 'em_producao').length})
          </button>
          <button
            onClick={() => setStatusFilter('pronto')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              statusFilter === 'pronto'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Prontos ({orders.filter((o) => o.status === 'pronto').length})
          </button>
          <button
            onClick={() => setStatusFilter('entregue')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              statusFilter === 'entregue'
                ? 'bg-slate-700 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Entregues ({orders.filter((o) => o.status === 'entregue').length})
          </button>
        </div>
      </div>

      {/* Orders Grid / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <Layers className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Nenhum pedido encontrado</p>
            <p className="text-xs">Tente ajustar o termo de busca ou adicione um novo pedido.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: Code, Status, Dates */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                      {order.trackingCode}
                    </span>
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      Criado em {order.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      Entrega: <strong className="text-slate-800">{order.deliveryDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Middle: Client Info, Items, Machine */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-slate-100">
                  {/* Client column (4 cols) */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {order.clientName}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {order.clientPhone}
                    </div>
                    {order.brotherMachineModel && (
                      <div className="text-[11px] text-rose-700 font-medium pt-1">
                        Máquina: {order.brotherMachineModel}
                      </div>
                    )}
                    {order.inspirations.length > 0 && (
                      <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                        ✨ {order.inspirations.length} inspiração(ões) anexada(s)
                      </div>
                    )}
                  </div>

                  {/* Items column (5 cols) */}
                  <div className="md:col-span-5 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Itens Bordados ({order.items.length})
                    </span>
                    <div className="space-y-1">
                      {order.items.map((it) => (
                        <div key={it.id} className="text-xs text-slate-700 flex justify-between">
                          <span className="truncate max-w-[260px]">
                            • {it.description}
                          </span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            {(it.stitchesCount || 0).toLocaleString('pt-BR')} pts ({it.hoopSize})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial column (3 cols) */}
                  <div className="md:col-span-3 text-left md:text-right space-y-1">
                    <div className="text-base font-extrabold text-slate-900 font-display">
                      {formatCurrencyBRL(order.finalPrice)}
                    </div>
                    <div className="text-xs">
                      {order.pendingAmount > 0 ? (
                        <span className="text-rose-600 font-semibold">
                          Resta: {formatCurrencyBRL(order.pendingAmount)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">
                          Totalmente Quitado
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Lucro estimado: <strong className="text-emerald-600">{formatCurrencyBRL(order.profit)}</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  {/* Status advance button */}
                  <div>
                    {nextStatus && (
                      <button
                        onClick={() => onUpdateStatus(order.id, nextStatus)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        Avançar p/ {nextStatus.replace('_', ' ')}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Chat with client */}
                    <button
                      onClick={() => onOpenChat(order)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Abrir Chat com o Cliente"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                      Chat
                    </button>

                    {/* PDF Export Menu */}
                    <button
                      onClick={() => onOpenPdf(order, 'orcamento')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Gerar Orçamento em PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Orçamento PDF
                    </button>

                    <button
                      onClick={() => onOpenPdf(order, 'os')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors hidden sm:flex"
                      title="Ficha Técnica / Ordem de Serviço Brother"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-600" />
                      Ficha Brother (OS)
                    </button>

                    {/* Share WhatsApp */}
                    <button
                      onClick={() => handleShareWhatsApp(order)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Enviar Status no WhatsApp do Cliente"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>

                    {/* Edit Order */}
                    <button
                      onClick={() => onEditOrder(order)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Editar Pedido"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Order */}
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir o pedido ${order.trackingCode}?`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
