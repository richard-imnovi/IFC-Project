import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogNovoAluno } from './dialog-novo-aluno'
import { TemplateTable } from './template-table'
import { DialogEditarTemplate } from './dialog-editar-template'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export function TemplatesMensalidade() {
  const [templates, setTemplates] = useState<any[]>([])
  const [turmas, setTurmas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [filtroTurma, setFiltroTurma] = useState<string>('all')

  const loadData = async () => {
    setLoading(true)
    const [tRes, tmplRes] = await Promise.all([
      supabase.from('turmas').select('id, nome_turma').order('nome_turma'),
      supabase
        .from('mensalidades_templates')
        .select('*, alunos(*, turmas(nome_turma))')
        .order('created_at', { ascending: false }),
    ])
    if (tRes.data) setTurmas(tRes.data)
    if (tmplRes.data) setTemplates(tmplRes.data)
    setLoading(false)
  }

  const filteredTemplates = templates.filter((t) => {
    if (filtroTurma === 'all') return true
    if (filtroTurma === 'none') return !t.alunos?.turma
    return t.alunos?.turma === filtroTurma
  })

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (tmpl: any) => {
    setEditingTemplate(tmpl)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este template?')) return
    const { error } = await supabase.from('mensalidades_templates').delete().eq('id', id)
    if (error) toast.error('Erro ao excluir')
    else {
      toast.success('Excluído com sucesso')
      loadData()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6">
          <CardTitle>Templates Cadastrados</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label
                htmlFor="filtro-turma"
                className="whitespace-nowrap text-sm text-muted-foreground"
              >
                Filtrar por turma:
              </Label>
              <Select value={filtroTurma} onValueChange={setFiltroTurma}>
                <SelectTrigger id="filtro-turma" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  <SelectItem value="none">Sem turma</SelectItem>
                  {turmas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome_turma}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogNovoAluno turmas={turmas} onCreated={loadData} onTurmaCreated={loadData} />
          </div>
        </CardHeader>
        <CardContent>
          <TemplateTable
            templates={filteredTemplates}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {editingTemplate && (
        <DialogEditarTemplate
          template={editingTemplate}
          turmas={turmas}
          open={!!editingTemplate}
          onOpenChange={(open: boolean) => !open && setEditingTemplate(null)}
          onUpdated={() => {
            setEditingTemplate(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}
