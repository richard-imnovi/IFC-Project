CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_tipo_acesso text;
  v_nome text;
  v_whatsapp text;
  v_turma uuid;
  v_aluno_id uuid;
  v_template_id uuid;
BEGIN
  v_tipo_acesso := COALESCE(NEW.raw_user_meta_data->>'tipo_acesso', 'aluno');
  
  INSERT INTO public.users (id, email, tipo_acesso)
  VALUES (NEW.id, NEW.email, v_tipo_acesso)
  ON CONFLICT (id) DO NOTHING;

  IF v_tipo_acesso = 'aluno' THEN
    v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', 'Aluno Sem Nome');
    v_whatsapp := NEW.raw_user_meta_data->>'whatsapp';
    
    BEGIN
      v_turma := (NEW.raw_user_meta_data->>'turma')::uuid;
    EXCEPTION WHEN OTHERS THEN
      v_turma := NULL;
    END;

    INSERT INTO public.alunos (user_id, nome, whatsapp, turma, status_curso)
    VALUES (NEW.id, v_nome, v_whatsapp, v_turma, 'ativo')
    RETURNING id INTO v_aluno_id;

    -- Create dummy data to avoid empty states and show the app working
    INSERT INTO public.mensalidades_templates (aluno_id, valor, dia_vencimento, status_template)
    VALUES (v_aluno_id, 450.00, 10, 'ativo')
    RETURNING id INTO v_template_id;

    INSERT INTO public.mensalidades_geradas (template_id, mes_referencia, data_vencimento, data_pagamento, status)
    VALUES 
      (v_template_id, '04/2026', '2026-04-10', NULL, 'pendente'),
      (v_template_id, '03/2026', '2026-03-10', '2026-03-09', 'pago'),
      (v_template_id, '02/2026', '2026-02-10', '2026-02-05', 'pago');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
DECLARE
  new_user_id uuid;
  turma_a_id uuid := gen_random_uuid();
  turma_b_id uuid := gen_random_uuid();
BEGIN
  -- Seed admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'richard.piazza@terra.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'richard.piazza@terra.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"nome": "Admin Financeiro", "tipo_acesso": "financeiro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.users (id, email, tipo_acesso)
    VALUES (new_user_id, 'richard.piazza@terra.com.br', 'financeiro')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Seed Turmas
  INSERT INTO public.turmas (id, nome_turma, descricao) VALUES
    (turma_a_id, 'Turma A - Manhã', 'Turma do período da manhã'),
    (turma_b_id, 'Turma B - Tarde', 'Turma do período da tarde')
  ON CONFLICT (id) DO NOTHING;
END $$;
