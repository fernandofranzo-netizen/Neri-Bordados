import { Order } from '../types';
import { formatCurrencyBRL } from './calculator';

export const ATELIER_PIX_KEY = 'contato@neribordados.com.br';
export const ATELIER_PHONE_DISPLAY = '(11) 98765-4321';

/**
 * Calcula data limite de validade de 30 dias para orçamentos
 */
export function calculateBudgetValidity(createdAt?: string): { validUntilDate: string; daysRemaining: number } {
  const baseDate = createdAt ? new Date(createdAt + 'T00:00:00') : new Date();
  const validUntil = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const today = new Date();
  const diffTime = validUntil.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    validUntilDate: validUntil.toISOString().split('T')[0],
    daysRemaining,
  };
}

/**
 * Retorna as regras financeiras de aprovação de orçamento
 */
export function getBudgetApprovalCriteria(finalPrice: number, isUrgent: boolean = false) {
  const requiredPercent = isUrgent ? 100 : 50;
  const requiredAmount = isUrgent ? finalPrice : Math.round((finalPrice * 0.5) * 100) / 100;
  const stage5PendingAmount = isUrgent ? 0 : Math.max(0, finalPrice - requiredAmount);

  return {
    isUrgent,
    requiredPercent,
    requiredAmount,
    stage5PendingAmount,
    description: isUrgent
      ? 'Aprovação mediante comprovação do pagamento de 100% do valor antecipadamente (Pedido Urgente).'
      : 'Aprovação mediante comprovação do pagamento de 50% do valor (sinal regular).',
    stage5Rule: isUrgent
      ? 'Na Etapa 5, como o valor de 100% foi pago antecipadamente, o cliente solicita apenas a coleta.'
      : 'Na Etapa 5, o cliente deve providenciar a coleta após o pagamento do restante do valor aprovado.',
  };
}

/**
 * Gera a mensagem automática oficial de WhatsApp para a ETAPA 5 (Produto Pronto / Retirada)
 * Conforme especificado pelo usuário:
 * - Se regular: informa que o produto está pronto e deve providenciar a coleta após o pagamento do restante do valor aprovado.
 * - Se urgente: informa que o produto está pronto e como pagou 100% antecipado, deverá solicitar apenas a coleta.
 */
export function buildStage5WhatsAppMessage(order: Order, customPixKey: string = ATELIER_PIX_KEY): string {
  const itemDesc = order.items[0]?.description || 'Bordado Computadorizado';
  const isUrgent = !!order.isUrgent;

  if (isUrgent) {
    // Pedido Urgente: 100% já pago antecipadamente -> solicitar apenas a coleta
    return (
      `Olá *${order.clientName}*! Tudo bem? 🚀✨\n\n` +
      `Aqui é da equipe do *Ateliê Neri Bordados*!\n\n` +
      `Temos uma ótima notícia: o seu pedido *URGENTE #${order.trackingCode}* (${itemDesc}) está **100% PRONTO, inspecionado e embalado**! 🎉🧵\n\n` +
      `⚡ *Status Financeiro & Aprovação Expressa:*\n` +
      `• Critério: *Pedido Urgente*\n` +
      `• Valor do Orçamento: *${formatCurrencyBRL(order.finalPrice)}*\n` +
      `• Pagamento Antecipado: *100% Quitado (${formatCurrencyBRL(order.amountPaid || order.finalPrice)})*\n` +
      `• Saldo Pendente: *R$ 0,00 (Totalmente Pago)*\n\n` +
      `📦 *Como seu pedido teve pagamento de 100% antecipado, seu saldo está totalmente quitado!*\n` +
      `Você já pode *solicitar apenas a coleta* ou retirar diretamente aqui no nosso balcão.\n\n` +
      `Se desejar envio por portador ou aplicativo (Uber Entregas / 99 / Motoboy), por favor nos avise por aqui para prepararmos o pacote para saída! 🛵💨\n\n` +
      `Agradecemos a confiança em nosso trabalho!\n` +
      `*Ateliê Neri Bordados Computadorizados*`
    );
  }

  // Pedido Regular: 50% de sinal pago -> providenciar coleta após pagamento do restante
  const remaining = order.pendingAmount > 0 
    ? order.pendingAmount 
    : Math.max(0, order.finalPrice - order.amountPaid);

  return (
    `Olá *${order.clientName}*! Tudo bem? ✨\n\n` +
    `Aqui é da equipe do *Ateliê Neri Bordados*!\n\n` +
    `Temos uma ótima notícia: o seu bordado computadorizado do pedido *#${order.trackingCode}* (${itemDesc}) está **PRONTINHO** e com acabamento impecável! 🎉🧵\n\n` +
    `📋 *Resumo Financeiro do Orçamento Aprovado:*\n` +
    `• Valor Total do Orçamento: *${formatCurrencyBRL(order.finalPrice)}*\n` +
    `• Sinal Comprovado (50%): *${formatCurrencyBRL(order.amountPaid)}*\n` +
    `• Saldo Restante para Quitação: *${formatCurrencyBRL(remaining)}*\n\n` +
    `💳 *Instruções para Retirada / Coleta:*\n` +
    `Conforme as condições do orçamento, seu produto está pronto e você deve **providenciar a coleta após o pagamento do restante do valor aprovado** (${formatCurrencyBRL(remaining)}).\n\n` +
    `🔑 *Chave PIX do Ateliê:*\n` +
    `*${customPixKey}* (Neri Bordados Computadorizados)\n\n` +
    `Assim que realizar o pagamento do saldo restante, por favor nos envie o comprovante por aqui para liberarmos imediatamente a sua encomenda no balcão ou para o serviço de coleta/entrega! 🛍️\n\n` +
    `Muito obrigado pela preferência!\n` +
    `*Ateliê Neri Bordados Computadorizados*`
  );
}

/**
 * Abre a URL oficial do WhatsApp com a mensagem pré-formatada
 */
export function openWhatsAppNotification(phone: string, message: string): void {
  const cleanPhone = phone.replace(/\D/g, '');
  const targetPhone = cleanPhone.length >= 10 ? `55${cleanPhone}` : '';
  
  const encodedText = encodeURIComponent(message);
  const url = targetPhone 
    ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;
  
  window.open(url, '_blank');
}
