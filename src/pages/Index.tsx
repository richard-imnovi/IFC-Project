import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User, Mail, Phone, Book, CheckCircle, Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

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

const formSchema = z.object({
  fullName: z.string().min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'E-mail inválido.' }),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      whatsapp: '',
      turma: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    // Simulate API call processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    form.reset()

    toast.success('Cadastro realizado com sucesso!', {
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      className: 'border-emerald-500 bg-emerald-50 text-emerald-900',
    })
  }

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-[500px] shadow-elevation border-0 animate-fade-in-up">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Cadastro de Alunos
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Preencha os dados abaixo para matricular o aluno.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-600">WhatsApp</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                          placeholder="(11) 99999-9999"
                          className="pl-10 h-12 transition-all duration-300 focus-visible:ring-primary/20 focus-visible:border-primary"
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
                        <SelectTrigger className="h-12 pl-10 relative transition-all duration-300 focus:ring-primary/20 focus:border-primary">
                          <Book className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                          <SelectValue placeholder="Selecione uma turma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="turma-a">Turma A - Manhã</SelectItem>
                        <SelectItem value="turma-b">Turma B - Tarde</SelectItem>
                        <SelectItem value="turma-c">Turma C - Noite</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <UserPlus className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                )}
                Cadastrar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
