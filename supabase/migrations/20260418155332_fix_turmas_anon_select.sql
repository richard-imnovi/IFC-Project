-- Allow anonymous users to fetch turmas for the registration form
DROP POLICY IF EXISTS "anon_select_turmas" ON public.turmas;
CREATE POLICY "anon_select_turmas" ON public.turmas
  FOR SELECT TO anon USING (true);

-- Insert some default turmas if none exist so the user can test the registration
INSERT INTO public.turmas (nome_turma, descricao)
SELECT 'Turma A', 'Turma da Manhã'
WHERE NOT EXISTS (SELECT 1 FROM public.turmas WHERE nome_turma = 'Turma A');

INSERT INTO public.turmas (nome_turma, descricao)
SELECT 'Turma B', 'Turma da Tarde'
WHERE NOT EXISTS (SELECT 1 FROM public.turmas WHERE nome_turma = 'Turma B');

INSERT INTO public.turmas (nome_turma, descricao)
SELECT 'Turma C', 'Turma da Noite'
WHERE NOT EXISTS (SELECT 1 FROM public.turmas WHERE nome_turma = 'Turma C');
