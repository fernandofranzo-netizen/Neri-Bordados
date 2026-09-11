import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Produto {
  id?: number | string;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  descricao?: string;
  criado_em?: string;
}

// Configuração segura com lazy initialization
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Tenta obter de process.env (Node/SSR/Build) ou import.meta.env (Vite client)
  const supabaseUrl = 
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL);

  const supabaseAnonKey = 
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (error) {
    console.error('[Supabase] Erro ao instanciar cliente:', error);
    return null;
  }
}

/**
 * Função para LER dados da tabela 'produtos' no Supabase
 * Faz a chamada prioritariamente via API backend (Express) protegida, 
 * com fallback direto via SDK caso configurado no client.
 */
export async function buscarProdutos(): Promise<{ data: Produto[]; error: string | null; isMock?: boolean }> {
  // 1. Tenta via API backend (recomendado para manter chaves em process.env no servidor)
  try {
    const res = await fetch('/api/produtos');
    if (res.ok) {
      const result = await res.json();
      return { 
        data: result.data || [], 
        error: result.error || null,
        isMock: result.isMock || false 
      };
    }
  } catch {
    // API backend offline ou falha de rede, tenta fallback
  }

  // 2. Fallback direto caso o cliente Supabase esteja acessível no frontend
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('produtos')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: (data as Produto[]) || [], error: null };
    } catch (err: any) {
      return { data: [], error: err.message || 'Erro ao conectar ao Supabase' };
    }
  }

  // Se variáveis de ambiente não foram adicionadas ainda
  return { 
    data: [], 
    error: 'Variáveis SUPABASE_URL e SUPABASE_ANON_KEY não configuradas.',
    isMock: false
  };
}

/**
 * Função para SALVAR dados na tabela 'produtos' no Supabase
 */
export async function salvarProduto(produto: Omit<Produto, 'id' | 'criado_em'>): Promise<{ data: Produto | null; error: string | null }> {
  // 1. Tenta via API backend
  try {
    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(produto),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { data: result.data, error: null };
    }
    if (!res.ok && result.error) {
      return { data: null, error: result.error };
    }
  } catch {
    // Fallback para inserção direta
  }

  // 2. Fallback via SDK direto se inicializado
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('produtos')
        .insert([
          {
            nome: produto.nome,
            categoria: produto.categoria,
            preco: Number(produto.preco),
            estoque: Number(produto.estoque),
            descricao: produto.descricao || '',
          }
        ])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as Produto, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao salvar no Supabase' };
    }
  }

  return { data: null, error: 'Credenciais do Supabase não configuradas no servidor.' };
}

/**
 * Função para EXCLUIR produto da tabela 'produtos'
 */
export async function excluirProduto(id: number | string): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await fetch(`/api/produtos/${id}`, {
      method: 'DELETE',
    });
    const result = await res.json();
    return { success: result.success, error: result.error || null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Função para testar conexão e status do Supabase
 */
export async function verificarStatusSupabase(): Promise<{
  configurado: boolean;
  url: string | null;
  status: 'conectado' | 'pendente_config' | 'erro';
  mensagem: string;
}> {
  try {
    const res = await fetch('/api/supabase/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Servidor ainda iniciando ou offline
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      configurado: false,
      url: null,
      status: 'pendente_config',
      mensagem: 'Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env ou no painel de Configurações.'
    };
  }

  return {
    configurado: true,
    url: 'Conexão ativa',
    status: 'conectado',
    mensagem: 'Cliente Supabase inicializado com sucesso.'
  };
}
