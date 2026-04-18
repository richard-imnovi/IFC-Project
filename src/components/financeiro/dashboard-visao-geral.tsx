import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, isBefore, startOfDay, parseISO } from 'date-fns'
import { Loader2, DollarSign, TrendingUp, AlertCircle, Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { VisaoGeralCharts } from './visao-geral-charts'

export function DashboardVisaoGeral() {
  const [mensalidades, setMensalidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  const currentMonthStr = format(new Date(), 'MM/yyyy')

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('mensalidades_geradas')
      .select(`
        id,
        data_vencimento,
        data_pagamento,
        status,
        mes_referencia,
        mensalidades_templates (
          valor,
          alunos (
            nome,
            turmas (
              nome_turma
            )
          )
        )
      `)
      .eq('mes_referencia', currentMonthStr)
      .order('data_vencimento', { ascending: true })

    if (data) {
      const processed = data.map((m) => {
        const vencimento = parseISO(m.data_vencimento)
        const hoje = startOfDay(new Date())
        let calculatedStatus = m.status

        if (m.status !== 'pago' && !m.data_pagamento) {
          if (isBefore(vencimento, hoje)) {
            calculatedStatus = 'atrasado'
          } else {
            calculatedStatus = 'em dia'
          }
        } else {
          calculatedStatus = 'pago'
        }

        const template = Array.isArray(m.mensalidades_templates)
          ? m.mensalidades_templates[0]
          : m.mensalidades_templates

        const aluno = template?.alunos
        const turma = aluno?.turmas

        return {
          ...m,
          calculatedStatus,
          valor: template?.valor || 0,
          alunoNome: aluno?.nome || 'Desconhecido',
          turmaNome: turma?.nome_turma || 'Sem Turma',
        }
      })
      setMensalidades(processed)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('mensalidades_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mensalidades_geradas' },
        () => {
          fetchData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const totalEsperado = mensalidades.reduce((acc, curr) => acc + Number(curr.valor), 0)
  const totalPago = mensalidades
    .filter((m) => m.calculatedStatus === 'pago')
    .reduce((acc, curr) => acc + Number(curr.valor), 0)
  const totalAtrasado = mensalidades
    .filter((m) => m.calculatedStatus === 'atrasado')
    .reduce((acc, curr) => acc + Number(curr.valor), 0)
  const pendingTotal = mensalidades
    .filter((m) => m.calculatedStatus === 'em dia' || m.calculatedStatus === 'pendente')
    .reduce((acc, curr) => acc + Number(curr.valor), 0)

  const filteredMensalidades = mensalidades.filter((m) => {
    const matchStatus = filtroStatus === 'todos' || m.calculatedStatus === filtroStatus
    const matchBusca =
      m.alunoNome.toLowerCase().includes(busca.toLowerCase()) ||
      m.turmaNome.toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchBusca
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Esperada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalEsperado.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Mês atual ({currentMonthStr})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Arrecadada</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">R$ {totalPago.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Mês atual ({currentMonthStr})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totalAtrasado.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Mês atual ({currentMonthStr})</p>
          </CardContent>
        </Card>
      </div>

      {!loading && mensalidades.length > 0 && (
        <VisaoGeralCharts
          totalEsperado={totalEsperado}
          totalPago={totalPago}
          totalAtrasado={totalAtrasado}
          pendingTotal={pendingTotal}
        />
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6">
          <CardTitle>Mensalidades de {currentMonthStr}</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar aluno ou turma..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label
                htmlFor="filtro-status"
                className="whitespace-nowrap text-sm text-muted-foreground"
              >
                Status:
              </Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger id="filtro-status" className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="em dia">Em dia</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredMensalidades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhuma mensalidade encontrada para os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMensalidades.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-slate-700">{m.alunoNome}</TableCell>
                    <TableCell className="text-slate-600">{m.turmaNome}</TableCell>
                    <TableCell>R$ {Number(m.valor).toFixed(2)}</TableCell>
                    <TableCell>{format(parseISO(m.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          m.calculatedStatus === 'pago' &&
                            'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent',
                          m.calculatedStatus === 'atrasado' &&
                            'bg-red-500 hover:bg-red-600 text-white border-transparent',
                          m.calculatedStatus === 'em dia' &&
                            'bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent',
                        )}
                        variant={m.calculatedStatus === 'atrasado' ? 'destructive' : 'default'}
                      >
                        {m.calculatedStatus.toUpperCase()}
                      </Badge>
                    </TableCell>
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
