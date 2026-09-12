import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Shield,
  Calculator,
  Package,
  Check,
  Smartphone,
  Layers,
  X,
  ExternalLink,
  Award,
  Calendar,
  DollarSign,
  Heart,
  Palette,
  MessageCircle,
} from 'lucide-react';
import { NeriLogo } from './NeriLogo';

export interface ProjectPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo: (destination: {
    viewMode?: 'admin' | 'client';
    tab?: 'dashboard' | 'orders' | 'calculator' | 'inventory' | 'calendar' | 'financial' | 'products';
    openAuth?: boolean;
  }) => void;
}

interface Slide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  tagline: string;
  narrative: string;
  highlights: string[];
  icon: typeof Sparkles;
  actionText: string;
  actionPayload: {
    viewMode?: 'admin' | 'client';
    tab?: 'dashboard' | 'orders' | 'calculator' | 'inventory' | 'calendar' | 'financial' | 'products';
    openAuth?: boolean;
  };
  stats: { label: string; value: string }[];
}

const SLIDES: Slide[] = [
  {
    id: 'intro',
    badge: 'Cena 1 de 6 • Identidade & Propósito',
    badgeColor: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
    title: 'Ateliê Neri Bordados Computadorizados',
    tagline: 'Plataforma integrada de ponta a ponta: do primeiro orçamento à entrega final da peça bordada.',
    narrative:
      'Bem-vindo à apresentação do sistema do Ateliê Neri Bordados! Desenvolvido com identidade artesanal refinada, o sistema une o encanto do trabalho manual com a precisão industrial das máquinas computadorizadas Brother.',
    highlights: [
      'Duplo ambiente integrado: Portal do Cliente aberto e Painel do Ateliê protegido',
      'Design responsivo para celulares, tablets e telas de alta resolução',
      'Canais integrados: Chave Pix oficial, redes sociais e balcão do ateliê',
    ],
    icon: Sparkles,
    actionText: 'Ver Portal do Cliente',
    actionPayload: { viewMode: 'client' },
    stats: [
      { label: 'Máquinas Compatíveis', value: 'Brother PE810L / BP2150' },
      { label: 'Precisão de Pontos', value: '1.000 pts' },
      { label: 'Ambientes', value: 'Cliente & Ateliê' },
    ],
  },
  {
    id: 'client-portal',
    badge: 'Cena 2 de 6 • Portal do Cliente',
    badgeColor: 'bg-pink-500/20 text-pink-200 border-pink-400/30',
    title: 'Acompanhamento Transparente & Solicitação de Orçamento',
    tagline: 'O cliente consulta o status do bordado e envia fotos de inspiração sem complicação.',
    narrative:
      'No Portal do Cliente, os clientes acompanham o progresso de sua encomenda digitando o código de rastreio ou número de telefone. Também podem solicitar orçamentos detalhados anexando fotos e referências de matrizes.',
    highlights: [
      'Rastreamento inteligente por código BRD ou dígitos do celular com DDD',
      'Upload e anexação de fotos de inspiração para matrizes de bordado',
      'Chat direto por pedido para alinhamento de nomes, cores de linha e tecidos',
    ],
    icon: Heart,
    actionText: 'Explorar Portal do Cliente',
    actionPayload: { viewMode: 'client' },
    stats: [
      { label: 'Acesso Cliente', value: '100% Sem Senha' },
      { label: 'Validade Orçamentos', value: '30 Dias' },
      { label: 'Notificações', value: 'Tempo Real' },
    ],
  },
  {
    id: 'calculator',
    badge: 'Cena 3 de 6 • Engenharia de Custos',
    badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    title: 'Calculadora Técnica de Bordados Brother',
    tagline: 'Precificação exata baseada em pontos, trocas de cores de fio e insumos.',
    narrative:
      'A precificação elimina qualquer margem de erro ou prejuízo. O cálculo considera velocidade da máquina por minuto, consumo métrico de linhas, entretelas hidrossolúveis ou rasgáveis, trocas de cor e tempo de mão de obra.',
    highlights: [
      'Fórmula auditada para custo por 1.000 pontos de bordado',
      'Cálculo de margem de lucro operacional e valor mínimo por peça',
      'Simulação instantânea com presets para nomes, monogramas e logos',
    ],
    icon: Calculator,
    actionText: 'Abrir Calculadora Brother',
    actionPayload: { viewMode: 'admin', tab: 'calculator' },
    stats: [
      { label: 'Velocidade Média', value: '650 a 850 PPM' },
      { label: 'Insumos Inclusos', value: 'Linha + Entretela' },
      { label: 'Cálculo de Margem', value: 'Automático' },
    ],
  },
  {
    id: 'finance-rules',
    badge: 'Cena 4 de 6 • Gestão Financeira',
    badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    title: 'Regras de Sinal Pix & Pedidos Urgentes',
    tagline: 'Garantia de recebimento com regras claras de 50% de sinal ou 100% para urgência.',
    narrative:
      'A política financeira do ateliê é automatizada: orçamentos têm validade de 30 dias. A aprovação regular requer 50% de sinal via Pix. Pedidos urgentes exigem 100% do pagamento antecipado para liberação da matriz.',
    highlights: [
      'Validação automática de sinal de 50% e quitação dos 50% restantes na entrega',
      'Regra de Pedido Urgente com quitação prévia integral de 100%',
      'Cópia rápida de chave Pix oficial (contato@neribordados.com.br)',
    ],
    icon: DollarSign,
    actionText: 'Ver Módulo Financeiro',
    actionPayload: { viewMode: 'admin', tab: 'financial' },
    stats: [
      { label: 'Sinal Regular', value: '50% na Aprovação' },
      { label: 'Taxa de Urgência', value: '100% Antecipado' },
      { label: 'Chave Pix', value: 'Cópia c/ 1 Clique' },
    ],
  },
  {
    id: 'security-sms',
    badge: 'Cena 5 de 6 • Segurança & Acesso',
    badgeColor: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
    title: 'Acesso Restrito & Validação de Segurança',
    tagline: 'O painel administrativo é protegido por senha, com validação confidencial do CPF do titular.',
    narrative:
      'Para proteger dados operacionais e financeiros, o Ateliê conta com autenticação restrita. Em caso de necessidade de consulta ou recuperação de senha, o sistema valida a titularidade por meio do CPF cadastrado, mantendo os dados protegidos e em sigilo.',
    highlights: [
      'Proteção por senha no painel administrativo do Ateliê',
      'Validação de segurança confidencial via CPF do titular',
      'Liberação imediata no sistema com visualização e cópia segura',
    ],
    icon: Shield,
    actionText: 'Testar Segurança do Painel',
    actionPayload: { openAuth: true },
    stats: [
      { label: 'Validação', value: 'CPF do Titular' },
      { label: 'Privacidade', value: 'Dados Sigilosos' },
      { label: 'Camada de Proteção', value: 'Acesso Restrito' },
    ],
  },
  {
    id: 'production-workflow',
    badge: 'Cena 6 de 6 • Produção & Entregas',
    badgeColor: 'bg-teal-500/20 text-teal-200 border-teal-400/30',
    title: 'Linha do Tempo em 5 Etapas & Gestão de Prazos',
    tagline: 'Controle total do fluxo: Orçamento, Aprovação, Máquina, Acabamento e Entrega.',
    narrative:
      'No painel de produção, cada pedido avança de forma visual pelas 5 etapas. Prazos de entrega são monitorados com alertas coloridos e geração imediata de Ordens de Serviço (OS) e recibos em PDF.',
    highlights: [
      'Kanban de produção e acompanhamento de status em tempo real',
      'Alertas preventivos para pedidos próximos da data de entrega',
      'Impressão e download de Ordens de Serviço e Orçamentos comerciais em PDF',
    ],
    icon: Package,
    actionText: 'Ver Painel de Produção',
    actionPayload: { viewMode: 'admin', tab: 'orders' },
    stats: [
      { label: 'Etapas de Produção', value: '5 Fases' },
      { label: 'Exportação', value: 'PDF / Impressão' },
      { label: 'Status Máquina', value: 'Bordando em Tempo Real' },
    ],
  },
];

export function ProjectPresentationModal({
  isOpen,
  onClose,
  onNavigateTo,
}: ProjectPresentationModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [voiceNarration, setVoiceNarration] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION_MS = 8000;
  const progressIntervalRef = useRef<number | null>(null);

  const slide = SLIDES[currentSlideIndex];

  // Speech synthesis narrator
  const speakCurrentSlide = (text: string) => {
    if (!voiceNarration || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Try to find a PT-BR voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang.startsWith('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isOpen && voiceNarration) {
      speakCurrentSlide(slide.narrative);
    }
  }, [currentSlideIndex, voiceNarration, isOpen]);

  // Clean up speech on close
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  // Timer loop for auto-advancing slides
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const stepTime = 100;
    const increment = 100 / (SLIDE_DURATION_MS / stepTime);

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlideIndex((oldIdx) => (oldIdx + 1) % SLIDES.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepTime);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isOpen, isPlaying, currentSlideIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleRestart = () => {
    setProgress(0);
    setCurrentSlideIndex(0);
    setIsPlaying(true);
  };

  const handleToggleVoice = () => {
    const nextVoice = !voiceNarration;
    setVoiceNarration(nextVoice);
    if (!nextVoice && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleAction = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    onClose();
    onNavigateTo(slide.actionPayload);
  };

  const SlideIcon = slide.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-cyan-800/50 rounded-3xl max-w-3xl w-full text-white overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Video Cinema Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 px-5 py-3.5 border-b border-cyan-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Play className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white font-display flex items-center gap-1.5">
                Vídeo Tour • Apresentação do Sistema
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h3>
              <p className="text-[11px] text-cyan-200/70">Ateliê Neri Bordados Computadorizados</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Narrator Toggle */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                voiceNarration
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={voiceNarration ? 'Desativar narração em voz' : 'Ativar narração em voz (Áudio)'}
            >
              {voiceNarration ? <Volume2 className="w-3.5 h-3.5 text-white" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{voiceNarration ? 'Voz Ligada' : 'Áudio Mudo'}</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar apresentação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Timeline Segments */}
        <div className="bg-slate-950 px-5 pt-3 pb-1 flex gap-1.5">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setProgress(0);
                setCurrentSlideIndex(idx);
              }}
              className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer relative"
              title={`Ir para Cena ${idx + 1}: ${s.title}`}
            >
              {idx < currentSlideIndex && <div className="h-full bg-cyan-400 w-full" />}
              {idx === currentSlideIndex && (
                <div
                  className="h-full bg-cyan-400 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Slide Stage Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          {/* Badge & Stage Number */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${slide.badgeColor}`}>
              {slide.badge}
            </span>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span>{currentSlideIndex + 1}</span>
              <span>/</span>
              <span>{SLIDES.length}</span>
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shrink-0 mt-1">
                <SlideIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
                  {slide.title}
                </h2>
                <p className="text-sm text-cyan-200/85 mt-1 font-medium leading-relaxed">
                  {slide.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Narrative Speech Script Box */}
          <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-2 shadow-inner">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Roteiro Explicativo da Demonstração:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              "{slide.narrative}"
            </p>
          </div>

          {/* Key Highlights */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Diferenciais Implementados:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {slide.highlights.map((h, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-start gap-2 text-xs text-slate-200"
                >
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Stats Pill Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800">
            {slide.stats.map((stat, i) => (
              <div key={i} className="text-center p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold">{stat.label}</div>
                <div className="text-xs sm:text-sm font-extrabold text-cyan-300 font-mono mt-0.5">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Player Controller */}
        <div className="bg-slate-950 px-5 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Media Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reiniciar apresentação do início"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Cena anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              title={isPlaying ? 'Pausar reprodução' : 'Continuar reprodução'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Reproduzir</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Próxima cena"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Live CTA */}
          <button
            type="button"
            onClick={handleAction}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 group"
          >
            <span>{slide.actionText}</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
