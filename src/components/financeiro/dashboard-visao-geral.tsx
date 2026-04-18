import { useState, useEffect, useMemo } from 'react'
import { Filter, Loader2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { VisaoGeralStats } from './visao-geral-stats'
import { VisaoGeralTable } from './visao-geral-table'

type FinanceiroStudent = {
  id: string
  name: string
  turma: string
  turmaId: string
  status: 'em_dia' | 'atrasado'
  fee: number
}

export function DashboardVisaoGeral() {
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
        id, nome, turma, turmas (nome_turma),
        mensalidades_templates (valor, mensalidades_geradas (status))
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
          if (geradas.some((g: any) => g.status === 'atrasado')) status = 'atrasado'
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

  const handleSendMessage = (studentName: string) => {
    toast.success(`Mensagem enviada para ${studentName}`, {
      icon: <MessageCircle className="h-5 w-5 text-primary" />,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <VisaoGeralStats stats={stats} />

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
            <VisaoGeralTable students={filteredStudents} onSendMessage={handleSendMessage} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
