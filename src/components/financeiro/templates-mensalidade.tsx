import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogNovoAluno } from './dialog-novo-aluno'
import { TemplateTable } from './template-table'
import { DialogEditarTemplate } from './dialog-editar-template'

export function TemplatesMensalidade() {
  const [templates, setTemplates] = useState<any[]>([])
  const [turmas, setTurmas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)

  const loadData = async () => {
    setLoading(true)
    const [tRes, tmplRes] = await Promise.all([
      supabase.from('turmas').select('id, nome_turma').order('nome_turma'),
      supabase.from('mensalidades_templates').select('*, alunos(nome, status_curso)'),
    ])
    if (tRes.data) setTurmas(tRes.data)
    if (tmplRes.data) setTemplates(tmplRes.data)
    setLoading(false)
  }

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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle>Templates Cadastrados</CardTitle>
          <DialogNovoAluno turmas={turmas} onCreated={loadData} onTurmaCreated={loadData} />
        </CardHeader>
        <CardContent>
          <TemplateTable
            templates={templates}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {editingTemplate && (
        <DialogEditarTemplate
          template={editingTemplate}
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
          onUpdated={() => {
            setEditingTemplate(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}
