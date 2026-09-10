import { useState, useMemo } from 'react';
import { 
  Calculator, 
  Cpu, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  PlusCircle, 
  Copy, 
  Check, 
  Info,
  Sparkles,
  Scissors,
  Heart
} from 'lucide-react';
import { BROTHER_PRESETS, calculateEmbroideryCost, formatCurrencyBRL, CalculationInput } from '../utils/calculator';
import { BrotherMachinePreset } from '../types';
import { NeriLogo } from './NeriLogo';

interface BrotherCalculatorProps {
  onUseCalculation?: (data: {
    description: string;
    stitches: number;
    hoopSize: string;
    colorsCount: number;
    calculatedCost: number;
    priceCharged: number;
    profit: number;
    machineModel: string;
  }) => void;
}

export function BrotherCalculator({ onUseCalculation }: BrotherCalculatorProps) {
  const [selectedMachineId, setSelectedMachineId] = useState<string>('brother_pe810l');
  const [pieceTitle, setPieceTitle] = useState<string>('Toalha de Lavabo Döhler com Brasão');
  const [stitches, setStitches] = useState<number>(18500);
  const [colorChanges, setColorChanges] = useState<number>(3);
  const [hoopSize, setHoopSize] = useState<string>('13x18 cm');
  const [stabilizerType, setStabilizerType] = useState<'rasgavel' | 'soluvel' | 'termocolante' | 'dupla'>('rasgavel');
  const [stabilizerCost, setStabilizerCost] = useState<number>(0.9);
  const [clientProvidesPiece, setClientProvidesPiece] = useState<boolean>(false);
  const [blankPieceCost, setBlankPieceCost] = useState<number>(12.5);
  const [matrixCost, setMatrixCost] = useState<number>(0);
  const [artisanHourlyRate, setArtisanHourlyRate] = useState<number>(25.0);
  const [handlingMinutes, setHandlingMinutes] = useState<number>(15);
  const [profitMargin, setProfitMargin] = useState<number>(70); // 70% de margem
  const [copied, setCopied] = useState<boolean>(false);

  const selectedMachine: BrotherMachinePreset = useMemo(() => {
    return BROTHER_PRESETS.find((m) => m.id === selectedMachineId) || BROTHER_PRESETS[0];
  }, [selectedMachineId]);

  const calculationInput: CalculationInput = useMemo(() => {
    return {
      stitches,
      colorChanges,
      hoopSize,
      machineSpeed: selectedMachine.speedSPM,
      hourlyDepreciation: selectedMachine.hourlyDepreciation,
      hourlyElectricity: selectedMachine.electricityCostPerHour,
      artisanHourlyRate,
      handlingMinutes,
      stabilizerType,
      stabilizerCost,
      upperThreadCostPer1kStitches: 0.12,
      bobbinCostPer1kStitches: 0.05,
      needleAndConsumableCost: 0.6,
      blankPieceCost: clientProvidesPiece ? 0 : blankPieceCost,
      matrixCost,
      desiredProfitMarginPercent: profitMargin,
    };
  }, [
    stitches,
    colorChanges,
    hoopSize,
    selectedMachine,
    artisanHourlyRate,
    handlingMinutes,
    stabilizerType,
    stabilizerCost,
    clientProvidesPiece,
    blankPieceCost,
    matrixCost,
    profitMargin,
  ]);

  const result = useMemo(() => calculateEmbroideryCost(calculationInput), [calculationInput]);

  const handleCopyWhatsAppQuote = () => {
    const text = `🪡 *ORÇAMENTO DE BORDADO COMPUTADORIZADO*\n` +
      `✨ *Peça:* ${pieceTitle}\n` +
      `📐 *Bastidor:* ${hoopSize} | *Pontos:* ${stitches.toLocaleString('pt-BR')} pts\n` +
      `🎨 *Trocas de Cores:* ${colorChanges}\n` +
      `🧵 *Linhas:* 100% Poliéster especial de alto brilho\n` +
      `⏱️ *Tempo de Produção estimado:* ${result.totalMinutes} min\n` +
      `💰 *Valor Unitário:* ${formatCurrencyBRL(result.suggestedPrice)}\n\n` +
      `_Preço válido por 10 dias. Garantia de acabamento limpo e avesso perfeito!_`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApply = () => {
    if (onUseCalculation) {
      onUseCalculation({
        description: pieceTitle,
        stitches,
        hoopSize,
        colorsCount: colorChanges,
        calculatedCost: result.totalProductionCost,
        priceCharged: result.suggestedPrice,
        profit: result.netProfit,
        machineModel: selectedMachine.name,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-purple-950 text-white p-6 rounded-2xl shadow-md border border-cyan-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <NeriLogo size="md" />
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Máquinas Brother Domésticas
              </span>
              <span className="text-xs text-cyan-200/80 font-medium">Neri Bordados • Algoritmo de Custo & Lucro</span>
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              Calculadora Automática de Bordado <Heart className="w-5 h-5 text-pink-400 fill-pink-400 inline" />
            </h1>
            <p className="text-sm text-cyan-100/80 mt-1 max-w-2xl">
              Calcule com precisão matemática o custo de fios, entretela, energia, depreciação da sua bordadeira Brother e tempo de trabalho para garantir seu lucro real por peça.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            id="btn-copy-quote"
            onClick={handleCopyWhatsAppQuote}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-cyan-300/20 backdrop-blur-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado p/ WhatsApp!' : 'Copiar Texto WhatsApp'}
          </button>
          {onUseCalculation && (
            <button
              id="btn-apply-calculation"
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-pink-600/30 flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Usar no Pedido
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Brother Model & Basic Design Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-600" />
              1. Modelo da Máquina Brother & Peça
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Máquina Bordadeira Brother
                </label>
                <select
                  id="select-brother-machine"
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 font-medium"
                >
                  {BROTHER_PRESETS.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.name} ({machine.speedSPM} ppm)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Velocidade recomendada: <span className="font-semibold">{selectedMachine.speedSPM} pontos/min</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bastidor Escolhido
                </label>
                <select
                  id="select-hoop-size"
                  value={hoopSize}
                  onChange={(e) => setHoopSize(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 font-medium"
                >
                  {selectedMachine.standardHoops.map((hoop) => (
                    <option key={hoop} value={hoop}>
                      Bastidor {hoop}
                    </option>
                  ))}
                  <option value="16x26 cm">Bastidor 16x26 cm</option>
                  <option value="18x30 cm">Bastidor 18x30 cm</option>
                  <option value="20x20 cm">Bastidor 20x20 cm</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição da Peça / Bordado
              </label>
              <input
                id="input-piece-title"
                type="text"
                value={pieceTitle}
                onChange={(e) => setPieceTitle(e.target.value)}
                placeholder="Ex: Toalha de Banho com Nome e Ramos de Flores"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Card 2: Stitches, Colors & Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-rose-600" />
                2. Quantidade de Pontos e Trocas de Linha
              </h2>
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                {stitches.toLocaleString('pt-BR')} pontos
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Número de Pontos da Matriz (.PES)</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStitches(6000)}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    6k (Pequeno)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStitches(14000)}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    14k (Médio)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStitches(26000)}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    26k (Grande)
                  </button>
                </div>
              </div>
              <input
                id="input-stitches-slider"
                type="range"
                min="1000"
                max="80000"
                step="500"
                value={stitches}
                onChange={(e) => setStitches(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="input-stitches-number"
                  type="number"
                  min="500"
                  max="150000"
                  step="500"
                  value={stitches}
                  onChange={(e) => setStitches(Math.max(1, Number(e.target.value)))}
                  className="w-36 text-xs font-semibold rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white"
                />
                <span className="text-xs text-slate-500">
                  Tempo estimado na Brother: <strong className="text-slate-800">{result.embroideryMinutes} min</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trocas de Cores de Linha
                </label>
                <input
                  id="input-color-changes"
                  type="number"
                  min="0"
                  max="30"
                  value={colorChanges}
                  onChange={(e) => setColorChanges(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Cada troca adiciona ~1.2 min p/ re-passar o fio
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custo da Matriz (se comprada/feita)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400">R$</span>
                  <input
                    id="input-matrix-cost"
                    type="number"
                    min="0"
                    step="1"
                    value={matrixCost}
                    onChange={(e) => setMatrixCost(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 pl-9 bg-slate-50 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  R$ 0 se matriz própria do seu acervo
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Insumos, Entretela & Peça Lisa */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-600" />
              3. Insumos, Entretela e Peça
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Entretela Usada
                </label>
                <select
                  id="select-stabilizer-type"
                  value={stabilizerType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setStabilizerType(val);
                    if (val === 'rasgavel') setStabilizerCost(0.9);
                    if (val === 'soluvel') setStabilizerCost(2.5);
                    if (val === 'dupla') setStabilizerCost(1.8);
                    if (val === 'termocolante') setStabilizerCost(3.2);
                  }}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white"
                >
                  <option value="rasgavel">Rasgável 60g/80g (Padrão: R$ 0,90)</option>
                  <option value="soluvel">Hidrossolúvel p/ Toalhas Felpudas (R$ 2,50)</option>
                  <option value="dupla">Dupla Camada Tecidos Finos (R$ 1,80)</option>
                  <option value="termocolante">Termocolante / Patch (R$ 3,20)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custo da Entretela (por bastidor)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400">R$</span>
                  <input
                    id="input-stabilizer-cost"
                    type="number"
                    step="0.1"
                    min="0"
                    value={stabilizerCost}
                    onChange={(e) => setStabilizerCost(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 pl-9 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Peça Lisa Toggle */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="checkbox-client-piece"
                  type="checkbox"
                  checked={clientProvidesPiece}
                  onChange={(e) => setClientProvidesPiece(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  O cliente trouxe a peça (toalha/camisa/fralda)
                </span>
              </label>

              {!clientProvidesPiece && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-600 whitespace-nowrap">Custo da peça lisa:</span>
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">R$</span>
                    <input
                      id="input-blank-cost"
                      type="number"
                      step="0.5"
                      min="0"
                      value={blankPieceCost}
                      onChange={(e) => setBlankPieceCost(Number(e.target.value))}
                      className="w-full text-xs rounded-lg border border-slate-300 p-1.5 pl-8 bg-slate-50 focus:bg-white font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Labor & Handling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempo Preparação + Acabamento (minutos)
                </label>
                <input
                  id="input-handling-minutes"
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={handlingMinutes}
                  onChange={(e) => setHandlingMinutes(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Colocar bastidor, aparar fios soltos, passar a ferro
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor da sua Hora de Trabalho
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400">R$</span>
                  <input
                    id="input-artisan-rate"
                    type="number"
                    min="10"
                    step="1"
                    value={artisanHourlyRate}
                    onChange={(e) => setArtisanHourlyRate(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 pl-9 bg-slate-50 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mão de obra do artesão (ex: R$ 25,00/h)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Price & Profit Hero Card */}
          <div className="bg-white rounded-2xl border-2 border-rose-500/30 p-6 shadow-sm space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full">
                Preço Sugerido de Venda
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {result.pricePer1000Stitches.toFixed(2)} R$ / 1k pts
              </span>
            </div>

            <div>
              <div className="text-4xl font-black text-slate-900 font-display tracking-tight">
                {formatCurrencyBRL(result.suggestedPrice)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Com base nos custos reais + sua margem de lucro definida
              </p>
            </div>

            {/* Profit margin slider */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Margem de Lucro Desejada:</span>
                <span className="text-rose-600 font-mono text-sm">{profitMargin}%</span>
              </div>
              <input
                id="input-profit-margin"
                type="range"
                min="20"
                max="200"
                step="5"
                value={profitMargin}
                onChange={(e) => setProfitMargin(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>20% (Mínima)</span>
                <span>70% (Recomendada Ateliê)</span>
                <span>150% (Alta)</span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-1 text-emerald-800 text-xs font-semibold mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Lucro Líquido Real
                </div>
                <div className="text-lg font-bold text-emerald-700">
                  {formatCurrencyBRL(result.netProfit)}
                </div>
                <div className="text-[11px] text-emerald-600">
                  {result.profitMarginActual}% da receita
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-1 text-amber-800 text-xs font-semibold mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Custo Total Peça
                </div>
                <div className="text-lg font-bold text-amber-700">
                  {formatCurrencyBRL(result.totalProductionCost)}
                </div>
                <div className="text-[11px] text-amber-600">
                  Materiais + Máquina + Mão de obra
                </div>
              </div>
            </div>

            {/* Detailed Itemized Costs */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Detalhamento dos Custos
              </h3>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>🧵 Linha Superior + Bobina (Polyester):</span>
                  <span className="font-semibold text-slate-800">{formatCurrencyBRL(result.threadCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>📐 Entretela ({stabilizerType}):</span>
                  <span className="font-semibold text-slate-800">{formatCurrencyBRL(result.stabilizerCost)}</span>
                </div>
                {!clientProvidesPiece && (
                  <div className="flex justify-between text-slate-600">
                    <span>🧺 Peça Lisa Fornecida:</span>
                    <span className="font-semibold text-slate-800">{formatCurrencyBRL(result.blankPieceCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>⚡ Depreciação Brother + Energia:</span>
                  <span className="font-semibold text-slate-800">{formatCurrencyBRL(result.machineCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>✂️ Mão de Obra ({handlingMinutes} min):</span>
                  <span className="font-semibold text-slate-800">{formatCurrencyBRL(result.laborCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>🧷 Insumos (Agulha, cola spray, saquinho):</span>
                  <span className="font-semibold text-slate-800">{formatCurrencyBRL(result.consumablesCost)}</span>
                </div>
                {matrixCost > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>💻 Matriz Digitalizada:</span>
                    <span className="font-semibold text-slate-800">{formatCurrencyBRL(result.matrixCost)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Production Time Notice */}
            <div className="p-3 bg-slate-100 rounded-xl flex items-center gap-3 text-xs text-slate-700">
              <Clock className="w-5 h-5 text-slate-500 shrink-0" />
              <div>
                <strong>Tempo Total por Peça:</strong> {result.totalMinutes} minutos
                <div className="text-[11px] text-slate-500">
                  ({result.embroideryMinutes} min na Brother {selectedMachine.name} + {handlingMinutes} min acabamento)
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            {onUseCalculation && (
              <button
                onClick={handleApply}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Criar Pedido com esse Cálculo
              </button>
            )}
          </div>

          {/* Tips Box */}
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-sky-950">
              <Info className="w-4 h-4 text-sky-600" />
              Dica de Ouro para Máquinas Brother Domésticas
            </div>
            <p className="text-sky-800 leading-relaxed text-[11px]">
              Máquinas domésticas Brother (PE810L, BP2150, etc.) têm vida útil muito maior e menos quebra de agulha quando operam entre <strong>600 e 700 ppm</strong> em toalhas e tecidos felpudos. Sempre use plástico hidrossolúvel na frente da toalha para que as letras não sumam entre as felpas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
