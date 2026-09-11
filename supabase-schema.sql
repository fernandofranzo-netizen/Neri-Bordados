-- ==========================================================
-- Schema Supabase para o Ateliê Neri Bordados
-- Tabela: produtos
-- ==========================================================

CREATE TABLE IF NOT EXISTS produtos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Bordado',
  preco NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  estoque INTEGER NOT NULL DEFAULT 0,
  descricao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita Row Level Security (RLS)
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso para a chave ANON pública
CREATE POLICY "Permitir leitura de produtos"
ON produtos FOR SELECT
USING (true);

CREATE POLICY "Permitir inserção de produtos"
ON produtos FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de produtos"
ON produtos FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de produtos"
ON produtos FOR DELETE
USING (true);

-- Dados iniciais de teste (Opcional)
INSERT INTO produtos (nome, categoria, preco, estoque, descricao) 
VALUES
  ('Toalha de Lavabo Monograma Floral', 'Toalhas', 45.90, 15, 'Toalha aveludada Döhler com bordado computadorizado'),
  ('Bastidor Porta Maternidade 20cm', 'Decoração', 89.90, 6, 'Bastidor de madeira com acabamento fino e nome da criança'),
  ('Jaleco Profissional com Brasão', 'Uniformes', 135.00, 10, 'Bordado computadorizado alta definição ponto cheio'),
  ('Kit Fraldas de Boca Premium (3 un)', 'Enxoval Bebê', 59.90, 12, 'Tecido fralda quadriculada 100% algodão')
ON CONFLICT DO NOTHING;
