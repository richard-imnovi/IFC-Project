DO $$
DECLARE
  v_template RECORD;
  v_mes_atual text := to_char(CURRENT_DATE, 'MM/YYYY');
  v_data_vencimento date;
BEGIN
  FOR v_template IN SELECT id, dia_vencimento FROM public.mensalidades_templates WHERE status_template = 'ativo' LOOP
    -- Calculate data_vencimento for current month safely
    BEGIN
      v_data_vencimento := to_date(
        v_template.dia_vencimento::text || '/' || v_mes_atual,
        'DD/MM/YYYY'
      );
    EXCEPTION WHEN OTHERS THEN
      -- Handle invalid dates like 31/02/YYYY
      v_data_vencimento := (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date;
    END;

    INSERT INTO public.mensalidades_geradas (template_id, mes_referencia, data_vencimento, status)
    SELECT v_template.id, v_mes_atual, v_data_vencimento, 'pendente'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.mensalidades_geradas 
      WHERE template_id = v_template.id AND mes_referencia = v_mes_atual
    );
  END LOOP;
END $$;
