import { useState, useEffect } from 'react'
import {
  User,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Receipt,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'

type PaymentStatus = 'pago' | 'pendente' | 'atrasado'

export default function DashboardAluno() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [alunoData, setAlunoData] = useState<any>(null)
  const [mensalidades, setMensalidades] = useState<any[]>([])
  const [confirmMethod, setConfirmMethod] = useState('comprovante')
  const [confirmacoes, setConfirmacoes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function loadData() {
      if (!user) return

      const { data: aluno, error: alunoErr } = await supabase
        .from('alunos')
        .select('*, turmas(nome_turma)')
        .eq('user_id', user.id)
        .single()

      if (alunoErr || !aluno) {
        setIsLoading(false)
        return
      }

      setAlunoData(aluno)

      const { data: templates } = await supabase
        .from('mensalidades_templates')
        .select('id, valor')
        .eq('aluno_id', aluno.id)

      if (templates && templates.length > 0) {
        const templateIds = templates.map((t) => t.id)
        const { data: geradas } = await supabase
          .from('mensalidades_geradas')
          .select('*, mensalidades_templates(valor)')
          .in('template_id', templateIds)
          .order('data_vencimento', { ascending: false })

        if (geradas) {
          setMensalidades(geradas)

          const geradasIds = geradas.map((g) => g.id)
          const { data: confs } = await supabase
            .from('pagamentos_confirmados')
            .select('mensalidade_id')
            .in('mensalidade_id', geradasIds)

          if (confs) {
            const confMap: Record<string, boolean> = {}
            confs.forEach((c) => {
              confMap[c.mensalidade_id] = true
            })
            setConfirmacoes(confMap)
          }
        }
      }
      setIsLoading(false)
    }

    loadData()
  }, [user])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      if (dateStr.length === 10) {
        const [year, month, day] = dateStr.split('-')
        return `${day}/${month}/${year}`
      }
      return format(parseISO(dateStr), 'dd/MM/yyyy')
    } catch {
      return dateStr
    }
  }

  const pendingPayments = mensalidades.filter(
    (m) => m.status === 'pendente' || m.status === 'atrasado',
  )
  const sortedPending = pendingPayments.sort(
    (a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime(),
  )
  const nextPayment = sortedPending[0]

  const handleConfirmPayment = async () => {
    if (!nextPayment) return
    setIsConfirming(true)

    const { error } = await supabase.from('pagamentos_confirmados').insert({
      mensalidade_id: nextPayment.id,
      metodo_confirmacao: confirmMethod,
    })

    setIsConfirming(false)

    if (!error) {
      toast.success('Confirmação enviada com sucesso!', {
        description: 'A administração analisará seu pagamento.',
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      })
      setConfirmacoes((prev) => ({ ...prev, [nextPayment.id]: true }))
      setIsPaymentDialogOpen(false)
    } else {
      toast.error('Erro ao enviar confirmação de pagamento.')
    }
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'pago':
        return (
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle className="w-3 h-3 mr-1" /> Pago
          </Badge>
        )
      case 'pendente':
        return (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3 mr-1" /> Pendente
          </Badge>
        )
      case 'atrasado':
        return (
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
            <AlertCircle className="w-3 h-3 mr-1" /> Atrasado
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const nextPaymentAmount = nextPayment?.mensalidades_templates?.valor || 0
  const nextPaymentDate = nextPayment ? formatDate(nextPayment.data_vencimento) : '-'
  const nextPaymentStatus = (nextPayment?.status as PaymentStatus) || 'pendente'
  const isAlreadyConfirmed = nextPayment ? confirmacoes[nextPayment.id] : false

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Bem-vindo, {alunoData?.nome || 'Aluno'}
          </h1>
          <p className="text-slate-600 mt-1 font-medium">
            Turma: {(alunoData?.turmas as any)?.nome_turma || 'Sem Turma'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Perfil do Aluno</CardTitle>
            <User className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold text-slate-900 truncate"
              title={alunoData?.nome || 'Aluno'}
            >
              {alunoData?.nome || 'Aluno'}
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />{' '}
              {(alunoData?.turmas as any)?.nome_turma || 'Sem Turma'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Próxima Mensalidade</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {nextPayment ? formatCurrency(nextPaymentAmount) : '-'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-600">
                Vence em: <span className="font-semibold">{nextPaymentDate}</span>
              </span>
              {nextPayment && getStatusBadge(nextPaymentStatus)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col justify-center bg-slate-50 border-dashed">
          <CardContent className="pt-6">
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full h-14 text-lg"
                  size="lg"
                  disabled={!nextPayment || isAlreadyConfirmed}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  {isAlreadyConfirmed ? 'Pagamento em Análise' : 'Confirmar Pagamento'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[95vw] max-w-full">
                <DialogHeader>
                  <DialogTitle>Notificar Pagamento</DialogTitle>
                  <DialogDescription>
                    Informe à administração que você já realizou o pagamento desta mensalidade.
                  </DialogDescription>
                </DialogHeader>
                {nextPayment && (
                  <div className="space-y-4 my-4">
                    <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Valor a pagar:</span>
                        <span className="font-bold text-lg text-primary">
                          {formatCurrency(nextPaymentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Vencimento:</span>
                        <span className="font-medium">{nextPaymentDate}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">
                        Como você enviou o comprovante?
                      </Label>
                      <RadioGroup
                        value={confirmMethod}
                        onValueChange={setConfirmMethod}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem
                            value="comprovante"
                            id="comprovante"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="comprovante"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                          >
                            <Receipt className="mb-3 h-6 w-6 text-slate-600" />
                            <span className="text-sm font-medium">No Sistema</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="whatsapp" id="whatsapp" className="peer sr-only" />
                          <Label
                            htmlFor="whatsapp"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                          >
                            <svg
                              className="mb-3 h-6 w-6 text-emerald-500"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            <span className="text-sm font-medium">Pelo WhatsApp</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
                <DialogFooter className="sm:justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPaymentDialogOpen(false)}
                    disabled={isConfirming}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmPayment} disabled={isConfirming}>
                    {isConfirming ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Confirmar Envio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-center text-slate-500 mt-3 flex items-center justify-center gap-1">
              <Receipt className="w-3 h-3" /> Após pagar, confirme aqui
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-xl">Histórico de Mensalidades</CardTitle>
          <CardDescription>Visualize todas as suas mensalidades geradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="whitespace-nowrap font-semibold">
                    Mês de Referência
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">Valor</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">Vencimento</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">
                    Data de Pagamento
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mensalidades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 h-24">
                      Nenhuma mensalidade encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  mensalidades.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-700 whitespace-nowrap">
                        {payment.mes_referencia}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium whitespace-nowrap">
                        {formatCurrency(payment.mensalidades_templates?.valor || 0)}
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {formatDate(payment.data_vencimento)}
                      </TableCell>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {formatDate(payment.data_pagamento)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          {getStatusBadge(payment.status as PaymentStatus)}
                          {payment.status !== 'pago' && confirmacoes[payment.id] && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-200"
                            >
                              Em Análise
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
