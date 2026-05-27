import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { phone_number, message_text, message_type } = body

    if (!phone_number || !message_text || !message_type) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: phone_number, message_text, message_type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const apiKey = Deno.env.get('EVOLUTION_API_KEY')
    const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME')
    const baseUrlEnv = Deno.env.get('EVOLUTION_BASE_URL')

    if (!apiKey || !instanceName || !baseUrlEnv) {
      return new Response(JSON.stringify({ error: 'Evolution API secrets not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let to = phone_number.replace(/\D/g, '')
    if (to.length === 10 || to.length === 11) {
      to = `55${to}`
    }

    const baseUrl = baseUrlEnv.endsWith('/') ? baseUrlEnv.slice(0, -1) : baseUrlEnv
    const url = `${baseUrl}/message/sendText/${instanceName}`

    const payload = {
      number: to,
      text: message_text,
      delay: 1000,
    }

    const fetchEvolution = async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        throw new Error('401')
      }
      if (response.status === 404) {
        throw new Error('404')
      }
      if (response.status >= 500) {
        throw new Error(`5xx:${response.statusText || response.status}`)
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(`API Error: ${errData.message || errData.error || response.statusText}`)
      }

      return response.json()
    }

    let result
    let retries = 0
    const maxRetries = 3
    const delays = [2000, 4000, 8000]

    while (true) {
      try {
        result = await fetchEvolution()
        break
      } catch (err: any) {
        const errorMsg = err.message || ''
        if (errorMsg === '401') {
          return new Response(JSON.stringify({ error: 'Chave de API inválida' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        if (errorMsg === '404') {
          return new Response(JSON.stringify({ error: 'Instância não encontrada' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        if (errorMsg.startsWith('5xx:')) {
          if (retries < maxRetries) {
            await sleep(delays[retries])
            retries++
            continue
          }
        }

        return new Response(JSON.stringify({ error: errorMsg.replace('5xx:', 'Server Error: ') }), {
          status: errorMsg.startsWith('5xx:') ? 500 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(
      JSON.stringify({
        data: {
          message_id: result?.key?.id || result?.messageId || 'success',
          status: 'enviado',
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
