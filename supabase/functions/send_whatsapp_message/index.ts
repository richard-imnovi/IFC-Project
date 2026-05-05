import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

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

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')

    if (!accountSid || !authToken || !twilioNumber) {
      throw new Error('Twilio credentials are not configured in environment secrets')
    }

    // Format destination number for WhatsApp Twilio API
    let to = phone_number
    
    // Remove all non-numeric characters except +
    to = to.replace(/[^\d+]/g, '')
    
    // Ensure it starts with + (assume Brazil +55 if no country code provided and length is typical BR mobile)
    if (!to.startsWith('+')) {
        if (to.length === 10 || to.length === 11) {
            to = `+55${to}`
        } else {
            to = `+${to}`
        }
    }
    
    // Ensure it has whatsapp: prefix for Twilio
    if (!to.startsWith('whatsapp:')) {
      to = `whatsapp:${to}`
    }

    // Ensure from number has whatsapp: prefix
    let from = twilioNumber
    if (!from.startsWith('whatsapp:')) {
        from = `whatsapp:${from}`
    }

    console.log(`Sending message type: ${message_type || 'default'} to: ${to}`)

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const auth = btoa(`${accountSid}:${authToken}`)

    const formParams = new URLSearchParams()
    formParams.append('To', to)
    formParams.append('From', from)
    formParams.append('Body', message_text)

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formParams.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Twilio Error:', data)
      throw new Error(data.message || 'Failed to send WhatsApp message via Twilio')
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: {
          sid: data.sid,
          status: data.status,
          type: message_type
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Function Error:', error.message)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
