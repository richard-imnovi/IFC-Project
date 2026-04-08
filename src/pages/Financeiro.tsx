import { useState, useMemo } from 'react'
import { Users, CheckCircle, AlertCircle, MessageCircle, Filter } from 'lucide-react'
import { toast } from 'sonner'

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

type Student = {
  id: string
  name: string
  turma: string
  turmaId: string
  status: 'em_dia' | 'atrasado'
  fee: number
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Ana Silva',
    turma: 'Turma A - Manhã',
    turmaId: 'turma-a',
    status: 'em_dia',
    fee: 450,
  },
  {
    id: '2',
    name: 'Carlos Santos',
    turma: 'Turma B - Tarde',
    turmaId: 'turma-b',
    status: 'atrasado',
    fee: 450,
  },
  {
    id: '3',
    name: 'Beatriz Costa',
    turma: 'Turma A - Manhã',
    turmaId: 'turma-a',
    status: 'em_dia',
    fee: 450,
  },
  {
    id: '4',
    name: 'Daniel Oliveira',
    turma: 'Turma C - Noite',
    turmaId: 'turma-c',
    status: 'atrasado',
    fee: 500,
  },
  {
    id: '5',
    name: 'Eduarda Lima',
    turma: 'Turma B - Tarde',
    turmaId: 'turma-b',
    status: 'em_dia',
    fee: 450,
  },
  {
    id: '6',
    name: 'Felipe Mendes',
    turma: 'Turma C - Noite',
    turmaId: 'turma-c',
    status: 'em_dia',
    fee: 500,
  },
  {
    id: '7',
    name: 'Gabriel Souza',
    turma: 'Turma A - Manhã',
    turmaId: 'turma-a',
    status: 'atrasado',
    fee: 450,
  },
  {
    id: '8',
    name: 'Helena Rocha',
    turma: 'Turma B - Tarde',
    turmaId: 'turma-b',
    status: 'em_dia',
    fee: 450,
  },
]

export default function Financeiro() {
  const [selectedTurma, setSelectedTurma] = useState<string>('todas')

  const filteredStudents = useMemo(() => {
    if (selectedTurma === 'todas') return mockStudents
    return mockStudents.filter((s) => s.turmaId === selectedTurma)
  }, [selectedTurma])

  const stats = useMemo(() => {
    return {
      total: mockStudents.length,
      emDia: mockStudents.filter((s) => s.status === 'em_dia').length,
      atrasados: mockStudents.filter((s) => s.status === 'atrasado').length,
    }
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
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
                <SelectItem value="turma-a">Turma A - Manhã</SelectItem>
                <SelectItem value="turma-b">Turma B - Tarde</SelectItem>
                <SelectItem value="turma-c">Turma C - Noite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
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
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                          Atrasado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">{formatCurrency(student.fee)}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
