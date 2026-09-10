import { BrotherMachinePreset } from '../types';

export const BROTHER_PRESETS: BrotherMachinePreset[] = [
  {
    id: 'brother_pe810l',
    name: 'Brother PE810L',
    speedSPM: 650,
    standardHoops: ['13x18 cm', '10x10 cm'],
    hourlyDepreciation: 4.5,
    electricityCostPerHour: 0.8,
  },
  {
    id: 'brother_bp2150',
    name: 'Brother BP2150',
    speedSPM: 750,
    standardHoops: ['18x30 cm', '13x18 cm', '10x10 cm'],
    hourlyDepreciation: 6.0,
    electricityCostPerHour: 1.0,
  },
  {
    id: 'brother_pe770',
    name: 'Brother PE770',
    speedSPM: 600,
    standardHoops: ['13x18 cm', '10x10 cm'],
    hourlyDepreciation: 4.0,
    electricityCostPerHour: 0.75,
  },
  {
    id: 'brother_bp1530',
    name: 'Brother BP1530',
    speedSPM: 700,
    standardHoops: ['16x26 cm', '13x18 cm', '10x10 cm'],
    hourlyDepreciation: 5.5,
    electricityCostPerHour: 0.9,
  },
  {
    id: 'brother_pe910l',
    name: 'Brother PE910L (Wi-Fi)',
    speedSPM: 650,
    standardHoops: ['13x18 cm', '10x10 cm'],
    hourlyDepreciation: 4.8,
    electricityCostPerHour: 0.85,
  },
];

export interface CalculationInput {
  stitches: number; // Ex: 18500
  colorChanges: number; // Ex: 4 trocas
  hoopSize: string; // Ex: "13x18 cm"
  machineSpeed: number; // SPM ex: 650
  hourlyDepreciation: number; // R$/hora
  hourlyElectricity: number; // R$/hora
  artisanHourlyRate: number; // R$/hora mão de obra (ex: 25.00)
  handlingMinutes: number; // Tempo de montagem no bastidor, entretelamento, acabamento e embalagem (ex: 20 min)
  stabilizerType: 'rasgavel' | 'soluvel' | 'termocolante' | 'dupla';
  stabilizerCost: number; // Custo do corte de entretela
  upperThreadCostPer1kStitches: number; // Ex: R$ 0.12 por mil pontos
  bobbinCostPer1kStitches: number; // Ex: R$ 0.05 por mil pontos
  needleAndConsumableCost: number; // Ex: R$ 0.50 (spray cola, agulha, plástico)
  blankPieceCost: number; // Custo da toalha/peça se o ateliê fornecer (0 se cliente trouxe)
  matrixCost: number; // Matriz comprada ou custo de programação
  desiredProfitMarginPercent: number; // Margem de lucro desejada sobre os custos (ex: 60%)
}

export interface CalculationResult {
  embroideryMinutes: number; // Tempo de máquina
  totalMinutes: number; // Tempo total (máquina + preparação/acabamento)
  threadCost: number; // Custo das linhas
  stabilizerCost: number; // Custo da entretela
  blankPieceCost: number; // Custo da peça lisa
  machineCost: number; // Depreciação + energia elétrica
  laborCost: number; // Mão de obra do artesão
  consumablesCost: number; // Agulha, plástico, spray
  matrixCost: number;
  totalProductionCost: number; // Custo total de custo
  suggestedPrice: number; // Preço sugerido de venda com a margem
  netProfit: number; // Lucro líquido em R$
  profitMarginActual: number; // Margem real (%)
  pricePer1000Stitches: number; // Métrica do mercado de bordados (R$ a cada 1.000 pontos)
}

export function calculateEmbroideryCost(input: CalculationInput): CalculationResult {
  const stitches = Math.max(1, input.stitches);
  const colorChanges = Math.max(0, input.colorChanges);
  const speed = Math.max(200, input.machineSpeed || 650);

  // Tempo na máquina Brother: pontos / velocidade + ~1.2 min por troca de linha
  const machineRunningMinutes = stitches / speed;
  const rethreadMinutes = colorChanges * 1.2;
  const embroideryMinutes = Math.round((machineRunningMinutes + rethreadMinutes) * 10) / 10;

  const totalMinutes = embroideryMinutes + (input.handlingMinutes || 15);
  const machineHours = embroideryMinutes / 60;
  const laborHours = (input.handlingMinutes || 15) / 60;

  // Custos de linhas (a cada 1000 pontos)
  const kStitches = stitches / 1000;
  const threadUpperCost = kStitches * (input.upperThreadCostPer1kStitches || 0.12);
  const threadBobbinCost = kStitches * (input.bobbinCostPer1kStitches || 0.05);
  const threadCost = Math.round((threadUpperCost + threadBobbinCost) * 100) / 100;

  // Custo de entretela
  const stabilizerCost = Math.max(0, input.stabilizerCost);

  // Custo de máquina (depreciação Brother + eletricidade)
  const machineDepreciation = machineHours * (input.hourlyDepreciation || 4.5);
  const electricity = machineHours * (input.hourlyElectricity || 0.8);
  const machineCost = Math.round((machineDepreciation + electricity) * 100) / 100;

  // Mão de obra
  const laborCost = Math.round(laborHours * (input.artisanHourlyRate || 25) * 100) / 100;

  // Insumos extras e peça
  const consumablesCost = Math.max(0, input.needleAndConsumableCost || 0.6);
  const blankPieceCost = Math.max(0, input.blankPieceCost || 0);
  const matrixCost = Math.max(0, input.matrixCost || 0);

  // Custo Total
  const totalProductionCost =
    Math.round(
      (threadCost +
        stabilizerCost +
        blankPieceCost +
        machineCost +
        laborCost +
        consumablesCost +
        matrixCost) *
        100
    ) / 100;

  // Preço sugerido com base na margem de lucro
  const marginMultiplier = 1 + (input.desiredProfitMarginPercent || 60) / 100;
  const suggestedPrice = Math.round(totalProductionCost * marginMultiplier * 10) / 10;
  const netProfit = Math.round((suggestedPrice - totalProductionCost) * 100) / 100;
  const profitMarginActual =
    suggestedPrice > 0 ? Math.round((netProfit / suggestedPrice) * 100) : 0;
  const pricePer1000Stitches =
    kStitches > 0 ? Math.round((suggestedPrice / kStitches) * 100) / 100 : 0;

  return {
    embroideryMinutes,
    totalMinutes,
    threadCost,
    stabilizerCost,
    blankPieceCost,
    machineCost,
    laborCost,
    consumablesCost,
    matrixCost,
    totalProductionCost,
    suggestedPrice,
    netProfit,
    profitMarginActual,
    pricePer1000Stitches,
  };
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}
