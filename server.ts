import express from 'express';
import path from 'path';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;

app.use(express.json());

// ============================================================================
// Conexão Segura com o Supabase utilizando process.env
// ============================================================================
let supabase: SupabaseClient | null = null;

function cleanSupabaseUrl(rawUrl: string): string {
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  const rawUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!rawUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    const cleanUrl = cleanSupabaseUrl(rawUrl);
    supabase = createClient(cleanUrl, supabaseAnonKey);
    console.log('[Supabase] Cliente conectado com sucesso a:', cleanUrl);
    return supabase;
  } catch (err) {
    console.error('[Supabase] Falha ao inicializar cliente:', err);
    return null;
  }
}

// ============================================================================
// Rotas da API para Produtos (Tabela 'produtos')
// ============================================================================

// 1. Status da conexão Supabase
app.get('/api/supabase/status', async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const client = getSupabase();

  if (!supabaseUrl || !supabaseAnonKey || !client) {
    return res.json({
      configurado: false,
      url: null,
      status: 'pendente_config',
      mensagem: 'Variáveis process.env.SUPABASE_URL e process.env.SUPABASE_ANON_KEY ainda não configuradas.',
    });
  }

  try {
    // Testa consulta rápida na tabela 'produtos'
    const { data, error } = await client.from('produtos').select('id').limit(1);
    
    if (error) {
      return res.json({
        configurado: true,
        url: supabaseUrl,
        status: 'erro',
        mensagem: `Conexão efetuada, mas tabela 'produtos' retornou: ${error.message}. Execute o script SQL se a tabela ainda não foi criada.`,
      });
    }

    return res.json({
      configurado: true,
      url: supabaseUrl,
      status: 'conectado',
      mensagem: 'Conexão com banco de dados Supabase ativa e tabela produtos verificada com sucesso!',
    });
  } catch (err: any) {
    return res.json({
      configurado: true,
      url: supabaseUrl,
      status: 'erro',
      mensagem: `Erro na comunicação com Supabase: ${err.message}`,
    });
  }
});

// 2. LER dados da tabela 'produtos'
app.get('/api/produtos', async (req, res) => {
  const client = getSupabase();

  if (!client) {
    return res.json({
      success: false,
      isMock: true,
      data: [
        {
          id: 1,
          nome: 'Toalha de Lavabo Monograma Floral',
          categoria: 'Toalhas',
          preco: 45.90,
          estoque: 15,
          descricao: 'Toalha aveludada Döhler com bordado computadorizado',
          criado_em: new Date().toISOString(),
        },
        {
          id: 2,
          nome: 'Bastidor Porta Maternidade 20cm',
          categoria: 'Decoração',
          preco: 89.90,
          estoque: 6,
          descricao: 'Bastidor de madeira com acabamento fino e nome da criança',
          criado_em: new Date().toISOString(),
        },
        {
          id: 3,
          nome: 'Jaleco Profissional com Brasão',
          categoria: 'Uniformes',
          preco: 135.00,
          estoque: 10,
          descricao: 'Bordado computadorizado alta definição ponto cheio',
          criado_em: new Date().toISOString(),
        }
      ],
      error: 'process.env.SUPABASE_URL e process.env.SUPABASE_ANON_KEY não configuradas. Exibindo dados de demonstração.'
    });
  }

  try {
    const { data, error } = await client
      .from('produtos')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. SALVAR dados na tabela 'produtos'
app.post('/api/produtos', async (req, res) => {
  const client = getSupabase();
  const { nome, categoria, preco, estoque, descricao } = req.body;

  if (!nome || typeof nome !== 'string') {
    return res.status(400).json({ success: false, error: 'O nome do produto é obrigatório.' });
  }

  if (!client) {
    return res.status(400).json({
      success: false,
      error: 'Defina process.env.SUPABASE_URL e process.env.SUPABASE_ANON_KEY no ambiente para salvar permanentemente no banco Supabase.',
    });
  }

  try {
    const { data, error } = await client
      .from('produtos')
      .insert([
        {
          nome: nome.trim(),
          categoria: categoria ? String(categoria).trim() : 'Geral',
          preco: Number(preco) || 0.0,
          estoque: Number(estoque) || 0,
          descricao: descricao ? String(descricao).trim() : '',
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. EXCLUIR dados da tabela 'produtos'
app.delete('/api/produtos/:id', async (req, res) => {
  const client = getSupabase();
  const { id } = req.params;

  if (!client) {
    return res.status(400).json({ success: false, error: 'Supabase não configurado.' });
  }

  try {
    const { error } = await client.from('produtos').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Health check geral
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Neri Bordados Computadorizados',
    timestamp: new Date().toISOString(),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
  });
});

// ============================================================================
// Configuração do Vite e Arquivos Estáticos
// ============================================================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Servidor] Ateliê Neri Bordados rodando em http://localhost:${PORT}`);
  });
}

start();
