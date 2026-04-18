import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Filter,
  BookOpen,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'

type FinanceiroStudent = {
  id: string
  name: string
  turma: string
  turmaId: string
  status: 'em_dia' | 'atrasado'
  fee: number
}

export default function Financeiro() {
  const [selectedTurma, setSelectedTurma] = useState<string>('todas')
  const [students, setStudents] = useState<FinanceiroStudent[]>([])
  const [turmas, setTurmas] = useState<{ id: string; nome_turma: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)

    const { data: turmasData } = await supabase
      .from('turmas')
      .select('id, nome_turma')
      .order('nome_turma')
    if (turmasData) setTurmas(turmasData)

    const { data: alunosData } = await supabase.from('alunos').select(`
        id,
        nome,
        turma,
        turmas (nome_turma),
        mensalidades_templates (
          valor,
          mensalidades_geradas (
            status
          )
        )
      `)

    if (alunosData) {
      const mappedStudents: FinanceiroStudent[] = alunosData.map((aluno) => {
        const templates = (aluno.mensalidades_templates as any[]) || []
        const activeTemplate = templates[0]

        let fee = 0
        let status: 'em_dia' | 'atrasado' = 'em_dia'

        if (activeTemplate) {
          fee = activeTemplate.valor
          const geradas = activeTemplate.mensalidades_geradas || []
          const hasAtrasado = geradas.some((g: any) => g.status === 'atrasado')
          if (hasAtrasado) status = 'atrasado'
        }

        return {
          id: aluno.id,
          name: aluno.nome,
          turma: (aluno.turmas as any)?.nome_turma || 'Sem Turma',
          turmaId: aluno.turma || '',
          status,
          fee,
        }
      })
      setStudents(mappedStudents)
    }

    setIsLoading(false)
  }

  const filteredStudents = useMemo(() => {
    if (selectedTurma === 'todas') return students
    return students.filter((s) => s.turmaId === selectedTurma)
  }, [selectedTurma, students])

  const stats = useMemo(() => {
    return {
      total: students.length,
      emDia: students.filter((s) => s.status === 'em_dia').length,
      atrasados: students.filter((s) => s.status === 'atrasado').length,
    }
  }, [students])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const handleSendMessage = (studentName: string) => {
    toast.success(`Mensagem enviada para ${studentName}`, {
      icon: <MessageCircle className="h-5 w-5 text-primary" />,
    })
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Financeiro</h1>
          <p className="text-slate-600 mt-1">Visão geral e gestão de pagamentos dos alunos.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/turmas">
            <BookOpen className="w-4 h-4 mr-2" /> Gerenciar Turmas
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Em dia</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.emDia}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Atrasados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.atrasados}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <CardTitle className="text-xl">Lista de Alunos</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Turmas</SelectItem>
                {turmas.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome_turma}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Nome do Aluno</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Valor da Mensalidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum aluno encontrado para este filtro.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium text-slate-600">{student.turma}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        {student.status === 'em_dia' ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            Em dia
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-red-200 bg-red-50 text-red-700"
                          >
                            Atrasado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatCurrency(student.fee)}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.status === 'atrasado' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSendMessage(student.name)}
                            className="h-8"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Enviar Mensagem</span>
                            <span className="inline sm:hidden">Mensagem</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
