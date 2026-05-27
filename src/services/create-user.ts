import { supabase } from '@/lib/supabase/client'

export const createUser = async (payload: any) => {
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: payload,
  })

  if (error) {
    // Handle specific Http Errors from Edge Function
    if (error.context && typeof error.context.json === 'function') {
      try {
        const errData = await error.context.json()
        if (errData && errData.error) {
          return { error: new Error(errData.error) }
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    return { error: new Error(error.message || 'Erro ao comunicar com o servidor') }
  }

  if (data?.error) {
    return { error: new Error(data.error) }
  }

  return { data }
}
