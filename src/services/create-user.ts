import { supabase } from '@/lib/supabase/client'

export const createUser = async (payload: any) => {
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: payload,
  })

  if (error) {
    return { error }
  }

  if (data?.error) {
    return { error: new Error(data.error) }
  }

  return { data }
}
