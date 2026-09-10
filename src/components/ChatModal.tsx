import { useState, useRef, useEffect, FormEvent } from 'react';
import { X, Send, User, Bot, Clock, MessageSquare, Image, ExternalLink } from 'lucide-react';
import { ChatMessage, Order } from '../types';

interface ChatModalProps {
  order: Order;
  messages: ChatMessage[];
  onSendMessage: (orderId: string, text: string, sender: 'atelier' | 'client', senderName: string) => void;
  onClose: () => void;
  currentUserRole?: 'atelier' | 'client';
}

export function ChatModal({
  order,
  messages,
  onSendMessage,
  onClose,
  currentUserRole = 'atelier',
}: ChatModalProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = currentUserRole === 'atelier' ? 'Ateliê Bordados' : order.clientName;
    onSendMessage(order.id, inputText.trim(), currentUserRole, senderName);
    setInputText('');
  };

  const quickReplies = currentUserRole === 'atelier' ? [
    'Seu pedido está na máquina Brother sendo bordado agora! 🪡',
    'Bordado finalizado e impecável! Já está pronto para retirada. ✨',
    'Olá! Qual o nome exato e a cor de linha que você prefere?',
    'Recebemos sua inspiração e a matriz já está sendo preparada.',
  ] : [
    'Qual a previsão de entrega do meu bordado?',
    'Gostaria de saber se vocês receberam a foto da minha inspiração.',
    'Aprovado o orçamento! Como faço o pagamento do sinal de 50%?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[580px] max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{order.clientName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-rose-200">
                  {order.trackingCode}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {currentUserRole === 'atelier'
                  ? `Comunicação Direta com o Cliente (${order.clientPhone})`
                  : 'Fale com a equipe do Ateliê de Bordados'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Quick Context Bar */}
        <div className="bg-rose-50/70 border-b border-rose-100 px-4 py-2 flex items-center justify-between text-xs text-rose-900">
          <span className="truncate max-w-[300px]">
            <strong>Peça:</strong> {order.items[0]?.description || 'Bordado Personalizado'}
          </span>
          <span className="font-semibold bg-rose-200/80 px-2 py-0.5 rounded text-[11px] uppercase">
            {order.status.replace('_', ' ')}
          </span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Nenhuma mensagem ainda. Inicie a conversa abaixo!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === currentUserRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                    <span className="font-medium text-slate-600">{msg.senderName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {msg.timestamp}
                    </span>
                  </div>

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                      isMe
                        ? 'bg-rose-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.attachmentUrl && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        {msg.attachmentType === 'image' ? (
                          <img
                            src={msg.attachmentUrl}
                            alt="Anexo"
                            className="rounded-lg max-h-40 object-cover border border-white/20"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] underline flex items-center gap-1 text-white hover:text-rose-100"
                          >
                            <ExternalLink className="w-3 h-3" /> Ver link de inspiração
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Responses */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">Sugestões:</span>
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(reply)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            id="input-chat-message"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              currentUserRole === 'atelier'
                ? 'Digite uma mensagem para o cliente...'
                : 'Tire dúvidas ou envie observações...'
            }
            className="flex-1 text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
          />
          <button
            id="btn-chat-send"
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
