import { useState } from 'react';
import { X, Download, Printer, FileText, CheckCircle, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { Order } from '../types';
import { exportOrderPdf } from '../utils/pdfGenerator';
import { formatCurrencyBRL } from '../utils/calculator';

interface PdfDocumentModalProps {
  order: Order;
  initialType?: 'orcamento' | 'os' | 'recibo';
  onClose: () => void;
}

export function PdfDocumentModal({
  order,
  initialType = 'orcamento',
  onClose,
}: PdfDocumentModalProps) {
  const [docType, setDocType] = useState<'orcamento' | 'os' | 'recibo'>(initialType);

  const handleDownload = () => {
    exportOrderPdf(order, docType);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-sm font-bold">Documento em PDF & Impressão</h2>
              <p className="text-[11px] text-slate-300">
                Pedido {order.trackingCode} - {order.clientName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Document Type Selector */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setDocType('orcamento')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  docType === 'orcamento'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Orçamento
              </button>
              <button
                onClick={() => setDocType('os')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  docType === 'os'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Ficha Técnica (OS)
              </button>
              <button
                onClick={() => setDocType('recibo')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  docType === 'recibo'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Recibo
              </button>
            </div>

            <button
              id="btn-print-doc"
              onClick={handlePrint}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition-all"
              title="Imprimir na impressora"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              id="btn-download-pdf"
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Printable Viewport */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 flex justify-center">
          <div
            id="printable-document"
            className="bg-white w-full max-w-[210mm] min-h-[260mm] p-8 sm:p-10 shadow-lg border border-slate-200 text-slate-800 space-y-6"
          >
            {/* Timbre Ateliê */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600">
                  Bordados Computadorizados de Alta Precisão
                </span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
                  NERI BORDADOS
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Especialista em Máquinas Brother Domésticas | Acabamento Perfeito
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 mt-1.5">
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                    <strong>(84) 98830-7080</strong>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    <strong>@neribordados</strong>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Facebook className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                    <strong>Nerialba Mendes</strong>
                  </span>
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {order.trackingCode}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Emissão: {order.createdAt}
                </div>
                {docType === 'orcamento' && (
                  <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                    Válido por 30 dias contados da emissão
                  </div>
                )}
              </div>
            </div>

            {/* Title Badge */}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-wide uppercase text-slate-900">
                  {docType === 'orcamento' && 'Proposta Comercial / Orçamento de Bordados'}
                  {docType === 'os' && 'Ordem de Serviço & Ficha Técnica Brother'}
                  {docType === 'recibo' && 'Comprovante & Recibo de Pagamento'}
                </span>
                {order.isUrgent && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase bg-amber-200 text-amber-950">
                    ⚡ Pedido Urgente
                  </span>
                )}
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase bg-rose-100 text-rose-800">
                Status: {order.status.replace('_', ' ')}
              </span>
            </div>

            {/* Client and Production Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 p-4 rounded-lg bg-slate-50/50">
              <div className="space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Cliente
                </span>
                <p className="font-bold text-slate-900 text-sm">{order.clientName}</p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                  <span>{order.clientPhone}</span>
                </p>
                {order.clientEmail && <p className="text-slate-600">E-mail: {order.clientEmail}</p>}
              </div>

              <div className="space-y-1 text-right sm:text-left sm:pl-4 sm:border-l border-slate-200">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Prazos & Máquina
                </span>
                <p className="text-slate-700">
                  Data de Entrega: <strong className="text-slate-900">{order.deliveryDate}</strong>
                </p>
                <p className="text-slate-700">
                  Máquina: <strong>{order.brotherMachineModel || 'Brother Doméstica'}</strong>
                </p>
                <p className="text-slate-700">
                  Total de Pontos: <strong>{(order.totalStitches || 0).toLocaleString('pt-BR')} pts</strong>
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 font-bold">
                    <th className="py-2 px-3">Item / Insumo</th>
                    <th className="py-2 px-2 text-center">Qtd</th>
                    <th className="py-2 px-3 text-center">Bastidor</th>
                    <th className="py-2 px-3 text-right">Pontos (.PES)</th>
                    <th className="py-2 px-3 text-right">Unitário</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((item) => {
                    const qty = item.quantity || 1;
                    const unitPrice = item.unitPriceCharged || (item.priceCharged / qty);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{item.pieceType || item.description}</div>
                          {item.description && item.description !== item.pieceType && (
                            <div className="text-[11px] text-slate-600 italic">{item.description}</div>
                          )}
                          <div className="text-[11px] text-slate-500">
                            {item.clientProvidedPiece ? 'Peça fornecida pelo cliente (custo zero)' : 'Insumo fornecido pelo ateliê'}
                          </div>
                          {docType === 'os' && item.threadColorsList && item.threadColorsList.length > 0 && (
                            <div className="text-[10px] text-rose-700 mt-1 font-mono">
                              🧵 Linhas: {item.threadColorsList.join(' | ')}
                            </div>
                          )}
                          {docType === 'os' && item.matrixName && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              💾 Arquivo: {item.matrixName}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800 font-mono">
                          {qty}
                        </td>
                        <td className="py-3 px-3 text-center font-medium">{item.hoopSize}</td>
                        <td className="py-3 px-3 text-right font-mono">
                          {(item.stitchesCount || 0).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {formatCurrencyBRL(unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                          {formatCurrencyBRL(item.priceCharged)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals & Payments */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrencyBRL(order.totalPrice)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Desconto:</span>
                    <span>- {formatCurrencyBRL(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Final:</span>
                  <span>{formatCurrencyBRL(order.finalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-700 pt-1">
                  <span>Sinal Pago:</span>
                  <span className="font-semibold text-emerald-700">{formatCurrencyBRL(order.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                  <span className={order.pendingAmount > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                    Saldo Restante:
                  </span>
                  <span className={order.pendingAmount > 0 ? 'text-rose-700 font-black' : 'text-emerald-700'}>
                    {formatCurrencyBRL(order.pendingAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Inspirations thumbnail section (if any) */}
            {order.inspirations.length > 0 && (
              <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Inspirações Anexadas pelo Cliente
                </span>
                <div className="flex flex-wrap gap-2">
                  {order.inspirations.map((insp) => (
                    <div key={insp.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200 text-[11px]">
                      {insp.type === 'photo' ? (
                        <img src={insp.url} alt="" className="w-8 h-8 rounded object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="font-mono text-[10px] text-blue-600">🔗 Link</span>
                      )}
                      <span className="font-medium text-slate-800">{insp.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & Terms */}
            <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1.5">
              <p className="font-bold text-slate-700">Orientações, Validade e Condições de Aprovação:</p>
              <p>• <strong>Validade:</strong> Este orçamento é válido por 30 dias contados a partir da data de sua emissão.</p>
              <p>• <strong>Critério Regular de Aprovação:</strong> O orçamento será considerado aprovado mediante a comprovação do pagamento de 50% do valor total a título de sinal.</p>
              <p>• <strong>Critério Urgente de Aprovação:</strong> Para pedidos com prazo ou critério urgente, o orçamento será considerado aprovado mediante a comprovação do pagamento de 100% do valor total antecipadamente.</p>
              <p>• <strong>Etapa 5 (Produto Pronto / Coleta):</strong> Para pedidos regulares, o cliente deve providenciar a coleta após o pagamento do restante do valor aprovado pelo orçamento (saldo final de 50%). Caso o pedido tenha entrado no critério urgente com pagamento de 100% antecipado, o cliente deverá solicitar apenas a coleta.</p>
              <p>• Cores de linhas sujeitas à disponibilidade de estoque dos fios 100% poliéster brilhante Polybrilho/Lumina.</p>
              {order.clientNotes && (
                <p className="text-slate-800 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Observação do Pedido:</strong> {order.clientNotes}
                </p>
              )}
            </div>

            {/* Signature Area */}
            <div className="pt-8 flex justify-between items-center text-xs text-slate-400">
              <div className="w-48 text-center border-t border-slate-300 pt-1">
                Responsável pelo Ateliê
              </div>
              <div className="w-48 text-center border-t border-slate-300 pt-1">
                Aceite do Cliente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
