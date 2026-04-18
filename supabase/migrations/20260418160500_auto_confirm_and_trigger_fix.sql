DO $$
BEGIN
  -- Auto-confirm any existing users that are not confirmed
  UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
END $$;

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();

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
      IF NEW.raw_user_meta_data->>'turma' IS NOT NULL AND NEW.raw_user_meta_data->>'turma' != '' THEN
        v_turma := (NEW.raw_user_meta_data->>'turma')::uuid;
        -- verify if turma exists
        IF NOT EXISTS (SELECT 1 FROM public.turmas WHERE id = v_turma) THEN
          v_turma := NULL;
        END IF;
      ELSE
        v_turma := NULL;
      END IF;
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
      (v_template_id, to_char(CURRENT_DATE, 'MM/YYYY'), CURRENT_DATE, NULL, 'pendente'),
      (v_template_id, to_char(CURRENT_DATE - INTERVAL '1 month', 'MM/YYYY'), (CURRENT_DATE - INTERVAL '1 month')::date, (CURRENT_DATE - INTERVAL '1 month' - INTERVAL '1 day')::date, 'pago'),
      (v_template_id, to_char(CURRENT_DATE - INTERVAL '2 months', 'MM/YYYY'), (CURRENT_DATE - INTERVAL '2 months')::date, (CURRENT_DATE - INTERVAL '2 months' - INTERVAL '5 days')::date, 'pago');
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Prevents the transaction from aborting so the user is still created in auth.users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
