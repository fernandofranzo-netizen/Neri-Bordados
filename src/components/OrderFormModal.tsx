import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Camera, 
  Link as LinkIcon, 
  Calculator, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Cpu, 
  Save, 
  Upload, 
  ExternalLink,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, PaymentMethod, EmbroideryItem, InspirationItem } from '../types';
import { BROTHER_PRESETS, calculateEmbroideryCost, formatCurrencyBRL } from '../utils/calculator';

interface OrderFormModalProps {
  orderToEdit?: Order | null;
  onSave: (order: Order) => void;
  onClose: () => void;
}

export function OrderFormModal({ orderToEdit, onSave, onClose }: OrderFormModalProps) {
  const [clientName, setClientName] = useState(orderToEdit?.clientName || '');
  const [clientPhone, setClientPhone] = useState(orderToEdit?.clientPhone || '');
  const [clientEmail, setClientEmail] = useState(orderToEdit?.clientEmail || '');
  const [clientNotes, setClientNotes] = useState(orderToEdit?.clientNotes || '');
  const [status, setStatus] = useState<OrderStatus>(orderToEdit?.status || 'orcamento');
  const [deliveryDate, setDeliveryDate] = useState(orderToEdit?.deliveryDate || '2026-09-18');
  const [brotherMachineModel, setBrotherMachineModel] = useState(
    orderToEdit?.brotherMachineModel || 'Brother PE810L'
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    orderToEdit?.paymentStatus || 'pendente'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    orderToEdit?.paymentMethod || 'pix'
  );
  const [amountPaid, setAmountPaid] = useState<number>(orderToEdit?.amountPaid || 0);
  const [discount, setDiscount] = useState<number>(orderToEdit?.discount || 0);
  const [internalNotes, setInternalNotes] = useState(orderToEdit?.internalNotes || '');

  // Items
  const [items, setItems] = useState<EmbroideryItem[]>(
    orderToEdit?.items || [
      {
        id: `item-${Date.now()}`,
        description: 'Toalha de Lavabo com Nome e Ramo Floral',
        pieceType: 'Toalha de Lavabo',
        clientProvidedPiece: false,
        pieceCost: 10.0,
        stitchesCount: 14500,
        hoopSize: '13x18 cm',
        threadColorsCount: 3,
        threadColorsList: ['Ouro Nobre 2145', 'Verde Oliva 3102', 'Branco 401'],
        calculatedCost: 22.5,
        priceCharged: 60.0,
        matrixName: 'Ramo_Nome_13x18.pes',
      },
    ]
  );

  // Inspirations (Photos or Links)
  const [inspirations, setInspirations] = useState<InspirationItem[]>(
    orderToEdit?.inspirations || []
  );
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Totals calculations
  const totalStitches = items.reduce((sum, item) => sum + (Number(item.stitchesCount) || 0), 0);
  const totalCost = items.reduce((sum, item) => sum + (Number(item.calculatedCost) || 0), 0);
  const totalPrice = items.reduce((sum, item) => sum + (Number(item.priceCharged) || 0), 0);
  const finalPrice = Math.max(0, totalPrice - discount);
  const pendingAmount = Math.max(0, finalPrice - amountPaid);
  const profit = finalPrice - totalCost;

  // Handle Photo upload (takes photo with phone camera or uploads file)
  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newInspiration: InspirationItem = {
        id: `insp-${Date.now()}`,
        type: 'photo',
        url: base64Url,
        title: file.name.replace(/\.[^/.]+$/, '') || 'Foto tirada da inspiração',
        addedAt: new Date().toISOString().split('T')[0],
      };
      setInspirations([...inspirations, newInspiration]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddLinkInspiration = () => {
    if (!newLinkUrl.trim()) return;
    const newInspiration: InspirationItem = {
      id: `insp-${Date.now()}`,
      type: 'link',
      url: newLinkUrl.trim(),
      title: newLinkTitle.trim() || 'Link de Inspiração (Instagram/Pinterest)',
      addedAt: new Date().toISOString().split('T')[0],
    };
    setInspirations([...inspirations, newInspiration]);
    setNewLinkUrl('');
    setNewLinkTitle('');
    setShowAddLinkForm(false);
  };

  const handleRemoveInspiration = (id: string) => {
    setInspirations(inspirations.filter((insp) => insp.id !== id));
  };

  // Item helpers
  const handleAddItem = () => {
    const newItem: EmbroideryItem = {
      id: `item-${Date.now()}`,
      description: 'Novo Bordado',
      pieceType: 'Toalha de Banho',
      clientProvidedPiece: false,
      pieceCost: 18.0,
      stitchesCount: 15000,
      hoopSize: '13x18 cm',
      threadColorsCount: 3,
      threadColorsList: [],
      calculatedCost: 25.0,
      priceCharged: 65.0,
      matrixName: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof EmbroideryItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };

        // If stitches or pieceCost changed, auto-estimate cost if desired
        if (field === 'stitchesCount' || field === 'pieceCost' || field === 'clientProvidedPiece') {
          const stitches = Number(field === 'stitchesCount' ? value : updated.stitchesCount);
          const pieceCost = updated.clientProvidedPiece ? 0 : Number(updated.pieceCost || 0);
          const calc = calculateEmbroideryCost({
            stitches,
            colorChanges: updated.threadColorsCount || 2,
            hoopSize: updated.hoopSize,
            machineSpeed: 650,
            hourlyDepreciation: 4.5,
            hourlyElectricity: 0.8,
            artisanHourlyRate: 25.0,
            handlingMinutes: 15,
            stabilizerType: 'rasgavel',
            stabilizerCost: 0.9,
            upperThreadCostPer1kStitches: 0.12,
            bobbinCostPer1kStitches: 0.05,
            needleAndConsumableCost: 0.6,
            blankPieceCost: pieceCost,
            matrixCost: 0,
            desiredProfitMarginPercent: 70,
          });
          updated.calculatedCost = calc.totalProductionCost;
          if (!updated.priceCharged || updated.priceCharged === 0 || updated.priceCharged === 60) {
            updated.priceCharged = calc.suggestedPrice;
          }
        }
        return updated;
      })
    );
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }

    const tracking = orderToEdit
      ? orderToEdit.trackingCode
      : `BRD-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: orderToEdit?.id || `ord-${Date.now()}`,
      trackingCode: tracking,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      clientNotes: clientNotes.trim(),
      status,
      createdAt: orderToEdit?.createdAt || new Date().toISOString().split('T')[0],
      deliveryDate,
      items,
      totalStitches,
      totalCost,
      totalPrice,
      discount,
      finalPrice,
      profit,
      paymentStatus,
      paymentMethod,
      amountPaid,
      pendingAmount,
      inspirations,
      brotherMachineModel,
      internalNotes: internalNotes.trim(),
    };

    onSave(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display">
                {orderToEdit ? 'Editar Pedido / Orçamento' : 'Novo Pedido / Orçamento'}
              </h2>
              <p className="text-xs text-slate-300">
                Gerencie itens, cálculo de pontos Brother, inspirações e financeiro
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Client & Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Dados do Cliente e Prazos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Mariana Vasconcelos"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  <span>Celular / Contato</span>
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status do Fluxo
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium text-slate-800"
                >
                  <option value="orcamento">Orçamento (Aguardando Aprovação)</option>
                  <option value="aprovado">Aprovado pelo Cliente</option>
                  <option value="aguardando_matriz">Aguardando Matriz (.PES)</option>
                  <option value="em_producao">Em Produção (Bordando na Brother)</option>
                  <option value="acabamento">Acabamento & Embalagem</option>
                  <option value="pronto">Pronto para Retirada</option>
                  <option value="entregue">Concluído e Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Entrega Prometida *
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Máquina Programada
                </label>
                <select
                  value={brotherMachineModel}
                  onChange={(e) => setBrotherMachineModel(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium"
                >
                  {BROTHER_PRESETS.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações do Cliente / Personalização
              </label>
              <textarea
                rows={2}
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Ex: Nome da criança bordado em dourado com brasão de louros; toalha de banho com monograma casal..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
              />
            </div>
          </div>

          {/* Section 2: Items to Embroider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Peças e Bordados Computadorizados ({items.length})
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 border border-rose-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Outra Peça
              </button>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 relative hover:border-slate-300"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    Peça #{idx + 1} - {item.pieceType}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remover peça"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Descrição do Bordado
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      placeholder="Ex: Fralda Cremer com Ursinho Aviador + Nome"
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo de Peça
                    </label>
                    <input
                      type="text"
                      value={item.pieceType}
                      onChange={(e) => handleUpdateItem(item.id, 'pieceType', e.target.value)}
                      placeholder="Ex: Toalha Banho, Jaleco, Body"
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pontos (.PES)
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="500"
                      value={item.stitchesCount}
                      onChange={(e) => handleUpdateItem(item.id, 'stitchesCount', Number(e.target.value))}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bastidor Brother
                    </label>
                    <select
                      value={item.hoopSize}
                      onChange={(e) => handleUpdateItem(item.id, 'hoopSize', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white"
                    >
                      <option value="10x10 cm">10x10 cm</option>
                      <option value="13x18 cm">13x18 cm</option>
                      <option value="16x26 cm">16x26 cm</option>
                      <option value="18x30 cm">18x30 cm</option>
                      <option value="20x20 cm">20x20 cm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Custo Produção
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-slate-400">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.calculatedCost}
                        onChange={(e) => handleUpdateItem(item.id, 'calculatedCost', Number(e.target.value))}
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 pl-8 bg-slate-50 focus:bg-white font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preço Cobrado
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-slate-400">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.priceCharged}
                        onChange={(e) => handleUpdateItem(item.id, 'priceCharged', Number(e.target.value))}
                        className="w-full text-xs rounded-lg border border-rose-300 p-2 pl-8 bg-rose-50/40 focus:bg-white font-black text-rose-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.clientProvidedPiece}
                      onChange={(e) => handleUpdateItem(item.id, 'clientProvidedPiece', e.target.checked)}
                      className="rounded text-rose-600 border-slate-300 focus:ring-rose-500"
                    />
                    <span className="text-slate-600">Cliente forneceu esta peça (custo zero)</span>
                  </label>

                  <div className="text-[11px] text-slate-500">
                    Lucro nesta peça: <strong className="text-emerald-600 font-semibold">{formatCurrencyBRL(item.priceCharged - item.calculatedCost)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Inspirations (Photos from Mobile / Links) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  3. Inspirações do Cliente (Fotos do Celular & Links da Web)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tire fotos da câmera, anexe referências ou cole links do Pinterest e Instagram
                </p>
              </div>

              <div className="flex items-center gap-2">
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
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-rose-600" />
                  Foto / Câmera
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddLinkForm(!showAddLinkForm)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 shadow-xs"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                  Link Web
                </button>
              </div>
            </div>

            {/* Add Web Link Form */}
            {showAddLinkForm && (
              <div className="p-3 bg-white rounded-lg border border-blue-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="Título (ex: Post do Instagram da cliente)"
                    className="text-xs p-2 rounded-md border border-slate-300"
                  />
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://pinterest.com/pin/..."
                    className="text-xs p-2 rounded-md border border-slate-300"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLinkForm(false)}
                    className="text-xs px-3 py-1 text-slate-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddLinkInspiration}
                    className="text-xs px-3 py-1 rounded-md bg-blue-600 text-white font-semibold"
                  >
                    Salvar Link
                  </button>
                </div>
              </div>
            )}

            {/* Inspirations Grid */}
            {inspirations.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                Nenhuma inspiração anexada ainda. Adicione fotos do celular ou links do Pinterest/Instagram.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {inspirations.map((insp) => (
                  <div
                    key={insp.id}
                    className="bg-white p-2 rounded-lg border border-slate-200 relative group overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveInspiration(insp.id)}
                      className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {insp.type === 'photo' ? (
                      <div className="space-y-1">
                        <img
                          src={insp.url}
                          alt={insp.title}
                          className="w-full h-24 object-cover rounded"
                          referrerPolicy="no-referrer"
                        />
                        <p className="text-[10px] font-medium text-slate-700 truncate">
                          {insp.title}
                        </p>
                      </div>
                    ) : (
                      <div className="h-24 p-2 bg-blue-50/60 rounded flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-700">
                            <ExternalLink className="w-3 h-3" /> Link Web
                          </div>
                          <p className="text-[10px] text-slate-700 line-clamp-2 mt-1 font-medium">
                            {insp.title}
                          </p>
                        </div>
                        <a
                          href={insp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-blue-600 underline truncate block"
                        >
                          {insp.url}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Financial Summary & Payments */}
          <div className="bg-slate-900 text-white p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">
              4. Fechamento Financeiro & Notificação de Pagamento
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Total das Peças</label>
                <div className="text-lg font-bold">{formatCurrencyBRL(totalPrice)}</div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Desconto Concedido</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-700 p-1.5 pl-8 bg-slate-800 text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Valor Final Cobrado</label>
                <div className="text-xl font-black text-rose-400 font-display">
                  {formatCurrencyBRL(finalPrice)}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Lucro Estimado</label>
                <div className="text-lg font-bold text-emerald-400">
                  {formatCurrencyBRL(profit)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Status do Pagamento</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value as PaymentStatus;
                    setPaymentStatus(newStatus);
                    if (newStatus === 'sinal_pago' && amountPaid === 0) {
                      setAmountPaid(Number((finalPrice / 2).toFixed(2)));
                    } else if (newStatus === 'pago_total') {
                      setAmountPaid(finalPrice);
                    }
                  }}
                  className="w-full text-xs rounded-lg border border-slate-700 p-2 bg-slate-800 text-white"
                >
                  <option value="pendente">Pendente (Nenhum valor pago)</option>
                  <option value="sinal_pago">Sinal 50% Pago (Início da produção)</option>
                  <option value="pago_total">Pago Total (100% Quitado)</option>
                  <option value="atrasado">Pagamento Atrasado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs rounded-lg border border-slate-700 p-2 bg-slate-800 text-white"
                >
                  <option value="pix">Pix</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="dinheiro">Dinheiro em Espécie</option>
                  <option value="transferencia">Transferência Bancária</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-slate-300">Quanto o cliente já pagou</label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        const half = Number((finalPrice / 2).toFixed(2));
                        setAmountPaid(half);
                        setPaymentStatus('sinal_pago');
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-cyan-300 font-semibold transition-colors"
                      title="Preencher com 50% de sinal"
                    >
                      50% ({formatCurrencyBRL(Number((finalPrice / 2).toFixed(2)))})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAmountPaid(finalPrice);
                        setPaymentStatus('pago_total');
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-emerald-300 font-semibold transition-colors"
                      title="Preencher com 100% total"
                    >
                      100%
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-700 p-1.5 pl-8 bg-slate-800 text-white font-bold"
                  />
                </div>
                <div className="text-[11px] text-rose-300 mt-1">
                  Saldo Restante: <strong>{formatCurrencyBRL(pendingAmount)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              id="btn-save-order"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              Salvar Pedido / Orçamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
