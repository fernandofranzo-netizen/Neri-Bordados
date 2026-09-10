import { useState, useMemo, FormEvent } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Download, 
  Plus, 
  Calendar, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Tag,
  Sparkles,
  Layers,
  Heart
} from 'lucide-react';
import { FinancialTransaction, PaymentMethod } from '../types';
import { exportFinancialPdf } from '../utils/pdfGenerator';
import { formatCurrencyBRL } from '../utils/calculator';
import { NeriLogo } from './NeriLogo';

interface FinancialReportsProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (transaction: FinancialTransaction) => void;
}

export function FinancialReports({ transactions, onAddTransaction }: FinancialReportsProps) {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Transaction Form states
  const [type, setType] = useState<'receita' | 'despesa'>('despesa');
  const [category, setCategory] = useState('Compra de Insumos');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  // Filter by selected month
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Breakdown by category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === 'despesa')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [filteredTransactions]);

  const handleExportPdf = () => {
    const [year, month] = selectedMonth.split('-');
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthYearFormatted = `${monthNames[Number(month) - 1]}/${year}`;
    exportFinancialPdf(filteredTransactions, monthYearFormatted, totalIncome, totalExpense, netProfit);
  };

  const handleSaveTransaction = (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    const newTx: FinancialTransaction = {
      id: `tr-${Date.now()}`,
      type,
      category,
      description: description.trim(),
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
    };

    onAddTransaction(newTx);
    setShowAddModal(false);
    setDescription('');
    setAmount(50);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cyan-100 shadow-xs">
        <div className="flex items-center gap-3">
          <NeriLogo size="md" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
              Relatórios Financeiros • Neri Bordados
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Acompanhe a movimentação de renda, o lucro de cada peça bordada e seus custos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Month Selector */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs p-2 rounded-xl border border-cyan-200 bg-white font-bold text-slate-800 shadow-xs"
          />

          <button
            id="btn-export-finance-pdf"
            onClick={handleExportPdf}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>

          <button
            id="btn-new-transaction"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Lançar Movimento
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Bruta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Receita Bruta
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {formatCurrencyBRL(totalIncome)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Entradas de bordados e peças vendidas
          </p>
        </div>

        {/* Despesas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Despesas & Insumos
            </span>
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 font-display">
            {formatCurrencyBRL(totalExpense)}
          </div>
          <p className="text-[11px] text-rose-600 font-medium">
            Linhas, entretelas, energia e Brother
          </p>
        </div>

        {/* Lucro Líquido Real */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
              Lucro Líquido Real
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-display">
            {formatCurrencyBRL(netProfit)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            O que realmente sobra no bolso
          </p>
        </div>

        {/* Margem Média */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Margem Líquida
            </span>
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700 font-display">
            {profitMargin}%
          </div>
          <p className="text-[11px] text-slate-500">
            {profitMargin >= 50 ? 'Excelente rentabilidade de ateliê' : 'Margem regular'}
          </p>
        </div>
      </div>

      {/* DRE Simplificado & Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DRE Box (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Demonstrativo de Resultado (DRE Simplificado)
            </h2>
            <span className="text-xs font-mono font-bold text-slate-500">{selectedMonth}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between font-bold text-slate-900 p-2.5 rounded-lg bg-slate-50">
              <span>(+) Receita Bruta Total</span>
              <span className="text-emerald-700">{formatCurrencyBRL(totalIncome)}</span>
            </div>

            <div className="pl-4 space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>(-) Compra de Insumos (Linhas, Entretelas, Agulhas)</span>
                <span className="text-rose-600 font-medium">
                  {formatCurrencyBRL(
                    (expenseByCategory['Compra de Insumos'] || 0) +
                    (expenseByCategory['Entretela'] || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>(-) Manutenção e Óleo Máquinas Brother</span>
                <span className="text-rose-600 font-medium">
                  {formatCurrencyBRL(expenseByCategory['Manutenção Máquina'] || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>(-) Custos Fixos & Energia Elétrica</span>
                <span className="text-rose-600 font-medium">
                  {formatCurrencyBRL(expenseByCategory['Custos Fixos'] || 0)}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-slate-800 p-2.5 rounded-lg bg-rose-50 border border-rose-100">
              <span>(=) Total de Despesas do Período</span>
              <span className="text-rose-700 font-black">{formatCurrencyBRL(totalExpense)}</span>
            </div>

            <div className="flex justify-between font-black text-sm text-emerald-900 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span>(=) LUCRO LÍQUIDO DO ATELIÊ</span>
              <span className="text-emerald-700 text-base">{formatCurrencyBRL(netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Expense Categories Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Distribuição das Despesas
            </h2>
            <p className="text-xs text-slate-500">Para onde está indo o dinheiro do ateliê</p>
          </div>

          <div className="space-y-3">
            {Object.keys(expenseByCategory).length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                Nenhuma despesa registrada neste mês.
              </div>
            ) : (
              Object.entries(expenseByCategory).map(([cat, rawVal]) => {
                const val = Number(rawVal);
                const percent = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat}</span>
                      <span>
                        {formatCurrencyBRL(val)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-600 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Extrato de Movimentações Financeiras</h2>
          <span className="text-xs text-slate-500">{filteredTransactions.length} lançamentos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-4">Data</th>
                <th className="py-2.5 px-4">Tipo</th>
                <th className="py-2.5 px-4">Categoria</th>
                <th className="py-2.5 px-4">Descrição</th>
                <th className="py-2.5 px-4">Pagamento</th>
                <th className="py-2.5 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600">{tx.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tx.type === 'receita'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{tx.category}</td>
                  <td className="py-3 px-4 text-slate-800">{tx.description}</td>
                  <td className="py-3 px-4 uppercase text-slate-500 text-[10px] font-semibold">
                    {tx.paymentMethod}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      tx.type === 'receita' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'receita' ? '+' : '-'} {formatCurrencyBRL(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Lançar Entrada ou Saída de Dinheiro</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('receita')}
                  className={`py-1.5 rounded-md font-bold transition-all ${
                    type === 'receita' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  (+) Receita / Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setType('despesa')}
                  className={`py-1.5 rounded-md font-bold transition-all ${
                    type === 'despesa' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  (-) Despesa / Saída
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                >
                  {type === 'receita' ? (
                    <>
                      <option value="Venda de Bordado">Venda de Bordado Personalizado</option>
                      <option value="Venda de Peça Pronta">Venda de Peça / Toalha Pronta</option>
                      <option value="Sinal de Pedido">Sinal de Entrada (50%)</option>
                      <option value="Outras Receitas">Outras Receitas</option>
                    </>
                  ) : (
                    <>
                      <option value="Compra de Insumos">Compra de Insumos (Linhas, Agulhas)</option>
                      <option value="Entretela">Entretela & Filmes</option>
                      <option value="Manutenção Máquina">Manutenção / Peças Máquina Brother</option>
                      <option value="Custos Fixos">Custos Fixos (Energia, Internet)</option>
                      <option value="Compra de Peças Lisas">Compra de Peças Lisas (Döhler/Cremer)</option>
                      <option value="Outras Despesas">Outras Despesas</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Compra de 3 cones de linha dourada Polybrilho"
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="pix">Pix</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-medium text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
