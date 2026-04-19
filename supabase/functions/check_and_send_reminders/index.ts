import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 1. Fetch custom templates
    const { data: configs } = await supabase.from('configuracoes_mensagens').select('*')
    const tpl3Dias =
      configs?.find((c: any) => c.tipo === 'lembrete_3_dias')?.texto ||
      'Olá {{nome}}, tudo bem?\n\nEste é um lembrete amigável de que sua mensalidade no valor de {{valor}} vence em 3 dias ({{vencimento}}).\n\nPara realizar o pagamento via PIX, utilize a nossa chave: 12.345.678/0001-90 (CNPJ).\n\nQualquer dúvida, estamos à disposição!'

    const tplVencimento =
      configs?.find((c: any) => c.tipo === 'lembrete_vencimento')?.texto ||
      'Olá {{nome}}, tudo bem?\n\nLembramos que sua mensalidade no valor de {{valor}} vence HOJE ({{vencimento}}).\n\nPara realizar o pagamento via PIX, utilize a nossa chave: 12.345.678/0001-90 (CNPJ).\n\nSe já realizou o pagamento, por favor, desconsidere esta mensagem. Obrigado!'

    // 2. Fetch all pendente mensalidades
    const { data: mensalidades, error } = await supabase
      .from('mensalidades_geradas')
      .select(`
        id,
        data_vencimento,
        status,
        mensalidades_templates!inner (
          valor,
          alunos!inner (
            nome,
            whatsapp
          )
        )
      `)
      .eq('status', 'pendente')

    if (error) {
      throw error
    }

    if (!mensalidades || mensalidades.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhuma mensalidade pendente encontrada', sentCount: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let sentCount = 0
    const errors: any[] = []

    for (const mensalidade of mensalidades) {
      if (!mensalidade.data_vencimento) continue

      const [year, month, day] = mensalidade.data_vencimento.split('-')
      const vencimento = new Date(Number(year), Number(month) - 1, Number(day))

      const diffTime = vencimento.getTime() - today.getTime()
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24))

      const templates = Array.isArray(mensalidade.mensalidades_templates)
        ? mensalidade.mensalidades_templates[0]
        : mensalidade.mensalidades_templates

      if (!templates) continue

      const alunos = Array.isArray(templates.alunos) ? templates.alunos[0] : templates.alunos

      if (!alunos || !alunos.whatsapp) continue

      const valor = templates.valor
      const nome = alunos.nome
      const whatsapp = alunos.whatsapp

      let message_type = null
      let message_text = null

      const dataVencimentoFormatada = `${day}/${month}/${year}`
      const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor)

      // 3. Check if it's 3 days before or due today
      if (diffDays === 3) {
        message_type = 'lembrete_3_dias'
        message_text = tpl3Dias
          .replace(/{{nome}}/g, nome)
          .replace(/{{valor}}/g, valorFormatado)
          .replace(/{{vencimento}}/g, dataVencimentoFormatada)
      } else if (diffDays === 0) {
        message_type = 'lembrete_vencimento'
        message_text = tplVencimento
          .replace(/{{nome}}/g, nome)
          .replace(/{{valor}}/g, valorFormatado)
          .replace(/{{vencimento}}/g, dataVencimentoFormatada)
      }

      if (message_type && message_text) {
        let invokeError = null
        try {
          const { error: fnError } = await supabase.functions.invoke('send_whatsapp_message', {
            body: {
              phone_number: whatsapp,
              message_text: message_text,
              message_type: message_type,
            },
          })
          if (fnError) invokeError = fnError
        } catch (e) {
          invokeError = e
        }

        if (invokeError) {
          console.error(`Error sending message to ${nome}:`, invokeError)
          errors.push({ aluno: nome, error: invokeError })
        } else {
          sentCount++
        }

        // 4. Log the result
        await supabase.from('logs_mensagens').insert({
          mensalidade_id: mensalidade.id,
          aluno_nome: nome,
          whatsapp: whatsapp,
          tipo_mensagem: message_type,
          status: invokeError ? 'falha' : 'sucesso',
          erro: invokeError ? JSON.stringify(invokeError) : null,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verificação e envio de lembretes concluídos',
        sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Function Error:', error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
