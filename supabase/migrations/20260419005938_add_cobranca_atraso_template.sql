INSERT INTO public.configuracoes_mensagens (tipo, texto)
VALUES (
  'cobranca_atraso',
  'Olá {{nome}}, tudo bem?\n\nVerificamos que sua mensalidade no valor de {{valor}} com vencimento em {{vencimento}} encontra-se pendente.\n\nPara realizar o pagamento via PIX, utilize a nossa chave: 12.345.678/0001-90 (CNPJ).\n\nQualquer dúvida, estamos à disposição!'
)
ON CONFLICT (tipo) DO NOTHING;
