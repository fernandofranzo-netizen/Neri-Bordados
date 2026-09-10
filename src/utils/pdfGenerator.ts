import { jsPDF } from 'jspdf';
import { Order, FinancialTransaction } from '../types';
import { formatCurrencyBRL } from './calculator';

export function exportOrderPdf(order: Order, type: 'orcamento' | 'os' | 'recibo') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner with Neri Bordados Teal & Pink Branding
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setFillColor(219, 39, 119); // Pink-600 accent stripe
  doc.rect(0, 25, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('NERI BORDADOS • ATELIÊ COMPUTADORIZADO', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(204, 251, 241); // Teal-100
  doc.text('Especialista em Máquinas Brother | Bordados Personalizados, Brasões & Enxovais', 14, 18);

  // Document Title
  y = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);

  let docTitle = 'ORÇAMENTO DE BORDADO';
  if (type === 'os') docTitle = 'ORDEM DE SERVIÇO & FICHA TÉCNICA (BROTHER)';
  if (type === 'recibo') docTitle = 'RECIBO DE PAGAMENTO';

  doc.text(docTitle, 14, y);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Código: ${order.trackingCode} | Data: ${order.createdAt}`, pageWidth - 14, y, { align: 'right' });

  // Client Box
  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('DADOS DO CLIENTE', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Cliente: ${order.clientName}`, 18, y + 13);
  doc.text(`WhatsApp: ${order.clientPhone || 'Não informado'}`, 18, y + 19);
  if (order.clientEmail) {
    doc.text(`E-mail: ${order.clientEmail}`, 18, y + 25);
  }

  doc.text(`Prazo de Entrega: ${order.deliveryDate || 'A combinar'}`, 110, y + 13);
  doc.text(`Máquina Programada: ${order.brotherMachineModel || 'Brother Doméstica'}`, 110, y + 19);
  doc.text(`Status do Pedido: ${order.status.toUpperCase()}`, 110, y + 25);

  y += 36;

  // Items Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text('DESCRIÇÃO DA PEÇA / BORDADO', 16, y + 5.5);
  doc.text('BASTIDOR', 105, y + 5.5);
  doc.text('PONTOS', 135, y + 5.5);
  doc.text('VALOR', pageWidth - 16, y + 5.5, { align: 'right' });

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  order.items.forEach((item, index) => {
    // Description line
    const titleLines = doc.splitTextToSize(item.description, 86);
    doc.text(titleLines, 16, y);

    doc.text(item.hoopSize || '13x18 cm', 105, y);
    doc.text(`${(item.stitchesCount || 0).toLocaleString('pt-BR')} pts`, 135, y);
    doc.text(formatCurrencyBRL(item.priceCharged), pageWidth - 16, y, { align: 'right' });

    y += Math.max(8, titleLines.length * 5);

    if (type === 'os' && item.threadColorsList && item.threadColorsList.length > 0) {
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Fios/Cores: ${item.threadColorsList.join(' • ')}`, 16, y);
      if (item.matrixName) {
        doc.text(`Matriz: ${item.matrixName}`, 135, y);
      }
      y += 6;
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(14, y, pageWidth - 14, y);
    y += 4;
  });

  // Totals Section
  y += 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, y, pageWidth - 124, 38, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', 114, y + 7);
  doc.text(formatCurrencyBRL(order.totalPrice), pageWidth - 18, y + 7, { align: 'right' });

  if (order.discount > 0) {
    doc.text('Desconto:', 114, y + 13);
    doc.text(`- ${formatCurrencyBRL(order.discount)}`, pageWidth - 18, y + 13, { align: 'right' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Valor Total:', 114, y + 21);
  doc.text(formatCurrencyBRL(order.finalPrice), pageWidth - 18, y + 21, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Pago: ${formatCurrencyBRL(order.amountPaid)}`, 114, y + 28);
  doc.setTextColor(order.pendingAmount > 0 ? 185 : 22, order.pendingAmount > 0 ? 28 : 101, order.pendingAmount > 0 ? 28 : 52);
  doc.text(`Restante: ${formatCurrencyBRL(order.pendingAmount)}`, pageWidth - 18, y + 28, { align: 'right' });

  // Notes Box
  if (order.clientNotes || order.internalNotes) {
    y += 44;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('OBSERVAÇÕES E INSTRUÇÕES:', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    const noteText = order.clientNotes || order.internalNotes || '';
    const lines = doc.splitTextToSize(noteText, pageWidth - 28);
    doc.text(lines, 14, y);
  }

  // Footer / Terms
  const footerY = 270;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Este documento é gerado eletronicamente pelo BordadoGestão.', 14, footerY);
  doc.text('Garantia de acabamento limpo e linhas poliéster de alto brilho.', 14, footerY + 4);
  doc.text(`Página 1 de 1`, pageWidth - 14, footerY, { align: 'right' });

  // Save the PDF
  const filename = `${type}_${order.trackingCode}.pdf`;
  doc.save(filename);
}

export function exportFinancialPdf(
  transactions: FinancialTransaction[],
  monthYear: string,
  totalIncome: number,
  totalExpense: number,
  netProfit: number
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header with Neri Bordados Teal & Pink Branding
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setFillColor(219, 39, 119); // Pink-600 accent stripe
  doc.rect(0, 25, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('NERI BORDADOS • RELATÓRIO FINANCEIRO MENSAL', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(204, 251, 241); // Teal-100
  doc.text(`Competência: ${monthYear} | Gestão de Lucro Real por Peça & Depreciação Brother`, 14, 18);

  y = 38;
  // Metric Cards
  const cardWidth = (pageWidth - 36) / 3;

  // Income Card
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, y, cardWidth, 22, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('RECEITA BRUTA', 18, y + 6);
  doc.setFontSize(12);
  doc.text(formatCurrencyBRL(totalIncome), 18, y + 16);

  // Expense Card
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14 + cardWidth + 4, y, cardWidth, 22, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('DESPESAS / INSUMOS', 18 + cardWidth + 4, y + 6);
  doc.setFontSize(12);
  doc.text(formatCurrencyBRL(totalExpense), 18 + cardWidth + 4, y + 16);

  // Net Profit Card
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14 + (cardWidth + 4) * 2, y, cardWidth, 22, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 105, 161);
  doc.text('LUCRO LÍQUIDO REAL', 18 + (cardWidth + 4) * 2, y + 6);
  doc.setFontSize(12);
  doc.text(formatCurrencyBRL(netProfit), 18 + (cardWidth + 4) * 2, y + 16);

  y += 32;

  // Transactions Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('DATA', 16, y + 5.5);
  doc.text('CATEGORIA', 38, y + 5.5);
  doc.text('DESCRIÇÃO DO LANÇAMENTO', 75, y + 5.5);
  doc.text('VALOR', pageWidth - 16, y + 5.5, { align: 'right' });

  y += 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  transactions.forEach((tx) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(71, 85, 105);
    doc.text(tx.date, 16, y);
    doc.text(tx.category, 38, y);

    const descLines = doc.splitTextToSize(tx.description, 75);
    doc.text(descLines, 75, y);

    const isIncome = tx.type === 'receita';
    doc.setTextColor(isIncome ? 22 : 185, isIncome ? 101 : 28, isIncome ? 52 : 28);
    const sign = isIncome ? '+' : '-';
    doc.text(`${sign} ${formatCurrencyBRL(tx.amount)}`, pageWidth - 16, y, { align: 'right' });

    y += Math.max(6, descLines.length * 4.5);
  });

  doc.save(`relatorio_financeiro_${monthYear.replace('/', '_')}.pdf`);
}
