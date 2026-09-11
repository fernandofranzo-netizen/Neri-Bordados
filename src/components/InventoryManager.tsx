import { useState, FormEvent } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Scissors, 
  Layers, 
  Sparkles, 
  PlusCircle, 
  MinusCircle, 
  Trash2, 
  DollarSign, 
  Check,
  Heart
} from 'lucide-react';
import { MaterialItem, MaterialCategory } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';
import { NeriLogo } from './NeriLogo';

interface InventoryManagerProps {
  materials: MaterialItem[];
  onAddMaterial: (material: MaterialItem) => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onDeleteMaterial: (id: string) => void;
}

export function InventoryManager({
  materials,
  onAddMaterial,
  onUpdateStock,
  onDeleteMaterial,
}: InventoryManagerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new material
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('linha_superior');
  const [brand, setBrand] = useState('Polybrilho');
  const [colorCode, setColorCode] = useState('');
  const [colorHex, setColorHex] = useState('#E11D48');
  const [unit, setUnit] = useState('Cone 4000m');
  const [currentStock, setCurrentStock] = useState(3);
  const [minStock, setMinStock] = useState(1);
  const [costPerUnit, setCostPerUnit] = useState(18.5);
  const [location, setLocation] = useState('Gaveta 1');

  const filteredMaterials = materials.filter((m) => {
    const matchesCategory = activeCategory === 'todas' || m.category === activeCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.colorCode && m.colorCode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalInventoryValue = materials.reduce(
    (sum, m) => sum + m.currentStock * m.costPerUnit,
    0
  );

  const lowStockCount = materials.filter((m) => m.currentStock <= m.minStock).length;

  const handleSaveMaterial = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      name: name.trim(),
      category,
      brand: brand.trim(),
      colorCode: colorCode.trim() || undefined,
      colorHex: category === 'linha_superior' ? colorHex : undefined,
      unit: unit.trim(),
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      costPerUnit: Number(costPerUnit),
      location: location.trim() || undefined,
      lastRestocked: new Date().toISOString().split('T')[0],
    };

    onAddMaterial(newMat);
    setShowAddModal(false);
    // Reset
    setName('');
    setColorCode('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-cyan-100 shadow-xs">
        <div className="flex items-center gap-3">
          <NeriLogo size="md" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
              Estoque de Materiais & Insumos • Neri Bordados
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Controle de linhas de bordado Brother, entretelas, agulhas e peças lisas
            </p>
          </div>
        </div>

        <button
          id="btn-add-material"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Insumo / Linha
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Itens Cadastrados</span>
            <div className="text-xl font-bold text-slate-900 font-display">
              {materials.length} itens
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Patrimônio em Estoque</span>
            <div className="text-xl font-bold text-emerald-700 font-display">
              {formatCurrencyBRL(totalInventoryValue)}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Materiais em Nível Crítico</span>
            <div className="text-xl font-bold text-amber-700 font-display">
              {lowStockCount} alertas
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, marca ou código de cor..."
            className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveCategory('todas')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeCategory === 'todas'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({materials.length})
          </button>
          <button
            onClick={() => setActiveCategory('linha_superior')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeCategory === 'linha_superior'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Linhas Superiores
          </button>
          <button
            onClick={() => setActiveCategory('entretela')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeCategory === 'entretela'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Entretelas
          </button>
          <button
            onClick={() => setActiveCategory('peca_lisa')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeCategory === 'peca_lisa'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Peças / Toalhas
          </button>
          <button
            onClick={() => setActiveCategory('agulha')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeCategory === 'agulha'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Agulhas Brother
          </button>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((mat) => {
          const isLow = mat.currentStock <= mat.minStock;
          return (
            <div
              key={mat.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3 relative hover:border-slate-300 transition-all ${
                isLow ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {mat.colorHex ? (
                    <div
                      className="w-7 h-7 rounded-full shadow-inner border border-slate-300 shrink-0"
                      style={{ backgroundColor: mat.colorHex }}
                      title={`Cor: ${mat.colorCode || ''}`}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{mat.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {mat.brand} {mat.colorCode ? `• Cor #${mat.colorCode}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remover o material ${mat.name}?`)) {
                      onDeleteMaterial(mat.id);
                    }
                  }}
                  className="text-slate-300 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stock controls */}
              <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between border border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Estoque Atual
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-base font-black font-mono ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                      {mat.currentStock}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{mat.unit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateStock(mat.id, Math.max(0, mat.currentStock - 1))}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Diminuir"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdateStock(mat.id, mat.currentStock + 1)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Adicionar"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Details */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Custo: <strong>{formatCurrencyBRL(mat.costPerUnit)}</strong></span>
                {mat.location && <span>Local: {mat.location}</span>}
              </div>

              {isLow && (
                <div className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Estoque abaixo do mínimo ({mat.minStock} {mat.unit})
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Cadastrar Novo Insumo de Bordado</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Insumo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Linha Poliéster Dourado Champanhe"
                  className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="linha_superior">Linha Superior (Polyester/Viscose)</option>
                    <option value="linha_bobina">Linha de Bobina</option>
                    <option value="entretela">Entretela (Rasgável/Solúvel)</option>
                    <option value="peca_lisa">Peça Lisa (Toalha/Fralda)</option>
                    <option value="agulha">Agulha Brother</option>
                    <option value="acessorio">Acessório / Embalagem</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marca / Fabricante</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ex: Polybrilho, Lumina, Döhler"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {category === 'linha_superior' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código da Cor</label>
                    <input
                      type="text"
                      value={colorCode}
                      onChange={(e) => setColorCode(e.target.value)}
                      placeholder="Ex: 2145"
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cor Hexadecimal</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="w-10 h-8 p-0 rounded border cursor-pointer"
                      />
                      <span className="font-mono text-[11px] text-slate-600">{colorHex}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unidade</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Cone 4000m, Metro, Un"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qtd Atual</label>
                  <input
                    type="number"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custo por Unidade (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Localização no Ateliê</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Gaveta 1, Prateleira B"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-medium text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-sm"
                >
                  Salvar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
