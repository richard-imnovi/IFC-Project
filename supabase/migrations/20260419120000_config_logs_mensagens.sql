CREATE TABLE IF NOT EXISTS public.configuracoes_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL UNIQUE,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.configuracoes_mensagens (tipo, texto) VALUES
('lembrete_3_dias', 'Olá {{nome}}, tudo bem? Este é um lembrete amigável de que sua mensalidade no valor de {{valor}} vence em 3 dias ({{vencimento}}). Para realizar o pagamento via PIX, utilize a nossa chave: 12.345.678/0001-90 (CNPJ). Qualquer dúvida, estamos à disposição!'),
('lembrete_vencimento', 'Olá {{nome}}, tudo bem? Lembramos que sua mensalidade no valor de {{valor}} vence HOJE ({{vencimento}}). Para realizar o pagamento via PIX, utilize a nossa chave: 12.345.678/0001-90 (CNPJ). Se já realizou o pagamento, por favor, desconsidere esta mensagem. Obrigado!')
ON CONFLICT (tipo) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.logs_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mensalidade_id uuid REFERENCES public.mensalidades_geradas(id) ON DELETE CASCADE,
  aluno_nome text NOT NULL,
  whatsapp text NOT NULL,
  tipo_mensagem text NOT NULL,
  status text NOT NULL,
  erro text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_mensagens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_configuracoes_mensagens" ON public.configuracoes_mensagens;
CREATE POLICY "authenticated_all_configuracoes_mensagens" ON public.configuracoes_mensagens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_logs_mensagens" ON public.logs_mensagens;
CREATE POLICY "authenticated_all_logs_mensagens" ON public.logs_mensagens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
