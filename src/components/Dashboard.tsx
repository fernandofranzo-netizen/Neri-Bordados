import { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  Calculator, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  FileText, 
  Layers, 
  AlertCircle,
  Share2,
  Heart
} from 'lucide-react';
import { Order, MaterialItem, FinancialTransaction } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';
import { NeriLogo } from './NeriLogo';

interface DashboardProps {
  orders: Order[];
  materials: MaterialItem[];
  transactions: FinancialTransaction[];
  onNewOrder: () => void;
  onSelectOrder: (order: Order) => void;
  onOpenCalculator: () => void;
  onOpenChat: (order: Order) => void;
  onOpenPdf: (order: Order, type?: 'orcamento' | 'os' | 'recibo') => void;
  onOpenNotifications: () => void;
  onNavigateTab: (tab: 'orders' | 'calculator' | 'inventory' | 'calendar' | 'financial') => void;
}

export function Dashboard({
  orders,
  materials,
  transactions,
  onNewOrder,
  onSelectOrder,
  onOpenCalculator,
  onOpenChat,
  onOpenPdf,
  onOpenNotifications,
  onNavigateTab,
}: DashboardProps) {
  const todayStr = '2026-09-10';

  // Metrics
  const activeOrders = orders.filter((o) => o.status !== 'entregue' && o.status !== 'cancelado');
  const inProductionOrders = orders.filter((o) => o.status === 'em_producao');
  const quotesCount = orders.filter((o) => o.status === 'orcamento').length;

  const currentMonth = '2026-09';
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));
  const totalRevenue = monthTransactions
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = monthTransactions
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Alerts
  const pendingPaymentsOrders = orders.filter((o) => o.pendingAmount > 0 && o.status !== 'cancelado');
  const totalPendingAmount = pendingPaymentsOrders.reduce((sum, o) => sum + o.pendingAmount, 0);

  const urgentDeliveries = orders.filter((o) => {
    if (o.status === 'entregue' || o.status === 'cancelado') return false;
    return o.deliveryDate <= '2026-09-12';
  });

  const lowStockItems = materials.filter((m) => m.currentStock <= m.minStock);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Welcome & Quick Actions Banner with Neri Bordados Logo */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-purple-950 text-white p-6 sm:p-7 rounded-3xl shadow-md border border-cyan-800/40 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <NeriLogo size="lg" />
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Máquinas Domésticas Brother
              </span>
              <span className="text-xs text-cyan-200/80 font-medium">Ateliê Neri Bordados</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
              Neri Bordados <Heart className="w-5 h-5 text-pink-400 fill-pink-400 inline" />
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/80 mt-1 max-w-2xl">
              Gestão completa do seu negócio de bordados: cálculo de custo e lucro por pontos Brother, prazos, estoque de fios e portal do cliente.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            id="btn-quick-calculator"
            onClick={onOpenCalculator}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-cyan-300/20 backdrop-blur-xs flex items-center gap-1.5 transition-all"
          >
            <Calculator className="w-4 h-4 text-cyan-300" />
            Calculadora por Pontos
          </button>

          <button
            id="btn-quick-new-order"
            onClick={onNewOrder}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-pink-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Pedido / Orçamento
          </button>
        </div>
      </div>

      {/* Automatic Urgent Alerts Bar */}
      {(urgentDeliveries.length > 0 || pendingPaymentsOrders.length > 0 || lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Urgent Deliveries */}
          {urgentDeliveries.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-950">
                    {urgentDeliveries.length} entrega(s) urgente(s)
                  </div>
                  <div className="text-[11px] text-rose-700">
                    Prazos vencendo até 12/09
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline"
              >
                Ver Agenda
              </button>
            </div>
          )}

          {/* Pending Payments */}
          {pendingPaymentsOrders.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950">
                    {formatCurrencyBRL(totalPendingAmount)} a receber
                  </div>
                  <div className="text-[11px] text-amber-700">
                    {pendingPaymentsOrders.length} pagamentos pendentes
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenNotifications}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline"
              >
                Cobrar
              </button>
            </div>
          )}

          {/* Low Stock */}
          {lowStockItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-950">
                    {lowStockItems.length} insumo(s) em falta
                  </div>
                  <div className="text-[11px] text-blue-700">
                    Linhas ou entretela abaixo do mínimo
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
              >
                Repor
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita do Mês */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Faturamento Mensal
          </span>
          <div className="text-2xl font-black text-slate-900 font-display">
            {formatCurrencyBRL(totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold pt-1">
            <TrendingUp className="w-3.5 h-3.5" /> Entradas liquidadas
          </div>
        </div>

        {/* Lucro Líquido Real */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Lucro Líquido Real
          </span>
          <div className="text-2xl font-black text-emerald-700 font-display">
            {formatCurrencyBRL(netProfit)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold pt-1">
            Descontando insumos e Brother
          </div>
        </div>

        {/* Pedidos em Produção */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Na Bordadeira Brother
          </span>
          <div className="text-2xl font-black text-indigo-600 font-display">
            {inProductionOrders.length} bordando
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            {activeOrders.length} pedidos ativos no total
          </div>
        </div>

        {/* Orçamentos Pendentes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Orçamentos Solicitados
          </span>
          <div className="text-2xl font-black text-amber-600 font-display">
            {quotesCount} pendente(s)
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            Aguardando aprovação do cliente
          </div>
        </div>
      </div>

      {/* Grid: Recent Active Orders & Quick Calculator Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Pedidos em Andamento no Ateliê
              </h2>
              <p className="text-xs text-slate-500">
                Acompanhe o status, prazo de entrega e valores pendentes
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeOrders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {order.trackingCode}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{order.clientName}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      order.status === 'em_producao'
                        ? 'bg-indigo-100 text-indigo-800'
                        : order.status === 'pronto'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="truncate max-w-[320px]">
                    {order.items[0]?.description}
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrencyBRL(order.finalPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span>Entrega: <strong className="text-rose-600">{order.deliveryDate}</strong></span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenChat(order)}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3 text-rose-600" /> Chat
                    </button>
                    <button
                      onClick={() => onOpenPdf(order, 'orcamento')}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-blue-600" /> PDF
                    </button>
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Brother Machine Quick Info & Specs (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Machine Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Bordadeiras Brother</h3>
                <p className="text-[11px] text-slate-500">Configurações e Bastidores</p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between text-slate-600 pb-1 border-b border-slate-100">
                <span>Velocidade Recomendada:</span>
                <strong className="text-slate-800">650 ppm</strong>
              </div>
              <div className="flex justify-between text-slate-600 pb-1 border-b border-slate-100">
                <span>Bastidores Suportados:</span>
                <strong className="text-slate-800">10x10, 13x18, 16x26</strong>
              </div>
              <div className="flex justify-between text-slate-600 pb-1 border-b border-slate-100">
                <span>Formato de Matriz:</span>
                <strong className="text-cyan-700 font-mono">.PES / .DST</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fio Indicado:</span>
                <strong className="text-slate-800">100% Poliéster 120D/2</strong>
              </div>
            </div>

            <button
              onClick={onOpenCalculator}
              className="w-full py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all mt-2 border border-cyan-200"
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-700" />
              Abrir Calculadora Brother
            </button>
          </div>

          {/* Quick Tips */}
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Dica para Lucro Máximo
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Cobrar por milhar de pontos (ex: R$ 3,50 a R$ 5,00 por 1.000 pontos) garante que você nunca tenha prejuízo em matrizes densas. Use sempre a calculadora para incluir o valor da sua toalha/peça lisa!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
