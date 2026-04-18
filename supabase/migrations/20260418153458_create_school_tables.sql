-- 1. Create turmas table
CREATE TABLE IF NOT EXISTS public.turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_turma TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT,
  tipo_acesso TEXT NOT NULL CHECK (tipo_acesso IN ('aluno', 'financeiro')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create alunos table
CREATE TABLE IF NOT EXISTS public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  whatsapp TEXT,
  turma UUID REFERENCES public.turmas(id) ON DELETE SET NULL,
  status_curso TEXT NOT NULL CHECK (status_curso IN ('ativo', 'concluído', 'cancelado', 'suspenso')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create mensalidades_templates table
CREATE TABLE IF NOT EXISTS public.mensalidades_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  valor NUMERIC(10, 2) NOT NULL,
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
  status_template TEXT NOT NULL CHECK (status_template IN ('ativo', 'inativo')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create mensalidades_geradas table
CREATE TABLE IF NOT EXISTS public.mensalidades_geradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.mensalidades_templates(id) ON DELETE CASCADE,
  mes_referencia TEXT NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'pago', 'atrasado')) DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create pagamentos_confirmados table
CREATE TABLE IF NOT EXISTS public.pagamentos_confirmados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensalidade_id UUID NOT NULL REFERENCES public.mensalidades_geradas(id) ON DELETE CASCADE,
  data_confirmacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metodo_confirmacao TEXT NOT NULL CHECK (metodo_confirmacao IN ('whatsapp', 'comprovante')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensalidades_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensalidades_geradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_confirmados ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies (Allow all for authenticated users temporarily for the frontend integration)

-- Policies for turmas
DROP POLICY IF EXISTS "authenticated_select_turmas" ON public.turmas;
CREATE POLICY "authenticated_select_turmas" ON public.turmas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_turmas" ON public.turmas;
CREATE POLICY "authenticated_insert_turmas" ON public.turmas FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_turmas" ON public.turmas;
CREATE POLICY "authenticated_update_turmas" ON public.turmas FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_delete_turmas" ON public.turmas;
CREATE POLICY "authenticated_delete_turmas" ON public.turmas FOR DELETE TO authenticated USING (true);

-- Policies for users
DROP POLICY IF EXISTS "authenticated_select_users" ON public.users;
CREATE POLICY "authenticated_select_users" ON public.users FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_users" ON public.users;
CREATE POLICY "authenticated_insert_users" ON public.users FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_users" ON public.users;
CREATE POLICY "authenticated_update_users" ON public.users FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_delete_users" ON public.users;
CREATE POLICY "authenticated_delete_users" ON public.users FOR DELETE TO authenticated USING (true);

-- Policies for alunos
DROP POLICY IF EXISTS "authenticated_select_alunos" ON public.alunos;
CREATE POLICY "authenticated_select_alunos" ON public.alunos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_alunos" ON public.alunos;
CREATE POLICY "authenticated_insert_alunos" ON public.alunos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_alunos" ON public.alunos;
CREATE POLICY "authenticated_update_alunos" ON public.alunos FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_delete_alunos" ON public.alunos;
CREATE POLICY "authenticated_delete_alunos" ON public.alunos FOR DELETE TO authenticated USING (true);

-- Policies for mensalidades_templates
DROP POLICY IF EXISTS "authenticated_select_mensalidades_templates" ON public.mensalidades_templates;
CREATE POLICY "authenticated_select_mensalidades_templates" ON public.mensalidades_templates FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_mensalidades_templates" ON public.mensalidades_templates;
CREATE POLICY "authenticated_insert_mensalidades_templates" ON public.mensalidades_templates FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_mensalidades_templates" ON public.mensalidades_templates;
CREATE POLICY "authenticated_update_mensalidades_templates" ON public.mensalidades_templates FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_delete_mensalidades_templates" ON public.mensalidades_templates;
CREATE POLICY "authenticated_delete_mensalidades_templates" ON public.mensalidades_templates FOR DELETE TO authenticated USING (true);

-- Policies for mensalidades_geradas
DROP POLICY IF EXISTS "authenticated_select_mensalidades_geradas" ON public.mensalidades_geradas;
CREATE POLICY "authenticated_select_mensalidades_geradas" ON public.mensalidades_geradas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_mensalidades_geradas" ON public.mensalidades_geradas;
CREATE POLICY "authenticated_insert_mensalidades_geradas" ON public.mensalidades_geradas FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_mensalidades_geradas" ON public.mensalidades_geradas;
CREATE POLICY "authenticated_update_mensalidades_geradas" ON public.mensalidades_geradas FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_delete_mensalidades_geradas" ON public.mensalidades_geradas;
CREATE POLICY "authenticated_delete_mensalidades_geradas" ON public.mensalidades_geradas FOR DELETE TO authenticated USING (true);

-- Policies for pagamentos_confirmados
DROP POLICY IF EXISTS "authenticated_select_pagamentos_confirmados" ON public.pagamentos_confirmados;
CREATE POLICY "authenticated_select_pagamentos_confirmados" ON public.pagamentos_confirmados FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_pagamentos_confirmados" ON public.pagamentos_confirmados;
CREATE POLICY "authenticated_insert_pagamentos_confirmados" ON public.pagamentos_confirmados FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_pagamentos_confirmados" ON public.pagamentos_confirmados;
CREATE POLICY "authenticated_update_pagamentos_confirmados" ON public.pagamentos_confirmados FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_delete_pagamentos_confirmados" ON public.pagamentos_confirmados;
CREATE POLICY "authenticated_delete_pagamentos_confirmados" ON public.pagamentos_confirmados FOR DELETE TO authenticated USING (true);
