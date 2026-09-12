import { Bell, Calendar, Package, DollarSign, Calculator, Layers, UserCheck, Lock, LogOut, Shield, Database, Play } from 'lucide-react';
import { NeriLogo } from './NeriLogo';

interface NavbarProps {
  currentTab: 'dashboard' | 'orders' | 'calculator' | 'inventory' | 'calendar' | 'financial' | 'products';
  setCurrentTab: (tab: 'dashboard' | 'orders' | 'calculator' | 'inventory' | 'calendar' | 'financial' | 'products') => void;
  viewMode: 'admin' | 'client';
  setViewMode: (mode: 'admin' | 'client') => void;
  isAtelierAuthenticated: boolean;
  onRequestAtelierLogin: () => void;
  onLogoutAtelier: () => void;
  onOpenNewOrder?: () => void;
  notificationCount: number;
  onOpenNotifications: () => void;
  urgentOrdersCount: number;
  pendingPaymentsCount: number;
  onOpenPresentationTour?: () => void;
}

export function Navbar({
  currentTab,
  setCurrentTab,
  viewMode,
  setViewMode,
  isAtelierAuthenticated,
  onRequestAtelierLogin,
  onLogoutAtelier,
  onOpenNewOrder,
  notificationCount,
  onOpenNotifications,
  urgentOrdersCount,
  pendingPaymentsCount,
  onOpenPresentationTour,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cyan-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <NeriLogo
              size="sm"
              showText={true}
              subtitle={isAtelierAuthenticated ? "Gestão & Produção" : "Portal do Cliente"}
            />
          </div>

          {/* Center Navigation for Admin Mode (Only when logged into Ateliê and viewing admin) */}
          {isAtelierAuthenticated && viewMode === 'admin' && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
              <button
                id="nav-tab-dashboard"
                onClick={() => setCurrentTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'dashboard'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-cyan-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Painel Geral
              </button>

              <button
                id="nav-tab-orders"
                onClick={() => setCurrentTab('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'orders'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-cyan-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Pedidos & Orçamentos
              </button>

              <button
                id="nav-tab-calculator"
                onClick={() => setCurrentTab('calculator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'calculator'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-cyan-800'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                Calculadora Brother
              </button>

              <button
                id="nav-tab-inventory"
                onClick={() => setCurrentTab('inventory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'inventory'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-cyan-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Estoque
              </button>

              <button
                id="nav-tab-calendar"
                onClick={() => setCurrentTab('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'calendar'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-cyan-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Prazos
                {urgentOrdersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                )}
              </button>

              <button
                id="nav-tab-financial"
                onClick={() => setCurrentTab('financial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'financial'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-cyan-800'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Financeiro & Lucro
              </button>

              <button
                id="nav-tab-products"
                onClick={() => setCurrentTab('products')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'products'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-800'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Produtos (Supabase)
              </button>
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Project Presentation Tour Button */}
            {onOpenPresentationTour && (
              <button
                id="btn-navbar-tour"
                onClick={onOpenPresentationTour}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all group"
                title="Apresentação em Vídeo / Tour Guiado do Sistema"
              >
                <Play className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
                <span className="hidden xs:inline">Apresentação</span>
              </button>
            )}

            {/* If authenticated as Atelier: Show BOTH environments (Ateliê and Portal Cliente) */}
            {isAtelierAuthenticated ? (
              <>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    id="switch-admin-mode"
                    onClick={() => setViewMode('admin')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      viewMode === 'admin'
                        ? 'bg-cyan-700 text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:text-cyan-800'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Ateliê</span>
                  </button>

                  <button
                    id="switch-client-mode"
                    onClick={() => setViewMode('client')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      viewMode === 'client'
                        ? 'bg-pink-600 text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:text-pink-600'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Portal Cliente</span>
                  </button>
                </div>

                {/* Notifications Bell */}
                <button
                  id="btn-notifications"
                  onClick={onOpenNotifications}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-cyan-800 hover:bg-cyan-50 transition-colors"
                  title="Notificações e Alertas"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-pink-600 rounded-full ring-2 ring-white">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Lock / Logout Atelier Button */}
                <button
                  id="btn-logout-atelier"
                  onClick={onLogoutAtelier}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Bloquear Ateliê com Senha"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* Unauthenticated Client View: Only see Portal Cliente, with discreet protected entrance for Atelier */
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <UserCheck className="w-3.5 h-3.5 text-pink-600" />
                  Ambiente do Cliente
                </span>

                <button
                  id="btn-open-atelier-login"
                  onClick={onRequestAtelierLogin}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                  title="Acesso com senha da administração do ateliê"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Acesso Ateliê</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile secondary tab bar (Only when in Admin and authenticated) */}
        {isAtelierAuthenticated && viewMode === 'admin' && (
          <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-cyan-100 no-scrollbar text-xs">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Geral
            </button>
            <button
              onClick={() => setCurrentTab('orders')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                currentTab === 'orders'
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setCurrentTab('calculator')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                currentTab === 'calculator'
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Calculadora
            </button>
            <button
              onClick={() => setCurrentTab('inventory')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                currentTab === 'inventory'
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Estoque
            </button>
            <button
              onClick={() => setCurrentTab('calendar')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                currentTab === 'calendar'
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Prazos
            </button>
            <button
              onClick={() => setCurrentTab('financial')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                currentTab === 'financial'
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Financeiro
            </button>
            <button
              onClick={() => setCurrentTab('products')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                currentTab === 'products'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Produtos (Supabase)
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
