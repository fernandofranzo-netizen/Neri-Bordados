import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { 
  Search, 
  Sparkles, 
  Camera, 
  Link as LinkIcon, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Cpu, 
  Send, 
  ExternalLink, 
  Check, 
  ArrowRight, 
  ShieldCheck,
  User,
  Phone,
  Heart,
  Lock,
  Shield,
  Zap,
  Copy,
  Calendar,
  AlertCircle,
  PackageCheck,
  QrCode
} from 'lucide-react';
import { Order, ChatMessage, InspirationItem, OrderStatus } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';
import { NeriLogo } from './NeriLogo';
import { 
  calculateBudgetValidity, 
  getBudgetApprovalCriteria, 
  buildStage5WhatsAppMessage, 
  openWhatsAppNotification, 
  ATELIER_PIX_KEY 
} from '../utils/whatsappHelper';

interface ClientPortalProps {
  orders: Order[];
  chats: Record<string, ChatMessage[]>;
  onSendMessage: (orderId: string, text: string, sender: 'atelier' | 'client', senderName: string) => void;
  onSubmitQuoteRequest: (newOrder: Order) => void;
  isAtelierAuthenticated?: boolean;
  onRequestAtelierLogin?: () => void;
  onReturnToAtelier?: () => void;
}

export function ClientPortal({
  orders,
  chats,
  onSendMessage,
  onSubmitQuoteRequest,
  isAtelierAuthenticated,
  onRequestAtelierLogin,
  onReturnToAtelier,
}: ClientPortalProps) {
  const [trackingSearch, setTrackingSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'tracking' | 'request_quote'>('tracking');

  // Client Quote Request Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [pieceDescription, setPieceDescription] = useState('');
  const [pieceType, setPieceType] = useState('Toalha de Banho');
  const [clientNotes, setClientNotes] = useState('');
  const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
  const [webLink, setWebLink] = useState('');
  const [webLinkTitle, setWebLinkTitle] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isQuoteUrgent, setIsQuoteUrgent] = useState(false);
  const [copiedPixPortal, setCopiedPixPortal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat state inside portal
  const [chatInput, setChatInput] = useState('');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];
  const orderMessages = selectedOrder ? chats[selectedOrder.id] || [] : [];
  const isSelectedUrgent = !!selectedOrder?.isUrgent;

  const handleSearchCode = (e: FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) =>
        o.trackingCode.toLowerCase() === trackingSearch.trim().toLowerCase() ||
        o.clientPhone.replace(/\D/g, '') === trackingSearch.replace(/\D/g, '')
    );
    if (found) {
      setSelectedOrderId(found.id);
      setActiveTab('tracking');
    } else {
      alert('Nenhum pedido encontrado com este código ou telefone.');
    }
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      const newInsp: InspirationItem = {
        id: `insp-client-${Date.now()}`,
        type: 'photo',
        url: base64,
        title: file.name || 'Foto tirada do celular',
        addedAt: new Date().toISOString().split('T')[0],
      };
      setInspirations([...inspirations, newInsp]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddLink = () => {
    if (!webLink.trim()) return;
    const newInsp: InspirationItem = {
      id: `insp-link-${Date.now()}`,
      type: 'link',
      url: webLink.trim(),
      title: webLinkTitle.trim() || 'Link da Inspiração',
      addedAt: new Date().toISOString().split('T')[0],
    };
    setInspirations([...inspirations, newInsp]);
    setWebLink('');
    setWebLinkTitle('');
  };

  const handleSendClientChat = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedOrder) return;
    onSendMessage(selectedOrder.id, chatInput.trim(), 'client', selectedOrder.clientName);
    setChatInput('');
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(ATELIER_PIX_KEY);
    setCopiedPixPortal(true);
    setTimeout(() => setCopiedPixPortal(false), 2500);
  };

  const handleWhatsAppStage5Action = () => {
    if (!selectedOrder) return;
    const msg = buildStage5WhatsAppMessage(selectedOrder);
    openWhatsAppNotification(selectedOrder.clientPhone || ATELIER_PHONE_DISPLAY, msg);
  };

  const handleClientSubmitQuote = (e: FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !pieceDescription.trim()) {
      alert('Por favor preencha nome, telefone e descrição do bordado.');
      return;
    }

    const validity = calculateBudgetValidity();
    const newTracking = `BRD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: Order = {
      id: `ord-client-${Date.now()}`,
      trackingCode: newTracking,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientNotes: clientNotes.trim(),
      status: 'orcamento',
      createdAt: new Date().toISOString().split('T')[0],
      deliveryDate: isQuoteUrgent ? '2026-09-14' : '2026-09-25',
      isUrgent: isQuoteUrgent,
      validUntil: validity.validUntilDate,
      items: [
        {
          id: `item-c-${Date.now()}`,
          description: pieceDescription.trim(),
          pieceType,
          clientProvidedPiece: false,
          pieceCost: 15.0,
          stitchesCount: 15000,
          hoopSize: '13x18 cm',
          threadColorsCount: 3,
          calculatedCost: 24.0,
          priceCharged: 65.0,
        },
      ],
      totalStitches: 15000,
      totalCost: 24.0,
      totalPrice: 65.0,
      discount: 0,
      finalPrice: 65.0,
      profit: 41.0,
      paymentStatus: 'pendente',
      paymentMethod: 'pix',
      amountPaid: 0,
      pendingAmount: 65.0,
      brotherMachineModel: 'Brother PE810L',
      inspirations,
    };

    onSubmitQuoteRequest(newOrder);
    setSelectedOrderId(newOrder.id);
    setRequestSubmitted(true);
    setActiveTab('tracking');
  };

  // Timeline steps for visual progress - adjusted for regular vs urgent
  const timelineSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { 
      key: 'orcamento', 
      label: 'Orçamento Solicitado', 
      desc: isSelectedUrgent 
        ? 'Válido 30 dias • Aprovação com 100% antecipado' 
        : 'Válido 30 dias • Aprovação com 50% de sinal' 
    },
    { 
      key: 'aprovado', 
      label: 'Orçamento Aprovado', 
      desc: isSelectedUrgent 
        ? '100% comprovado antecipado e matriz agendada' 
        : 'Sinal de 50% confirmado e matriz agendada' 
    },
    { key: 'em_producao', label: 'Na Máquina Brother', desc: 'Bordando fios de alto brilho' },
    { key: 'acabamento', label: 'Acabamento & Embalagem', desc: 'Limpeza de entretela e passadoria' },
    { 
      key: 'pronto', 
      label: 'Pronto p/ Retirada', 
      desc: isSelectedUrgent 
        ? '100% quitado • Solicitar apenas a coleta' 
        : 'Coleta liberada após quitação dos 50%' 
    },
  ];

  const getStepIndex = (st: OrderStatus): number => {
    if (st === 'entregue') return 5;
    if (st === 'pronto') return 4;
    if (st === 'acabamento') return 3;
    if (st === 'em_producao' || st === 'aguardando_matriz') return 2;
    if (st === 'aprovado') return 1;
    return 0;
  };

  const currentStepIdx = selectedOrder ? getStepIndex(selectedOrder.status) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-cyan-800/40 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <NeriLogo size="lg" />
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                Neri Bordados • Portal do Cliente
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white mt-1.5 flex items-center gap-2">
                Acompanhe seu Bordado <Heart className="w-5 h-5 text-pink-400 fill-pink-400 inline" />
              </h1>
              <p className="text-xs sm:text-sm text-cyan-100/80 mt-1 max-w-xl">
                Consulte o status da sua peça na bordadeira Brother, envie fotos de inspiração do seu celular e converse em tempo real com nossa equipe.
              </p>
            </div>
          </div>

          <div className="flex bg-cyan-950/60 p-1 rounded-xl backdrop-blur-xs border border-cyan-500/30 text-xs shrink-0">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'tracking'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-cyan-200 hover:text-white'
              }`}
            >
              Acompanhar Pedido
            </button>
            <button
              onClick={() => setActiveTab('request_quote')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'request_quote'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-cyan-200 hover:text-white'
              }`}
            >
              Solicitar Orçamento
            </button>
          </div>
        </div>

        {/* Quick Search for Tracking Code */}
        {activeTab === 'tracking' && (
          <form onSubmit={handleSearchCode} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-lg relative z-10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-3" />
              <input
                type="text"
                value={trackingSearch}
                onChange={(e) => setTrackingSearch(e.target.value)}
                placeholder="Digite seu Código (ex: BRD-2026-101) ou Telefone..."
                className="w-full text-xs p-2.5 pl-10 rounded-xl bg-white/10 text-white placeholder-cyan-200/50 border border-cyan-500/30 focus:bg-white/20 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shrink-0 transition-all shadow-sm"
            >
              Buscar Pedido
            </button>
          </form>
        )}
      </div>

      {/* Tab 1: Order Tracking View */}
      {activeTab === 'tracking' && selectedOrder && (
        <div className="space-y-6">
          {/* Real-Time Status Progress Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-slate-900 text-white">
                    {selectedOrder.trackingCode}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 font-display">
                    {selectedOrder.items[0]?.description}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Cliente: <strong className="text-slate-800">{selectedOrder.clientName}</strong> • Previsão de Entrega: <strong className="text-rose-600">{selectedOrder.deliveryDate}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total do Pedido:</span>
                <div className="text-xl font-black text-slate-900 font-display">
                  {formatCurrencyBRL(selectedOrder.finalPrice)}
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">
                  {selectedOrder.pendingAmount === 0
                    ? '✓ Quitado'
                    : `Saldo Restante: ${formatCurrencyBRL(selectedOrder.pendingAmount)}`}
                </span>
              </div>
            </div>

            {/* Visual Timeline Stepper */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Progresso em Tempo Real da Produção
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {timelineSteps.map((step, idx) => {
                  const isDone = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const isUpcoming = idx > currentStepIdx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-cyan-500 bg-cyan-50/50 shadow-xs ring-1 ring-cyan-500'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                          : 'border-slate-100 bg-slate-50/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Etapa {idx + 1}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-ping" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">{step.label}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brother Machine Operational Info */}
            <div className="p-4 bg-cyan-50/40 rounded-xl border border-cyan-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-600" />
                <div>
                  <span className="font-bold text-slate-800">
                    Máquina Designada: {selectedOrder.brotherMachineModel || 'Brother PE810L'}
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Bordado computadorizado com {(selectedOrder.totalStitches || 0).toLocaleString('pt-BR')} pontos de alta definição
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700">
                Bastidor: {selectedOrder.items[0]?.hoopSize || '13x18 cm'}
              </div>
            </div>

            {/* ETAPA 1: Banner de Validade de 30 Dias e Condição de Aprovação */}
            {selectedOrder.status === 'orcamento' && (
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Validade da Proposta: 30 dias corridos contados da emissão</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                    Emitido em {selectedOrder.createdAt}
                  </span>
                </div>

                <div className="text-xs text-amber-950 space-y-2 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Regra de Aprovação de Orçamento:</strong>
                      {isSelectedUrgent ? (
                        <p className="mt-0.5">
                          Para pedidos com <strong>critério urgente</strong>, o orçamento será considerado aprovado mediante a <strong>comprovação do pagamento de 100% do valor</strong> antecipadamente ({formatCurrencyBRL(selectedOrder.finalPrice)}).
                        </p>
                      ) : (
                        <p className="mt-0.5">
                          O orçamento será considerado aprovado mediante a <strong>comprovação do pagamento de 50% do valor</strong> a título de sinal ({formatCurrencyBRL(selectedOrder.finalPrice * 0.5)}).
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      {copiedPixPortal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPixPortal ? 'Chave PIX Copiada!' : `Copiar Chave PIX: ${ATELIER_PIX_KEY}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => openWhatsAppNotification(ATELIER_PHONE_DISPLAY, `Olá! Gostaria de aprovar o orçamento do pedido #${selectedOrder.trackingCode} (${formatCurrencyBRL(isSelectedUrgent ? selectedOrder.finalPrice : selectedOrder.finalPrice * 0.5)}).`)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Enviar Comprovante de Pagamento no WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 5: Banner Oficial de Produto Pronto / Instrução de Coleta */}
            {selectedOrder.status === 'pronto' && (
              <div className={`p-5 rounded-2xl border space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
                isSelectedUrgent
                  ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border-amber-300'
                  : 'bg-gradient-to-r from-cyan-50 via-teal-50 to-emerald-50 border-cyan-300'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl text-white ${isSelectedUrgent ? 'bg-amber-600' : 'bg-teal-700'}`}>
                      {isSelectedUrgent ? <Zap className="w-5 h-5 fill-white" /> : <PackageCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                        Etapa 5 • Produto Pronto
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 font-display">
                        {isSelectedUrgent 
                          ? '⚡ Pedido Urgente Pronto: Solicite apenas a Coleta!' 
                          : '🎉 Seu Bordado está Pronto: Providencie a Coleta após o Pagamento!'}
                      </h4>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isSelectedUrgent 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {isSelectedUrgent ? '✓ 100% Quitado Antecipadamente' : `Saldo Restante: ${formatCurrencyBRL(selectedOrder.pendingAmount || selectedOrder.finalPrice * 0.5)}`}
                  </span>
                </div>

                {isSelectedUrgent ? (
                  <div className="text-xs sm:text-sm text-slate-800 space-y-2 leading-relaxed">
                    <p>
                      O seu produto está <strong>100% pronto e inspecionado</strong>! Como este pedido entrou no <strong>critério urgente</strong> e foi aprovado com a comprovação do <strong>pagamento de 100% do valor antecipadamente</strong>, você deverá <strong>solicitar apenas a coleta</strong> da sua encomenda.
                    </p>
                    <p className="text-slate-600 text-xs">
                      Pode retirar diretamente em nosso balcão ou solicitar portador (Uber Flash / 99 Entregas / Motoboy). Avise nossa equipe pelo WhatsApp para liberarmos o pacote!
                    </p>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-slate-800 space-y-2 leading-relaxed">
                    <p>
                      O seu produto está pronto no ateliê! Conforme as condições do orçamento aprovado, você deve <strong>providenciar a coleta após o pagamento do restante do valor aprovado</strong> ({formatCurrencyBRL(selectedOrder.pendingAmount || selectedOrder.finalPrice * 0.5)}).
                    </p>
                    <p className="text-slate-600 text-xs">
                      Após efetuar o pagamento do saldo restante de 50%, envie o comprovante no WhatsApp para liberação imediata no balcão ou para o serviço de coleta.
                    </p>
                  </div>
                )}

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  {!isSelectedUrgent && (
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      {copiedPixPortal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPixPortal ? 'PIX Copiado!' : `Copiar Chave PIX (${ATELIER_PIX_KEY})`}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleWhatsAppStage5Action}
                    className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-98 ${
                      isSelectedUrgent 
                        ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' 
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSelectedUrgent ? 'Solicitar Coleta no WhatsApp' : 'Enviar Comprovante & Solicitar Coleta'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Grid: Inspirations & Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Inspirations (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Inspirações Anexadas ao Pedido
                </h3>
                <p className="text-xs text-slate-500">
                  Fotos e referências de internet usadas pela artesã
                </p>
              </div>

              {selectedOrder.inspirations.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Nenhuma imagem ou link anexado a este pedido.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedOrder.inspirations.map((insp) => (
                    <div
                      key={insp.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{insp.title}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border">
                          {insp.type === 'photo' ? 'Foto' : 'Link'}
                        </span>
                      </div>

                      {insp.type === 'photo' ? (
                        <img
                          src={insp.url}
                          alt={insp.title}
                          className="w-full h-36 object-cover rounded-lg border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <a
                          href={insp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Acessar página de referência
                        </a>
                      )}

                      {insp.notes && (
                        <p className="text-[11px] text-slate-500 italic">"{insp.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Integrated Chat (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[480px] overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-teal-900 to-cyan-950 text-white flex items-center justify-between border-b border-cyan-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-xs">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Chat Direto • Neri Bordados
                    </h3>
                    <p className="text-[11px] text-cyan-200/80">
                      Tire dúvidas sobre fios, cores e aprovação de matriz
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {orderMessages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Inicie uma conversa diretamente com o ateliê!
                  </div>
                ) : (
                  orderMessages.map((msg) => {
                    const isClient = msg.sender === 'client';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                          <span className="font-bold text-slate-600">{msg.senderName}</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                            isClient
                              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-cyan-100 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendClientChat} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escreva sua mensagem para o ateliê..."
                  className="flex-1 text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Client Request Quote Form */}
      {activeTab === 'request_quote' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-cyan-100 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600">
              Novo Orçamento Personalizado
            </span>
            <h2 className="text-xl font-bold font-display text-slate-900 mt-1">
              Descreva o que você gostaria de bordar no Neri Bordados
            </h2>
            <p className="text-xs text-slate-500">
              Anexe fotos da câmera do seu celular ou cole links do Instagram e Pinterest para avaliarmos a matriz
            </p>
          </div>

          <form onSubmit={handleClientSubmitQuote} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Ana Luiza Ferreira"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seu WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Peça</label>
                <select
                  value={pieceType}
                  onChange={(e) => setPieceType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                >
                  <option value="Toalha de Banho">Toalha de Banho (Casal / Monograma)</option>
                  <option value="Toalha de Lavabo">Toalha de Lavabo / Rosto</option>
                  <option value="Fraldas de Boca / Ombro">Enxoval Bebê / Fralda Cremer</option>
                  <option value="Jaleco / Uniforme">Jaleco Profissional / Uniforme</option>
                  <option value="Body Bebê">Body de Bebê Personalizado</option>
                  <option value="Pano de Prato">Pano de Copa Gourmet</option>
                  <option value="Outro">Outro item</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">O que bordar? *</label>
                <input
                  type="text"
                  required
                  value={pieceDescription}
                  onChange={(e) => setPieceDescription(e.target.value)}
                  placeholder="Ex: Nome 'Benjamin' com coroa de louros dourada"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Inspiration Upload Area */}
            <div className="bg-cyan-50/30 p-4 rounded-xl border border-cyan-100 space-y-3">
              <label className="block font-bold text-slate-800">
                Suas Inspirações (Foto do Celular ou Link)
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-cyan-50 text-slate-800 font-semibold border border-cyan-200 flex items-center gap-1.5 shadow-xs"
                >
                  <Camera className="w-4 h-4 text-pink-600" />
                  Tirar Foto ou Escolher da Galeria
                </button>

                <div className="flex-1 flex gap-2 min-w-[240px]">
                  <input
                    type="url"
                    value={webLink}
                    onChange={(e) => setWebLink(e.target.value)}
                    placeholder="Cole o link do Instagram / Pinterest..."
                    className="flex-1 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-3 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-semibold shrink-0"
                  >
                    Adicionar Link
                  </button>
                </div>
              </div>

              {/* Previews of added inspirations */}
              {inspirations.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {inspirations.map((it) => (
                    <div key={it.id} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                      {it.type === 'photo' ? (
                        <img src={it.url} alt="" className="w-full h-20 object-cover rounded" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-20 bg-cyan-50 p-2 rounded text-[10px] text-cyan-800 truncate">
                          🔗 {it.title}
                        </div>
                      )}
                      <span className="text-[10px] text-slate-600 font-medium truncate block">
                        {it.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Informações adicionais para a equipe
              </label>
              <textarea
                rows={2}
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Ex: Prefiro cores pastéis, tamanho do bordado aprox. 15cm..."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs sm:text-sm"
              />
            </div>

            {/* Urgent checkbox & conditions */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isQuoteUrgent}
                  onChange={(e) => setIsQuoteUrgent(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className={`w-3.5 h-3.5 ${isQuoteUrgent ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                  Tenho urgência na entrega (Pedido com prioridade na bordadeira)
                </span>
              </label>

              <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200/80">
                <p>• <strong>Validade:</strong> Todo orçamento é válido por <strong>30 dias</strong> a partir da data de emissão.</p>
                <p>• <strong>Aprovação Regular:</strong> Comprovação de pagamento de <strong>50% do valor</strong> a título de sinal.</p>
                <p>• <strong>Aprovação Urgente:</strong> Comprovação de pagamento de <strong>100% antecipadamente</strong> (na Etapa 5 você apenas solicita a coleta, sem saldo pendente).</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-bold shadow-md shadow-pink-600/20 flex items-center gap-2 transition-all active:scale-98 text-xs sm:text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Enviar Solicitação de Orçamento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discreet Footer with Atelier Staff Access */}
      <footer className="pt-6 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>© 2026 Neri Bordados Computadorizados</span>
          <span>•</span>
          <span>Ateliê Especializado Brother</span>
        </div>

        <div>
          {isAtelierAuthenticated ? (
            <button
              onClick={onReturnToAtelier}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 hover:bg-cyan-100 font-semibold transition-colors border border-cyan-200"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-600" />
              Retornar para o Painel do Ateliê
            </button>
          ) : (
            onRequestAtelierLogin && (
              <button
                onClick={onRequestAtelierLogin}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-800 transition-colors py-1 px-2 rounded hover:bg-slate-200/50"
              >
                <Lock className="w-3 h-3" />
                Área Restrita do Ateliê (Equipe)
              </button>
            )
          )}
        </div>
      </footer>
    </div>
  );
}
