import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { OrdersManager } from './components/OrdersManager';
import { BrotherCalculator } from './components/BrotherCalculator';
import { InventoryManager } from './components/InventoryManager';
import { DeliveryCalendar } from './components/DeliveryCalendar';
import { FinancialReports } from './components/FinancialReports';
import { ClientPortal } from './components/ClientPortal';
import { OrderFormModal } from './components/OrderFormModal';
import { ChatModal } from './components/ChatModal';
import { NotificationCenter } from './components/NotificationCenter';
import { PdfDocumentModal } from './components/PdfDocumentModal';
import { AtelierAuthModal } from './components/AtelierAuthModal';
import { SupabaseProductsManager } from './components/SupabaseProductsManager';

import { 
  Order, 
  MaterialItem, 
  FinancialTransaction, 
  ChatMessage, 
  OrderStatus 
} from './types';

import { 
  INITIAL_MATERIALS, 
  INITIAL_ORDERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_CHATS 
} from './data/mockData';

export default function App() {
  // Persistence with localStorage
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('bordado_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem('bordado_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('bordado_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('bordado_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bordado_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bordado_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('bordado_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bordado_chats', JSON.stringify(chats));
  }, [chats]);

  // Authentication & Environment Security State
  const [isAtelierAuthenticated, setIsAtelierAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bordado_atelier_auth') === 'true';
  });

  const [atelierPassword, setAtelierPassword] = useState<string>(() => {
    return localStorage.getItem('bordado_atelier_password') || 'neri2026';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Navigation state: defaults to 'admin' if already authenticated, else 'client'
  const [viewMode, setViewMode] = useState<'admin' | 'client'>(() => {
    const isAuth = localStorage.getItem('bordado_atelier_auth') === 'true';
    return isAuth ? 'admin' : 'client';
  });
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'orders' | 'calculator' | 'inventory' | 'calendar' | 'financial' | 'products'>('dashboard');

  // Authentication Handlers
  const handleRequestAtelierLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAtelierAuthenticated(true);
    localStorage.setItem('bordado_atelier_auth', 'true');
    setViewMode('admin');
  };

  const handleLogoutAtelier = () => {
    setIsAtelierAuthenticated(false);
    localStorage.removeItem('bordado_atelier_auth');
    setViewMode('client');
  };

  const handleUpdatePassword = (newPass: string) => {
    setAtelierPassword(newPass);
    localStorage.setItem('bordado_atelier_password', newPass);
  };

  const handleSetViewMode = (mode: 'admin' | 'client') => {
    if (mode === 'admin' && !isAtelierAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setViewMode(mode);
  };

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfOrder, setPdfOrder] = useState<Order | null>(null);
  const [pdfType, setPdfType] = useState<'orcamento' | 'os' | 'recibo'>('orcamento');

  // Compute unread/urgent notifications count
  const urgentDeliveriesCount = orders.filter(
    (o) => o.status !== 'entregue' && o.status !== 'cancelado' && o.deliveryDate <= '2026-09-12'
  ).length;
  const pendingPaymentsCount = orders.filter((o) => o.pendingAmount > 0 && o.status !== 'cancelado').length;
  const lowStockCount = materials.filter((m) => m.currentStock <= m.minStock).length;
  const totalAlertsCount = urgentDeliveriesCount + pendingPaymentsCount + lowStockCount;

  // Handler: Open Order Modal for New Order
  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  // Handler: Open Order Modal for Editing
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  // Handler: Save (Create or Update) Order
  const handleSaveOrder = (orderToSave: Order) => {
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === orderToSave.id);
      if (exists) {
        return prev.map((o) => (o.id === orderToSave.id ? orderToSave : o));
      }
      return [orderToSave, ...prev];
    });

    // If there is an upfront payment registered, automatically log a financial transaction
    if (orderToSave.amountPaid > 0) {
      const hasTx = transactions.some((t) => t.orderId === orderToSave.id);
      if (!hasTx) {
        const newTx: FinancialTransaction = {
          id: `tr-${Date.now()}`,
          type: 'receita',
          category: 'Sinal de Pedido',
          description: `Sinal Pedido #${orderToSave.trackingCode} (${orderToSave.clientName})`,
          amount: orderToSave.amountPaid,
          date: new Date().toISOString().split('T')[0],
          orderId: orderToSave.id,
          paymentMethod: orderToSave.paymentMethod,
        };
        setTransactions((prev) => [newTx, ...prev]);
      }
    }
    setIsOrderModalOpen(false);
  };

  // Handler: Advance or Change Order Status
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Handler: Delete Order
  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Handler: Create Order directly from Brother Calculator
  const handleCreateOrderFromCalc = (data: {
    description: string;
    stitches: number;
    hoopSize: string;
    colorsCount: number;
    calculatedCost: number;
    priceCharged: number;
    profit: number;
    machineModel: string;
  }) => {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      trackingCode: `BRD-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName: '',
      clientPhone: '',
      status: 'orcamento',
      createdAt: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      brotherMachineModel: data.machineModel,
      items: [
        {
          id: `item-${Date.now()}`,
          description: data.description,
          pieceType: 'Peça Personalizada',
          quantity: 1,
          unitCost: data.calculatedCost,
          unitPriceCharged: data.priceCharged,
          clientProvidedPiece: false,
          pieceCost: 0,
          stitchesCount: data.stitches,
          hoopSize: data.hoopSize,
          threadColorsCount: data.colorsCount,
          calculatedCost: data.calculatedCost,
          priceCharged: data.priceCharged,
        },
      ],
      totalStitches: data.stitches,
      totalCost: data.calculatedCost,
      totalPrice: data.priceCharged,
      discount: 0,
      finalPrice: data.priceCharged,
      profit: data.profit,
      paymentStatus: 'pendente',
      paymentMethod: 'pix',
      amountPaid: 0,
      pendingAmount: data.priceCharged,
      inspirations: [],
    };
    setEditingOrder(newOrder);
    setIsOrderModalOpen(true);
  };

  // Handler: Open Direct Chat Modal
  const handleOpenChat = (order: Order) => {
    setChatOrder(order);
    setIsChatModalOpen(true);
  };

  // Handler: Send Message in Chat
  const handleSendMessage = (
    orderId: string,
    text: string,
    sender: 'atelier' | 'client',
    senderName: string
  ) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      orderId,
      sender,
      senderName,
      text,
      timestamp: timeStr,
    };

    setChats((prev) => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), newMsg],
    }));
  };

  // Handler: Open PDF Preview & Export Modal
  const handleOpenPdf = (order: Order, type: 'orcamento' | 'os' | 'recibo' = 'orcamento') => {
    setPdfOrder(order);
    setPdfType(type);
    setIsPdfModalOpen(true);
  };

  // Handler: Material Stock Updates
  const handleUpdateStock = (materialId: string, newStock: number) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === materialId ? { ...m, currentStock: newStock } : m))
    );
  };

  const handleAddMaterial = (newMat: MaterialItem) => {
    setMaterials((prev) => [newMat, ...prev]);
  };

  const handleDeleteMaterial = (materialId: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
  };

  // Handler: Add Financial Transaction
  const handleAddTransaction = (newTx: FinancialTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Global Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        viewMode={viewMode}
        setViewMode={handleSetViewMode}
        isAtelierAuthenticated={isAtelierAuthenticated}
        onRequestAtelierLogin={handleRequestAtelierLogin}
        onLogoutAtelier={handleLogoutAtelier}
        onOpenNewOrder={handleOpenNewOrder}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        notificationCount={totalAlertsCount}
        urgentOrdersCount={urgentDeliveriesCount}
        pendingPaymentsCount={pendingPaymentsCount}
      />

      {/* Atelier Staff Preview Ribbon when viewing Client Portal */}
      {isAtelierAuthenticated && viewMode === 'client' && (
        <aside aria-label="Sessão do Ateliê" className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white border-b border-cyan-800/60 py-2.5 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="font-bold text-cyan-200">Sessão do Ateliê Ativa:</span>
              <span className="text-slate-300">
                Você está visualizando a experiência e os recursos do Portal do Cliente.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewMode('admin')}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all shadow-xs"
              >
                Voltar à Gestão do Ateliê
              </button>
              <button
                onClick={handleLogoutAtelier}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg transition-colors"
                title="Bloquear sessão administrativa com senha"
              >
                Bloquear 🔒
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {viewMode === 'client' ? (
          /* Client Portal View (Real-time tracking, inspiration upload, direct chat) */
          <ClientPortal
            orders={orders}
            chats={chats}
            onSendMessage={handleSendMessage}
            onSubmitQuoteRequest={handleSaveOrder}
            isAtelierAuthenticated={isAtelierAuthenticated}
            onRequestAtelierLogin={handleRequestAtelierLogin}
            onReturnToAtelier={() => setViewMode('admin')}
          />
        ) : (
          /* Atelier Admin Views */
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                orders={orders}
                materials={materials}
                transactions={transactions}
                onNewOrder={handleOpenNewOrder}
                onSelectOrder={handleEditOrder}
                onOpenCalculator={() => setCurrentTab('calculator')}
                onOpenChat={handleOpenChat}
                onOpenPdf={handleOpenPdf}
                onOpenNotifications={() => setIsNotificationOpen(true)}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'orders' && (
              <OrdersManager
                orders={orders}
                onNewOrder={handleOpenNewOrder}
                onEditOrder={handleEditOrder}
                onOpenChat={handleOpenChat}
                onOpenPdf={handleOpenPdf}
                onUpdateStatus={handleUpdateStatus}
                onDeleteOrder={handleDeleteOrder}
              />
            )}

            {currentTab === 'calculator' && (
              <BrotherCalculator onUseCalculation={handleCreateOrderFromCalc} />
            )}

            {currentTab === 'inventory' && (
              <InventoryManager
                materials={materials}
                onAddMaterial={handleAddMaterial}
                onUpdateStock={handleUpdateStock}
                onDeleteMaterial={handleDeleteMaterial}
              />
            )}

            {currentTab === 'calendar' && (
              <DeliveryCalendar
                orders={orders}
                onSelectOrder={handleEditOrder}
                onOpenChat={handleOpenChat}
              />
            )}

            {currentTab === 'financial' && (
              <FinancialReports
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
              />
            )}

            {currentTab === 'products' && (
              <SupabaseProductsManager />
            )}
          </>
        )}
      </main>

      {/* Order Creation / Edit Modal */}
      {isOrderModalOpen && (
        <OrderFormModal
          orderToEdit={editingOrder}
          onSave={handleSaveOrder}
          onClose={() => setIsOrderModalOpen(false)}
          availableMaterials={materials}
        />
      )}

      {/* Direct Atelier-Client Chat Modal */}
      {isChatModalOpen && chatOrder && (
        <ChatModal
          order={chatOrder}
          messages={chats[chatOrder.id] || []}
          onSendMessage={handleSendMessage}
          onClose={() => setIsChatModalOpen(false)}
          currentUserRole="atelier"
        />
      )}

      {/* Notification Center Modal */}
      {isNotificationOpen && (
        <NotificationCenter
          orders={orders}
          materials={materials}
          onClose={() => setIsNotificationOpen(false)}
          onSelectOrder={(order) => {
            setIsNotificationOpen(false);
            handleEditOrder(order);
          }}
          onOpenChat={(order) => {
            setIsNotificationOpen(false);
            handleOpenChat(order);
          }}
        />
      )}

      {/* PDF Document Preview and Print/Download Modal */}
      {isPdfModalOpen && pdfOrder && (
        <PdfDocumentModal
          order={pdfOrder}
          initialType={pdfType}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}

      {/* Atelier Authentication Modal */}
      <AtelierAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        currentPassword={atelierPassword}
        onUpdatePassword={handleUpdatePassword}
      />
    </div>
  );
}
