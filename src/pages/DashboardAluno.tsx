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
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'

type PaymentStatus = 'pago' | 'pendente' | 'atrasado'

export default function DashboardAluno() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [alunoData, setAlunoData] = useState<any>(null)
  const [mensalidades, setMensalidades] = useState<any[]>([])

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
        }
      }
      setIsLoading(false)
    }

    loadData()
  }, [user])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatDate = (dateStr: string) => {
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
  const paymentHistory = mensalidades.filter((m) => m.status === 'pago')

  const handleConfirmPayment = async () => {
    if (!nextPayment) return
    setIsPaymentDialogOpen(false)

    const currentDate = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('mensalidades_geradas')
      .update({ status: 'pago', data_pagamento: currentDate })
      .eq('id', nextPayment.id)

    if (!error) {
      toast.success('Pagamento confirmado com sucesso!', {
        description: 'O comprovante foi enviado para o seu e-mail.',
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      })
      setMensalidades((prev) =>
        prev.map((m) =>
          m.id === nextPayment.id ? { ...m, status: 'pago', data_pagamento: currentDate } : m,
        ),
      )
    } else {
      toast.error('Erro ao confirmar pagamento.')
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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard do Aluno</h1>
          <p className="text-slate-600 mt-1">Acompanhe suas informações e pagamentos.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Perfil do Aluno</CardTitle>
            <User className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{alunoData?.nome || 'Aluno'}</div>
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
                <Button className="w-full h-14 text-lg" size="lg" disabled={!nextPayment}>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Confirmar Pagamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirmar Pagamento</DialogTitle>
                  <DialogDescription>
                    Revise os detalhes da sua próxima mensalidade antes de confirmar.
                  </DialogDescription>
                </DialogHeader>
                {nextPayment && (
                  <div className="bg-slate-50 p-4 rounded-lg border space-y-3 my-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Valor a pagar:</span>
                      <span className="font-bold text-lg">{formatCurrency(nextPaymentAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Vencimento:</span>
                      <span className="font-medium">{nextPaymentDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Beneficiário:</span>
                      <span className="font-medium">EduTech Instituição de Ensino</span>
                    </div>
                  </div>
                )}
                <DialogFooter className="sm:justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmPayment}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <p className="text-xs text-center text-slate-500 mt-3 flex items-center justify-center gap-1">
              <Receipt className="w-3 h-3" /> Pague via Pix ou Boleto
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Histórico de Pagamentos</CardTitle>
          <CardDescription>Visualize suas últimas mensalidades pagas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data de Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-500 h-24">
                    Nenhum pagamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {formatDate(payment.data_vencimento)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatCurrency(payment.mensalidades_templates?.valor || 0)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status as PaymentStatus)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
