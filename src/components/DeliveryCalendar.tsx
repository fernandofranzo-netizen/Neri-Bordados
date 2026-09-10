import { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';
import { NeriLogo } from './NeriLogo';

interface DeliveryCalendarProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onOpenChat: (order: Order) => void;
}

export function DeliveryCalendar({ orders, onSelectOrder, onOpenChat }: DeliveryCalendarProps) {
  // Current month reference: September 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September (0-indexed)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-12');

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Group orders by deliveryDate
  const ordersByDate = useMemo(() => {
    const map: Record<string, Order[]> = {};
    orders.forEach((o) => {
      if (!o.deliveryDate) return;
      if (!map[o.deliveryDate]) map[o.deliveryDate] = [];
      map[o.deliveryDate].push(o);
    });
    return map;
  }, [orders]);

  // Generate calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const calendarDays = [];
  // Empty slots before 1st day
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const selectedOrders = ordersByDate[selectedDateStr] || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cyan-100 shadow-xs">
        <div className="flex items-center gap-3">
          <NeriLogo size="md" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
              Calendário de Prazos • Neri Bordados
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize a capacidade da sua máquina Brother e nunca atrase uma entrega para clientes
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-cyan-100 shadow-xs">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-xs text-slate-800 px-3 min-w-[130px] text-center font-display">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="h-24 rounded-xl bg-slate-50/50" />;
              }

              const monthStr = String(currentMonth + 1).padStart(2, '0');
              const dayStr = String(day).padStart(2, '0');
              const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
              const dayOrders = ordersByDate[dateKey] || [];
              const isSelected = selectedDateStr === dateKey;
              const isToday = dateKey === '2026-09-10';

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDateStr(dateKey)}
                  className={`h-24 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50/40 ring-2 ring-cyan-500/20'
                      : isToday
                      ? 'border-pink-300 bg-pink-50/30'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-gradient-to-tr from-cyan-600 to-teal-700 text-white font-black'
                          : isSelected
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayOrders.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-white">
                        {dayOrders.length}
                      </span>
                    )}
                  </div>

                  {/* Badges of orders */}
                  <div className="space-y-1 overflow-hidden">
                    {dayOrders.slice(0, 2).map((o) => (
                      <div
                        key={o.id}
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded truncate ${
                          o.status === 'pronto'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'em_producao'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {o.clientName.split(' ')[0]}
                      </div>
                    ))}
                    {dayOrders.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-semibold pl-1">
                        +{dayOrders.length - 2} mais
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
              Compromissos do Dia
            </span>
            <h2 className="text-base font-bold text-slate-900 font-display">
              {selectedDateStr}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedOrders.length} pedido(s) com entrega agendada
            </p>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {selectedOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">Nenhum pedido para este dia</p>
                <p className="text-[11px]">Sua máquina Brother está com a agenda livre nesta data.</p>
              </div>
            ) : (
              selectedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 hover:border-rose-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {order.trackingCode}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{order.clientName}</h3>
                    <p className="text-[11px] text-slate-500">{order.clientPhone}</p>
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-1">
                    {order.items[0]?.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className="font-bold text-slate-900">
                      {formatCurrencyBRL(order.finalPrice)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenChat(order)}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                        title="Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold"
                      >
                        Ver Pedido
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
