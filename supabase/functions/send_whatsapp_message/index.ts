import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { phone_number, message_text, message_type } = body

    if (!phone_number || !message_text) {
      throw new Error('phone_number and message_text are required')
    }

    const apiUrl = Deno.env.get('EVOLUTION_API_URL')
    const apiKey = Deno.env.get('EVOLUTION_API_KEY')
    const instanceName = Deno.env.get('EVOLUTION_INSTANCE')

    if (!apiUrl || !apiKey || !instanceName) {
      throw new Error('Evolution API credentials are not configured in environment secrets')
    }

    // Format destination number for Evolution API (expecting digits only, with country code)
    let to = phone_number.replace(/\D/g, '')

    // Ensure it starts with country code (assume Brazil 55 if length is typical BR mobile 10 or 11)
    if (to.length === 10 || to.length === 11) {
      to = `55${to}`
    }

    console.log(`Sending message type: ${message_type || 'default'} to: ${to} via Evolution API`)

    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
    const evolutionUrl = `${baseUrl}/message/sendText/${instanceName}`

    const response = await fetch(evolutionUrl, {
      method: 'POST',
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: to,
        options: {
          delay: 1200,
          presence: 'composing',
          linkPreview: false,
        },
        textMessage: {
          text: message_text,
        },
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('Evolution API Error:', data)
      const errorMessage =
        data?.message ||
        (data?.response && data.response.message) ||
        data?.error ||
        'Failed to send WhatsApp message via Evolution API'
      throw new Error(
        `Evolution API Error: ${typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)}`,
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'WhatsApp message sent successfully',
        data: {
          status: 'sent',
          type: message_type,
          response: data,
        },
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
