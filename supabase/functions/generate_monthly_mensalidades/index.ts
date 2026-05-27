import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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

    const now = new Date()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear()
    const mes_referencia = `${month}/${year}`

    // Busca templates ativos com alunos também ativos
    const { data: templates, error: templatesError } = await supabase
      .from('mensalidades_templates')
      .select(`
        id,
        dia_vencimento,
        aluno_id,
        alunos!inner (
          status_curso
        )
      `)
      .eq('status_template', 'ativo')
      .eq('alunos.status_curso', 'ativo')

    if (templatesError) {
      throw templatesError
    }

    if (!templates || templates.length === 0) {
      return new Response(JSON.stringify({ message: 'No active templates found', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Prepara as inserções baseadas nos templates encontrados
    const inserts = templates.map((template: any) => {
      const day = template.dia_vencimento
      const date = new Date(year, now.getMonth(), day)
      
      // Ajusta para meses que não possuem o dia (ex: 31 de fevereiro não existe, vai para o último dia do mês)
      if (date.getMonth() !== now.getMonth()) {
        date.setDate(0) 
      }

      const isoDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`

      return {
        template_id: template.id,
        mes_referencia,
        data_vencimento: isoDate,
        status: 'pendente'
      }
    })

    // Verifica mensalidades já geradas no mês atual para evitar duplicidade
    const { data: existing, error: existingError } = await supabase
      .from('mensalidades_geradas')
      .select('template_id')
      .eq('mes_referencia', mes_referencia)

    if (existingError) {
      throw existingError
    }

    const existingTemplateIds = new Set(existing.map((e: any) => e.template_id))
    const newInserts = inserts.filter(i => !existingTemplateIds.has(i.template_id))

    if (newInserts.length === 0) {
      return new Response(JSON.stringify({ message: 'All mensalidades for this month are already generated', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { error: insertError } = await supabase
      .from('mensalidades_geradas')
      .insert(newInserts)

    if (insertError) {
      throw insertError
    }

    return new Response(JSON.stringify({ 
      message: 'Mensalidades generated successfully',
      count: newInserts.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
