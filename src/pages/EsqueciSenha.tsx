import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Loader2, Book, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

const forgotSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
})

export default function EsqueciSenha() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: z.infer<typeof forgotSchema>) => {
    setIsSubmitting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })

    setIsSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Se o e-mail existir, você receberá um link para redefinir sua senha.')
    navigate('/login')
  }

  return (
    <div className="w-full flex justify-center py-12 px-4">
      <Card className="w-full max-w-[400px] shadow-elevation border-0 animate-fade-in-up">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
              <Book className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              IFC Piracicaba
            </CardTitle>
          </div>
          <CardDescription className="text-base text-slate-600">
            Recuperar acesso à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600">E-mail</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 h-12 transition-all duration-300 focus-visible:ring-primary/20 focus-visible:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-base transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Enviar Link
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para o Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
