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

    // 1. Fetch all pendente mensalidades
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

      // 2. Check if it's 3 days before or due today
      if (diffDays === 3) {
        message_type = 'lembrete_3_dias'
        message_text = `Olá ${nome}, tudo bem?\n\nEste é um lembrete amigável de que sua mensalidade no valor de ${valorFormatado} vence em 3 dias (${dataVencimentoFormatada}).\n\nPara realizar o pagamento via PIX, utilize a nossa chave: 12.345.678/0001-90 (CNPJ).\n\nQualquer dúvida, estamos à disposição!`
      } else if (diffDays === 0) {
        message_type = 'lembrete_vencimento'
        message_text = `Olá ${nome}, tudo bem?\n\nLembramos que sua mensalidade no valor de ${valorFormatado} vence HOJE (${dataVencimentoFormatada}).\n\nPara realizar o pagamento via PIX, utilize a nossa chave: 12.345.678/0001-90 (CNPJ).\n\nSe já realizou o pagamento, por favor, desconsidere esta mensagem. Obrigado!`
      }

      if (message_type && message_text) {
        const { error: invokeError } = await supabase.functions.invoke('send_whatsapp_message', {
          body: {
            phone_number: whatsapp,
            message_text: message_text,
            message_type: message_type,
          },
        })

        if (invokeError) {
          console.error(`Error sending message to ${nome}:`, invokeError)
          errors.push({ aluno: nome, error: invokeError })
        } else {
          sentCount++
        }
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
