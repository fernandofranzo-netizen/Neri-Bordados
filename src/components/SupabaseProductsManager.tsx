import { useState, useEffect, FormEvent } from 'react';
import { 
  Database, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Package, 
  Layers, 
  FileCode, 
  Copy, 
  Check, 
  Search,
  ArrowUpDown
} from 'lucide-react';
import { Produto, buscarProdutos, salvarProduto, excluirProduto, verificarStatusSupabase } from '../lib/supabase';
import { formatCurrencyBRL } from '../utils/calculator';

export function SupabaseProductsManager() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  // Status de conexão
  const [statusConexao, setStatusConexao] = useState<{
    configurado: boolean;
    url: string | null;
    status: 'conectado' | 'pendente_config' | 'erro';
    mensagem: string;
  }>({
    configurado: false,
    url: null,
    status: 'pendente_config',
    mensagem: 'Verificando conexão com Supabase...',
  });

  // Formulário de novo produto
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Toalhas');
  const [preco, setPreco] = useState('45.50');
  const [estoque, setEstoque] = useState('10');
  const [descricao, setDescricao] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filtro
  const [search, setSearch] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  const sqlCode = `-- Executar no SQL Editor do Supabase se necessário:
CREATE TABLE IF NOT EXISTS produtos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Bordado',
  preco NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  estoque INTEGER NOT NULL DEFAULT 0,
  descricao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS para chave pública anon
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura de produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de produtos" ON produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir exclusão de produtos" ON produtos FOR DELETE USING (true);`;

  // Carregar status e produtos
  const carregarDados = async () => {
    setLoading(true);
    setErrorMsg(null);

    // 1. Checa status da conexão
    const status = await verificarStatusSupabase();
    setStatusConexao(status);

    // 2. Lê os produtos
    const result = await buscarProdutos();
    if (result.error && !result.isMock) {
      setErrorMsg(result.error);
    } else {
      setProdutos(result.data);
      setIsMock(Boolean(result.isMock));
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const precoNum = parseFloat(preco.replace(',', '.')) || 0;
    const estoqueNum = parseInt(estoque, 10) || 0;

    const result = await salvarProduto({
      nome: nome.trim(),
      categoria: categoria.trim(),
      preco: precoNum,
      estoque: estoqueNum,
      descricao: descricao.trim(),
    });

    setIsSaving(false);

    if (result.error) {
      setErrorMsg(`Erro ao salvar no Supabase: ${result.error}`);
    } else {
      setSuccessMsg('Produto salvo com sucesso no banco de dados Supabase!');
      setNome('');
      setDescricao('');
      setPreco('50.00');
      setEstoque('5');
      // Recarrega lista
      carregarDados();
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleExcluir = async (id?: number | string) => {
    if (!id) return;
    if (!confirm('Deseja realmente excluir este produto da tabela Supabase?')) return;

    const result = await excluirProduto(id);
    if (result.success) {
      setSuccessMsg('Produto removido com sucesso!');
      carregarDados();
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(`Erro ao excluir: ${result.error}`);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const filteredProdutos = produtos.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria.toLowerCase().includes(search.toLowerCase()) ||
    (p.descricao && p.descricao.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header com Status do Supabase */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-lg border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
                <Database className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Banco de Dados Supabase (PostgreSQL)</h2>
                <p className="text-xs text-slate-300">
                  Gerenciamento da tabela <code className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-300 font-mono">produtos</code> com leitura e gravação em tempo real
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              {showSqlGuide ? 'Ocultar Script SQL' : 'Ver Script SQL da Tabela'}
            </button>

            <button
              onClick={carregarDados}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30 active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Ler Dados Novamente
            </button>
          </div>
        </div>

        {/* Card de Status da Conexão */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              statusConexao.status === 'conectado' ? 'bg-emerald-400 animate-pulse' :
              statusConexao.status === 'erro' ? 'bg-rose-400' : 'bg-amber-400'
            }`} />
            <span className="font-semibold">
              Status:{' '}
              {statusConexao.status === 'conectado' && <span className="text-emerald-300 font-bold">Conectado ao Supabase</span>}
              {statusConexao.status === 'erro' && <span className="text-rose-300 font-bold">Aviso de Conexão</span>}
              {statusConexao.status === 'pendente_config' && <span className="text-amber-300 font-bold">Aguardando Variáveis de Ambiente</span>}
            </span>
          </div>

          <div className="text-slate-300 font-mono text-[11px]">
            Variáveis: <span className="text-emerald-300">process.env.SUPABASE_URL</span> &amp; <span className="text-emerald-300">process.env.SUPABASE_ANON_KEY</span>
          </div>
        </div>

        {statusConexao.mensagem && (
          <p className="text-[11px] text-slate-400 mt-2 bg-black/30 p-2 rounded-lg border border-white/5">
            ℹ️ {statusConexao.mensagem}
          </p>
        )}
      </div>

      {/* Banner de Tabela Pendente no Supabase */}
      {statusConexao.mensagem?.includes('Could not find the table') && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Conexão com o Supabase autenticada! Falta apenas criar a tabela produtos.
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Seu projeto <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">{statusConexao.url}</code> foi conectado com sucesso via token anon. Para ativar a gravação e leitura, execute o comando SQL abaixo no seu painel do Supabase (aba <strong>SQL Editor</strong>):
                </p>
              </div>
            </div>
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSql ? 'Copiado!' : 'Copiar Script SQL'}
            </button>
          </div>
          <pre className="text-[11px] font-mono bg-slate-900 text-emerald-300 p-3 rounded-xl overflow-x-auto border border-slate-800">
            {sqlCode}
          </pre>
        </div>
      )}

      {/* Alerta de Guia SQL caso queira copiar */}
      {showSqlGuide && (
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 shadow-md space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" /> Script SQL para criar a tabela produtos no Supabase
            </span>
            <button
              onClick={handleCopySql}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSql ? 'Copiado!' : 'Copiar SQL'}
            </button>
          </div>
          <pre className="text-[11px] font-mono bg-black/50 p-3 rounded-xl overflow-x-auto text-slate-300 border border-slate-800">
            {sqlCode}
          </pre>
        </div>
      )}

      {/* Alertas de Feedback */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid Principal: Formulário de Salvar (Esquerda) + Tabela de Leitura (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Formulário: Salvar Produto */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Plus className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Salvar Novo Produto no Supabase</h3>
              <p className="text-[11px] text-slate-500">Função de escrita/insert na tabela produtos</p>
            </div>
          </div>

          <form onSubmit={handleSalvar} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Produto / Peça Bordada *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Toalha de Banho com Monograma Dourado"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                >
                  <option value="Toalhas">Toalhas</option>
                  <option value="Decoração">Decoração</option>
                  <option value="Uniformes">Uniformes</option>
                  <option value="Enxoval Bebê">Enxoval Bebê</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Matrizes">Matrizes</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade em Estoque
              </label>
              <input
                type="number"
                min="0"
                value={estoque}
                onChange={(e) => setEstoque(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição e Detalhes da Peça
              </label>
              <textarea
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Ponto cheio alta definição, linha Poliamida resistente a cloro, bordadeira Brother BP2150L..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSaving ? 'Salvando no Supabase...' : 'Salvar Produto na Tabela'}</span>
            </button>
          </form>
        </div>

        {/* Tabela: Ler Dados (Visualização dos Produtos) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Dados da Tabela produtos ({filteredProdutos.length})
                </h3>
                <p className="text-[11px] text-slate-500">Função de leitura (select *) via cliente Supabase</p>
              </div>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto..."
                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
              <p>Lendo dados da tabela produtos no Supabase...</p>
            </div>
          ) : filteredProdutos.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2 border border-dashed border-slate-200 rounded-xl">
              <Package className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">Nenhum produto cadastrado na tabela.</p>
              <p className="text-[11px]">Utilize o formulário ao lado para salvar o primeiro item.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[10px] uppercase">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Produto</th>
                    <th className="pb-2">Categoria</th>
                    <th className="pb-2">Preço</th>
                    <th className="pb-2 text-center">Estoque</th>
                    <th className="pb-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProdutos.map((p) => (
                    <tr key={p.id || p.nome} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-mono text-[11px] text-slate-400 font-semibold">
                        #{p.id || '—'}
                      </td>
                      <td className="py-2.5">
                        <span className="font-bold text-slate-900 block">{p.nome}</span>
                        {p.descricao && (
                          <span className="text-[11px] text-slate-500 line-clamp-1">{p.descricao}</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-emerald-700 font-mono">
                        {formatCurrencyBRL(p.preco)}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.estoque > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.estoque} un
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleExcluir(p.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Excluir do Supabase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
