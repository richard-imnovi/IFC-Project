import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User, Mail, Phone, Book, CheckCircle, Loader2, UserPlus, Lock } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

const formSchema = z.object({
  fullName: z.string().min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
  whatsapp: z.string().min(15, { message: 'WhatsApp inválido. Preencha corretamente.' }),
  turma: z.string().min(1, { message: 'Selecione uma turma.' }),
})

const formatWhatsApp = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 11)
  let formatted = v
  if (v.length > 2) formatted = `(${v.slice(0, 2)}) ${v.slice(2)}`
  if (v.length > 7) formatted = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
  return formatted
}

export default function Index() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTurmas, setIsLoadingTurmas] = useState(true)
  const [turmas, setTurmas] = useState<{ id: string; nome_turma: string }[]>([])
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('turmas')
      .select('id, nome_turma')
      .then(({ data }) => {
        if (data) setTurmas(data)
        setIsLoadingTurmas(false)
      })
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      whatsapp: '',
      turma: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const { data, error } = await signUp(values.email, values.password, {
      nome: values.fullName,
      whatsapp: values.whatsapp,
      turma: values.turma,
      tipo_acesso: 'aluno',
    })

    setIsSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }

    form.reset()

    if (data?.user && !data.session) {
      toast.success('Cadastro realizado! Por favor, verifique seu e-mail para validar a conta.', {
        duration: 5000,
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      })
      navigate('/login')
    } else {
      toast.success('Cadastro realizado com sucesso!', {
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      })
      navigate('/aluno')
    }
  }

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-[500px] shadow-elevation border-0 animate-fade-in-up my-4">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Cadastro de Alunos
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Crie sua conta para acessar o portal do aluno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600">Nome Completo</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                          placeholder="Ex: João da Silva"
                          className="pl-10 h-11 transition-all duration-300 focus-visible:ring-primary/20 focus-visible:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            placeholder="joao@exemplo.com"
                            className="pl-10 h-11 transition-all duration-300 focus-visible:ring-primary/20 focus-visible:border-primary"
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
                            className="pl-10 h-11 transition-all duration-300 focus-visible:ring-primary/20 focus-visible:border-primary"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600">WhatsApp</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                          <Input
                            placeholder="(11) 99999-9999"
                            className="pl-10 h-11 transition-all duration-300 focus-visible:ring-primary/20 focus-visible:border-primary"
                            {...field}
                            onChange={(e) => field.onChange(formatWhatsApp(e.target.value))}
                            maxLength={15}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="turma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600">Turma</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 pl-10 relative transition-all duration-300 focus:ring-primary/20 focus:border-primary">
                            <Book className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingTurmas ? (
                            <SelectItem value="loading" disabled>
                              Carregando turmas...
                            </SelectItem>
                          ) : turmas.length > 0 ? (
                            turmas.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.nome_turma}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              Nenhuma turma disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base mt-2 transition-all duration-300 group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                )}
                Cadastrar Conta
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
