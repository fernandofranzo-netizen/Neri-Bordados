export type OrderStatus =
  | 'orcamento'      // Orçamento enviado / aguardando aprovação
  | 'aprovado'       // Aprovado pelo cliente
  | 'aguardando_matriz' // Programando ou ajustando arquivo .PES
  | 'em_producao'    // Bordando na máquina Brother
  | 'acabamento'     // Limpeza de entretela, corte de linhas, passar e embalar
  | 'pronto'         // Pronto para retirada / envio
  | 'entregue'       // Concluído e entregue
  | 'cancelado';

export type PaymentStatus = 'pendente' | 'sinal_pago' | 'pago_total' | 'atrasado';

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'transferencia';

export interface InspirationItem {
  id: string;
  type: 'photo' | 'link';
  url: string; // Base64 data URL or web link
  title: string;
  notes?: string;
  addedAt: string;
}

export interface EmbroideryItem {
  id: string;
  description: string; // Ex: "Toalha de Banho com Nome + Ramo de Flores"
  pieceType: string;   // Ex: "Toalha de Banho", "Fralda", "Body Bebê", "Pano de Prato"
  clientProvidedPiece: boolean; // Se o cliente trouxe a peça ou o ateliê forneceu
  pieceCost: number;   // Custo da peça base
  stitchesCount: number; // Quantidade de pontos (ex: 18500)
  hoopSize: string;    // Ex: "13x18 cm", "10x10 cm", "16x26 cm"
  threadColorsCount: number; // Qtd de trocas de cores
  threadColorsList?: string[]; // Ex: ["Polybrilho 2145 Ouro", "Lumina 401 Branco"]
  calculatedCost: number; // Custo de materiais + máquina
  priceCharged: number;   // Preço cobrado do cliente
  matrixName?: string;    // Nome do arquivo de matriz ex: "floresta_13x18.pes"
}

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: 'atelier' | 'client';
  senderName: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'link';
}

export interface Order {
  id: string;
  trackingCode: string; // Ex: "BRD-2026-081"
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientNotes?: string;
  status: OrderStatus;
  createdAt: string;
  deliveryDate: string; // Data prometida de entrega
  completedAt?: string;
  items: EmbroideryItem[];
  totalStitches: number;
  totalCost: number;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  profit: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amountPaid: number; // Quanto já foi pago (ex: sinal de 50%)
  pendingAmount: number; // Saldo a receber
  inspirations: InspirationItem[];
  brotherMachineModel?: string; // Ex: "Brother PE810L" ou "Brother BP2150"
  internalNotes?: string;
  isUrgent?: boolean; // Pedido urgente: aprovação exige 100% antecipado e na etapa 5 solicita apenas coleta
  validUntil?: string; // Validade do orçamento (30 dias)
  whatsappNotificationSent?: boolean; // Status de disparo da notificação da Etapa 5
}

export type MaterialCategory =
  | 'linha_superior'
  | 'linha_bobina'
  | 'entretela'
  | 'peca_lisa'
  | 'agulha'
  | 'acessorio';

export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  brand: string; // Ex: "Polybrilho", "Lumina", "Brother", "Döhler", "Organ"
  colorCode?: string; // Código de cor ex: "2145"
  colorHex?: string;  // Hex para preview visual
  unit: string;       // "cone 4000m", "metro", "unidade", "caixa"
  currentStock: number;
  minStock: number;   // Alerta de estoque baixo
  costPerUnit: number;
  location?: string;  // Ex: "Gaveta 2", "Prateleira A"
  lastRestocked?: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'receita' | 'despesa';
  category: string; // "Venda de Bordado", "Compra de Linhas", "Entretela", "Manutenção Máquina", "Energia", "Outros"
  description: string;
  amount: number;
  date: string;
  orderId?: string;
  paymentMethod: PaymentMethod;
}

export interface BrotherMachinePreset {
  id: string;
  name: string; // Ex: "Brother PE810L", "Brother BP2150", "Brother PE770", "Brother BP1530"
  speedSPM: number; // Velocidade recomendada em pontos por minuto (ex: 650)
  standardHoops: string[]; // ["10x10 cm", "13x18 cm", etc.]
  hourlyDepreciation: number; // R$ por hora de máquina
  electricityCostPerHour: number; // R$ por hora
}

export type { CalculationResult, CalculationInput } from './utils/calculator';
