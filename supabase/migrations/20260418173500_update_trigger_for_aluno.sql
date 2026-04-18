CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_tipo_acesso text;
  v_nome text;
  v_whatsapp text;
  v_turma uuid;
  v_aluno_id uuid;
  v_template_id uuid;
  v_valor numeric;
  v_dia_vencimento integer;
BEGIN
  v_tipo_acesso := COALESCE(NEW.raw_user_meta_data->>'tipo_acesso', 'aluno');
  
  INSERT INTO public.users (id, email, tipo_acesso)
  VALUES (NEW.id, NEW.email, v_tipo_acesso)
  ON CONFLICT (id) DO NOTHING;

  IF v_tipo_acesso = 'aluno' THEN
    v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', 'Aluno Sem Nome');
    v_whatsapp := NEW.raw_user_meta_data->>'whatsapp';
    v_valor := COALESCE((NEW.raw_user_meta_data->>'valor')::numeric, 450.00);
    v_dia_vencimento := COALESCE((NEW.raw_user_meta_data->>'dia_vencimento')::integer, 10);
    
    BEGIN
      IF NEW.raw_user_meta_data->>'turma' IS NOT NULL AND NEW.raw_user_meta_data->>'turma' != '' AND NEW.raw_user_meta_data->>'turma' != 'none' THEN
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

    INSERT INTO public.mensalidades_templates (aluno_id, valor, dia_vencimento, status_template)
    VALUES (v_aluno_id, v_valor, v_dia_vencimento, 'ativo')
    RETURNING id INTO v_template_id;

    INSERT INTO public.mensalidades_geradas (template_id, mes_referencia, data_vencimento, data_pagamento, status)
    VALUES 
      (v_template_id, to_char(CURRENT_DATE, 'MM/YYYY'), CURRENT_DATE, NULL, 'pendente');
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$function$;
