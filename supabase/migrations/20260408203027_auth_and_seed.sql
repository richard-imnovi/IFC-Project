CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  turma_a_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  turma_b_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  turma_c_id uuid := '33333333-3333-3333-3333-333333333333'::uuid;
  finance_user_id uuid := gen_random_uuid();
BEGIN
  -- 1. Create Turmas
  INSERT INTO public.turmas (id, nome_turma, descricao) VALUES
    (turma_a_id, 'Turma A - Manhã', 'Período Matutino'),
    (turma_b_id, 'Turma B - Tarde', 'Período Vespertino'),
    (turma_c_id, 'Turma C - Noite', 'Período Noturno')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Update trigger to insert into alunos if tipo_acesso = 'aluno'
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $func$
  BEGIN
    INSERT INTO public.users (id, email, tipo_acesso)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'tipo_acesso', 'aluno')
    )
    ON CONFLICT (id) DO NOTHING;

    IF COALESCE(NEW.raw_user_meta_data->>'tipo_acesso', 'aluno') = 'aluno' THEN
      BEGIN
        INSERT INTO public.alunos (id, user_id, nome, whatsapp, turma)
        VALUES (
          NEW.id,
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'nome', 'Aluno'),
          NEW.raw_user_meta_data->>'whatsapp',
          NULLIF(NEW.raw_user_meta_data->>'turma', '')::uuid
        )
        ON CONFLICT (id) DO NOTHING;
      EXCEPTION WHEN invalid_text_representation THEN
        -- Ignore uuid cast errors if any
      END;
    END IF;

    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;

  -- 3. Seed Finance User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'financeiro@escola.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      finance_user_id,
      '00000000-0000-0000-0000-000000000000',
      'financeiro@escola.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"tipo_acesso": "financeiro", "nome": "Admin Financeiro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
END $$;
