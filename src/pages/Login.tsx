import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react'
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
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(1, { message: 'Senha é obrigatória.' }),
})

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true)

    const { data, error } = await signIn(values.email.trim(), values.password)

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        toast.error('Por favor, confirme seu e-mail antes de fazer login.')
      } else {
        toast.error(
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos'
            : error.message,
        )
      }
      setIsSubmitting(false)
      return
    }

    if (data?.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('tipo_acesso')
        .eq('id', data.user.id)
        .maybeSingle()

      toast.success('Login realizado com sucesso!')

      if (profile?.tipo_acesso === 'financeiro') {
        navigate('/financeiro')
      } else {
        navigate('/aluno')
      }
    } else {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex justify-center py-12">
      <Card className="w-full max-w-[400px] shadow-elevation border-0 animate-fade-in-up">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Acessar Sistema
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Entre com suas credenciais para continuar.
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600">Senha</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                          type="password"
                          placeholder="••••••••"
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
                className="w-full h-12 text-base transition-all duration-300 group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <LogIn className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                )}
                Entrar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
