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
  QrCode,
  RotateCcw,
  Share2,
  MessageCircle,
  Instagram,
  Facebook,
  Play
} from 'lucide-react';
import { Order, ChatMessage, InspirationItem, OrderStatus } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';
import { NeriLogo } from './NeriLogo';
import { 
  calculateBudgetValidity, 
  getBudgetApprovalCriteria, 
  buildStage5WhatsAppMessage, 
  openWhatsAppNotification, 
  openAtelierDirectWhatsApp,
  ATELIER_PIX_KEY,
  ATELIER_PHONE_DISPLAY,
  ATELIER_WHATSAPP_RAW,
  ATELIER_INSTAGRAM_HANDLE,
  ATELIER_INSTAGRAM_URL,
  ATELIER_FACEBOOK_URL
} from '../utils/whatsappHelper';

interface ClientPortalProps {
  orders: Order[];
  chats: Record<string, ChatMessage[]>;
  onSendMessage: (orderId: string, text: string, sender: 'atelier' | 'client', senderName: string) => void;
  onSubmitQuoteRequest: (newOrder: Order) => void;
  isAtelierAuthenticated?: boolean;
  onRequestAtelierLogin?: () => void;
  onReturnToAtelier?: () => void;
  onOpenPresentationTour?: () => void;
}

export function ClientPortal({
  orders,
  chats,
  onSendMessage,
  onSubmitQuoteRequest,
  isAtelierAuthenticated,
  onRequestAtelierLogin,
  onReturnToAtelier,
  onOpenPresentationTour,
}: ClientPortalProps) {
  const [trackingSearch, setTrackingSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracking' | 'request_quote'>('request_quote');

  // Client Quote Request Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [pieceDescription, setPieceDescription] = useState('');
  const [pieceType, setPieceType] = useState('Toalha Fralda Cremer 120cm x 70cm');
  const [pieceQuantity, setPieceQuantity] = useState(1);
  const [clientNotes, setClientNotes] = useState('');
  const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
  const [webLink, setWebLink] = useState('');
  const [webLinkTitle, setWebLinkTitle] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isQuoteUrgent, setIsQuoteUrgent] = useState(false);
  const [copiedPixPortal, setCopiedPixPortal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quoteSectionRef = useRef<HTMLDivElement>(null);

  // Chat state inside portal
  const [chatInput, setChatInput] = useState('');

  // The order is ONLY visible when the client explicitly searches by code or registered phone, or just submitted
  const selectedOrder = selectedOrderId ? orders.find((o) => o.id === selectedOrderId) || null : null;
  const orderMessages = selectedOrder ? chats[selectedOrder.id] || [] : [];
  const isSelectedUrgent = !!selectedOrder?.isUrgent;

  const handleScrollToQuote = () => {
    setActiveTab('request_quote');
    setTimeout(() => {
      quoteSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleFocusSearch = () => {
    setActiveTab('tracking');
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSearchCode = (e: FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setHasSearched(true);

    const query = trackingSearch.trim();
    if (!query) {
      setSearchError('Por favor, informe o código do seu pedido (ex: BRD-2026-101) ou o seu telefone.');
      setSelectedOrderId(null);
      return;
    }

    const queryLower = query.toLowerCase();
    const queryDigits = query.replace(/\D/g, '');

    const found = orders.find((o) => {
      // 1. Busca por código de rastreio (exato, sem traços ou contido)
      const orderCodeLower = o.trackingCode.toLowerCase();
      const cleanOrderCode = orderCodeLower.replace(/[^a-z0-9]/g, '');
      const cleanQueryCode = queryLower.replace(/[^a-z0-9]/g, '');

      if (orderCodeLower === queryLower || cleanOrderCode === cleanQueryCode) {
        return true;
      }
      if (queryLower.length >= 3 && orderCodeLower.includes(queryLower)) {
        return true;
      }

      // 2. Busca por telefone cadastrado (com ou sem DDD, com ou sem DDI 55)
      if (queryDigits.length >= 4) {
        const orderPhoneDigits = (o.clientPhone || '').replace(/\D/g, '');
        const cleanOrderPhone = orderPhoneDigits.startsWith('55') ? orderPhoneDigits.slice(2) : orderPhoneDigits;
        const cleanQuery = queryDigits.startsWith('55') ? queryDigits.slice(2) : queryDigits;

        if (cleanOrderPhone === cleanQuery) return true;
        if (cleanOrderPhone.endsWith(cleanQuery) || cleanQuery.endsWith(cleanOrderPhone)) return true;
        if (orderPhoneDigits.includes(queryDigits) || queryDigits.includes(orderPhoneDigits)) return true;
      }

      return false;
    });

    if (found) {
      setSelectedOrderId(found.id);
      setActiveTab('tracking');
      setSearchError(null);
    } else {
      setSelectedOrderId(null);
      setActiveTab('tracking');
      setSearchError(
        `Nenhum pedido localizado para "${query}". Verifique se o código ou o telefone com DDD foram digitados corretamente, ou entre em contato com nosso ateliê.`
      );
    }
  };

  const handleClearSearch = () => {
    setSelectedOrderId(null);
    setTrackingSearch('');
    setSearchError(null);
    setHasSearched(false);
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
    const qty = Math.max(1, pieceQuantity || 1);
    const unitCost = 24.0;
    const unitPrice = 65.0;
    const itemCost = Math.round(unitCost * qty * 100) / 100;
    const itemPrice = Math.round(unitPrice * qty * 100) / 100;
    const itemProfit = Math.round((itemPrice - itemCost) * 100) / 100;

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
          quantity: qty,
          unitCost,
          unitPriceCharged: unitPrice,
          clientProvidedPiece: false,
          pieceCost: 15.0,
          stitchesCount: 15000,
          hoopSize: '13x18 cm',
          threadColorsCount: 3,
          calculatedCost: itemCost,
          priceCharged: itemPrice,
        },
      ],
      totalStitches: 15000 * qty,
      totalCost: itemCost,
      totalPrice: itemPrice,
      discount: 0,
      finalPrice: itemPrice,
      profit: itemProfit,
      paymentStatus: 'pendente',
      paymentMethod: 'pix',
      amountPaid: 0,
      pendingAmount: itemPrice,
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

          <div className="flex bg-[#071d33] p-1 rounded-2xl backdrop-blur-xs border border-cyan-500/40 text-xs shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === 'tracking'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-cyan-200 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Acompanhar Pedido</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('request_quote')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === 'request_quote'
                  ? 'bg-[#e60067] hover:bg-[#d6005f] text-white shadow-md shadow-pink-950/40 border border-white/30 ring-1 ring-white/20'
                  : 'text-pink-200 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Solicitar Orçamento</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Quote CTA in Banner */}
        <form onSubmit={handleSearchCode} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-2xl relative z-10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-3" />
            <input
              ref={searchInputRef}
              type="text"
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              placeholder="Digite seu Código (ex: BRD-2026-101) ou Telefone..."
              className="w-full text-xs p-2.5 pl-10 rounded-xl bg-white/10 text-white placeholder-cyan-200/50 border border-cyan-500/30 focus:bg-white/20 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shrink-0 transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar Pedido</span>
          </button>
          <button
            type="button"
            onClick={handleScrollToQuote}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-pink-400/40 hover:border-pink-300 text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            title="Preencher orçamento online"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            <span>Novo Orçamento</span>
          </button>
        </form>
      </div>

      {/* Project Presentation Tour Invitation Bar */}
      {onOpenPresentationTour && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border border-purple-500/30 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
              <Play className="w-4 h-4 fill-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                Apresentação Interativa do Projeto
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Vídeo Tour & Roteiro
                </span>
              </p>
              <p className="text-[11px] text-purple-200/75 mt-0.5">
                Conheça em formato de apresentação guiada o fluxo completo: catálogo, máquina Brother, regras de Pix e segurança SMS.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPresentationTour}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Assistir Apresentação</span>
          </button>
        </div>
      )}

      {/* Order Tracking View (Visible when active tab is tracking and order is matched or created) */}
      {activeTab === 'tracking' && selectedOrder && (
        <div className="space-y-6">
          {requestSubmitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-950 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-sm text-emerald-900">
                    Solicitação de Orçamento Enviada com Sucesso!
                  </strong>
                  <p className="text-emerald-800 mt-0.5">
                    Seu código de acompanhamento é <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-slate-900">{selectedOrder.trackingCode}</span>. Você pode acompanhar a análise da matriz e a produção em tempo real nesta tela.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestSubmitted(false)}
                className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold underline shrink-0"
              >
                Dispensar
              </button>
            </div>
          )}

          {/* Top Search Result Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white px-4 py-3 rounded-2xl border border-cyan-200 shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Pedido localizado: <strong className="text-slate-900 font-mono font-bold">{selectedOrder.trackingCode}</strong> • Cliente: <strong className="text-slate-900">{selectedOrder.clientName}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Fazer Nova Busca
              </button>
              <button
                type="button"
                onClick={handleScrollToQuote}
                className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-600" /> Solicitar Novo Orçamento
              </button>
            </div>
          </div>

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

            {/* Itens do Pedido (Insumos & Quantidade) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Itens & Insumos do Pedido ({selectedOrder.items.reduce((s, i) => s + (i.quantity || 1), 0)} peças)
              </span>
              <div className="space-y-2">
                {selectedOrder.items.map((it, idx) => {
                  const qty = it.quantity || 1;
                  const unitPrice = it.unitPriceCharged || (it.priceCharged / qty);
                  return (
                    <div key={it.id || idx} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-mono font-bold">
                            {qty}x
                          </span>
                          <span>{it.pieceType || it.description}</span>
                        </div>
                        {it.description && it.description !== it.pieceType && (
                          <p className="text-[11px] text-slate-600 mt-0.5">{it.description}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {it.clientProvidedPiece ? 'Peça do cliente' : 'Insumo fornecido pelo ateliê'} • {(it.stitchesCount || 0).toLocaleString('pt-BR')} pts ({it.hoopSize})
                        </p>
                      </div>

                      <div className="text-right sm:self-center shrink-0">
                        {qty > 1 && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {formatCurrencyBRL(unitPrice)}/un
                          </span>
                        )}
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {formatCurrencyBRL(it.priceCharged)}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                      title="Enviar Comprovante pelo WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 fill-white/20" />
                      <span>Enviar Comprovante de Pagamento</span>
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
                    <MessageCircle className="w-4 h-4 fill-white/20" />
                    <span>{isSelectedUrgent ? 'Solicitar Coleta' : 'Enviar Comprovante & Solicitar Coleta'}</span>
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

      {/* Tab: Acompanhar Pedido - Informações e Busca de Pedido */}
      {activeTab === 'tracking' && !selectedOrder && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {searchError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900 animate-in fade-in duration-150">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <strong className="block font-bold">Nenhum Pedido Encontrado</strong>
                <p>{searchError}</p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 font-semibold hover:bg-rose-100 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Tentar Novamente
                  </button>
                  <button
                    type="button"
                    onClick={() => openAtelierDirectWhatsApp(`Olá! Gostaria de consultar o status do meu bordado no Ateliê Neri Bordados. Meu nome é...`)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-white/20" /> {ATELIER_PHONE_DISPLAY}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center shadow-2xs">
              <Search className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Consulte o Andamento do seu Pedido
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                Para sua total privacidade e segurança, os detalhes do bordado ficam visíveis <strong>apenas após você realizar a busca</strong> pelo <strong>Código do Pedido</strong> (ex: <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-mono font-bold">BRD-2026-101</code>) ou pelo <strong>Telefone cadastrado</strong> no campo de busca acima.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-left">
              <div className="p-4 rounded-xl border border-pink-100 bg-pink-50/40 space-y-2">
                <span className="text-[11px] font-bold text-pink-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-600" /> Primeiro acesso ou novo pedido?
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deseja fazer um novo pedido ou solicitar orçamento? Escolha insumos e envie fotos do seu celular.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('request_quote')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 hover:text-pink-700 pt-1 transition-colors"
                >
                  Solicitar Orçamento Online <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" /> Suporte & Atendimento
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Precisa do seu código de rastreio ou tem alguma dúvida? Fale diretamente com nossa equipe.
                </p>
                <button
                  type="button"
                  onClick={() => openAtelierDirectWhatsApp()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-1 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" /> {ATELIER_PHONE_DISPLAY} <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
              <span className="text-[11px] text-slate-400 font-semibold">Redes & Contatos:</span>
              <a
                href={ATELIER_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-bold hover:underline"
                title="Instagram"
              >
                <Instagram className="w-4 h-4 text-pink-600" /> {ATELIER_INSTAGRAM_HANDLE}
              </a>
              <span>•</span>
              <a
                href={ATELIER_FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-bold hover:underline"
                title="Facebook"
              >
                <Facebook className="w-4 h-4 text-blue-700" /> Nerialba Mendes
              </a>
              <span>•</span>
              <button
                type="button"
                onClick={() => openAtelierDirectWhatsApp()}
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" /> {ATELIER_PHONE_DISPLAY}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Solicitar Orçamento (Selected by default on initial access) */}
      {activeTab === 'request_quote' && (
        <div
          ref={quoteSectionRef}
          id="secao-orcamento"
          className="bg-white p-6 sm:p-8 rounded-2xl border border-pink-200 shadow-xs space-y-6 animate-in fade-in duration-200 ring-1 ring-pink-100"
        >
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-pink-100 text-pink-700">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-600">
                  Novo Orçamento Personalizado • Neri Bordados
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-slate-900 mt-2">
                Descreva o que você gostaria de bordar no Neri Bordados
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Preencha os dados abaixo, escolha a peça e a quantidade. Anexe fotos da câmera do seu celular ou cole links do Instagram e Pinterest para avaliarmos a matriz computadorizada na bordadeira Brother PE810L.
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
                <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  <span>Celular / Contato *</span>
                </label>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Insumo / Peça Base</span>
                  <span className="text-[10px] text-pink-600 font-medium">Pré-selecionado</span>
                </label>
                <select
                  value={pieceType}
                  onChange={(e) => setPieceType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                >
                  <optgroup label="Fraldas & Enxoval Bebê">
                    <option value="Toalha Fralda Cremer 120cm x 70cm">Toalha Fralda Cremer 120x70cm</option>
                    <option value="Fralda Cremer Luxo 70cm x 70cm">Fralda Cremer Luxo 70x70cm</option>
                    <option value="Fralda de Boca Cremer 35cm x 35cm">Fralda de Boca Cremer 35x35cm</option>
                    <option value="Manta Bebê Microfibra / Piquet">Manta Bebê Microfibra</option>
                    <option value="Body Bebê Manga Curta 100% Algodão">Body Bebê 100% Algodão</option>
                  </optgroup>
                  <optgroup label="Banho & Lavabo">
                    <option value="Toalha de Lavabo Döhler Bella 30x45cm">Toalha de Lavabo Döhler 30x45cm</option>
                    <option value="Toalha de Banho Döhler Artesanall 70x140cm">Toalha de Banho Döhler 70x140cm</option>
                    <option value="Jogo de Toalhas Banho + Rosto Döhler">Jogo Banho + Rosto Döhler</option>
                  </optgroup>
                  <optgroup label="Cozinha & Outros">
                    <option value="Pano de Prato Sacaria Pé de Galinha 50x70cm">Pano de Prato Pé de Galinha</option>
                    <option value="Jaleco Profissional Manga Longa Gabardine">Jaleco Profissional</option>
                    <option value="Peça fornecida pelo Cliente">Vou fornecer a minha própria peça</option>
                    <option value="Outro Insumo Personalizado">Outro insumo personalizado</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Quantidade</span>
                  <span className="text-[10px] text-slate-400">peças</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={pieceQuantity}
                  onChange={(e) => setPieceQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white font-mono font-bold text-center text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">O que bordar? *</label>
                <input
                  type="text"
                  required
                  value={pieceDescription}
                  onChange={(e) => setPieceDescription(e.target.value)}
                  placeholder="Ex: Nome 'Benjamin' com coroa de louros dourada"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
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

      {/* Footer with Contacts, Socials and Atelier Staff Access */}
      <footer className="pt-6 pb-4 border-t border-slate-200/80 space-y-3 text-xs text-slate-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-700">© 2026 Neri Bordados Computadorizados</span>
            <span className="hidden sm:inline">•</span>
            <span>Ateliê Especializado Brother</span>
            <span className="hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => openAtelierDirectWhatsApp()}
              className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1.5"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              <span>{ATELIER_PHONE_DISPLAY}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={ATELIER_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 font-semibold hover:underline inline-flex items-center gap-1.5"
              title="Instagram"
            >
              <Instagram className="w-4 h-4 text-pink-600" />
              <span>{ATELIER_INSTAGRAM_HANDLE}</span>
            </a>
            <span>•</span>
            <a
              href={ATELIER_FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-800 font-semibold hover:underline inline-flex items-center gap-1.5"
              title="Facebook"
            >
              <Facebook className="w-4 h-4 text-blue-700" />
              <span>Nerialba Mendes</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
          <span className="text-slate-400">
            Orçamentos válidos por 30 dias • Pedidos urgentes aprovados com 100% antecipado (coleta direta na Etapa 5)
          </span>

          <div>
            {isAtelierAuthenticated ? (
              <button
                onClick={onReturnToAtelier}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 hover:bg-cyan-100 font-semibold transition-colors border border-cyan-200 text-xs"
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
        </div>
      </footer>
    </div>
  );
}
