import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DialogNovoAluno } from './dialog-novo-aluno'
import { TemplateTable } from './template-table'

export function TemplatesMensalidade() {
  const [templates, setTemplates] = useState<any[]>([])
  const [alunos, setAlunos] = useState<any[]>([])
  const [turmas, setTurmas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    id: '',
    aluno_id: '',
    valor: '',
    dia_vencimento: '',
    status_curso: 'ativo',
  })

  const loadData = async () => {
    setLoading(true)
    const [tRes, aRes, tmplRes] = await Promise.all([
      supabase.from('turmas').select('id, nome_turma').order('nome_turma'),
      supabase.from('alunos').select('id, nome, status_curso').order('nome'),
      supabase.from('mensalidades_templates').select('*, alunos(nome, status_curso)'),
    ])
    if (tRes.data) setTurmas(tRes.data)
    if (aRes.data) setAlunos(aRes.data)
    if (tmplRes.data) setTemplates(tmplRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (tmpl: any) => {
    setForm({
      id: tmpl.id,
      aluno_id: tmpl.aluno_id,
      valor: tmpl.valor.toString(),
      dia_vencimento: tmpl.dia_vencimento.toString(),
      status_curso: tmpl.alunos?.status_curso || 'ativo',
    })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.aluno_id) return toast.error('Selecione um aluno')
    setSubmitting(true)

    await supabase
      .from('alunos')
      .update({ status_curso: form.status_curso })
      .eq('id', form.aluno_id)

    const payload = {
      aluno_id: form.aluno_id,
      valor: Number(form.valor),
      dia_vencimento: Number(form.dia_vencimento),
      status_template: form.status_curso === 'ativo' ? 'ativo' : 'inativo',
    }

    if (form.id) {
      const { error } = await supabase
        .from('mensalidades_templates')
        .update(payload)
        .eq('id', form.id)
      if (error) toast.error('Erro ao atualizar')
      else toast.success('Atualizado com sucesso')
    } else {
      const { error } = await supabase.from('mensalidades_templates').insert(payload)
      if (error) toast.error('Erro ao criar')
      else toast.success('Criado com sucesso')
    }

    setForm({ id: '', aluno_id: '', valor: '', dia_vencimento: '', status_curso: 'ativo' })
    setSubmitting(false)
    loadData()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-4">
          <CardTitle>Template</CardTitle>
          <DialogNovoAluno turmas={turmas} onCreated={loadData} onTurmaCreated={loadData} />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Aluno</Label>
              <Select
                value={form.aluno_id}
                onValueChange={(v) => {
                  const aluno = alunos.find((a) => a.id === v)
                  setForm({ ...form, aluno_id: v, status_curso: aluno?.status_curso || 'ativo' })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor Mensalidade (R$)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Dia de Vencimento</Label>
              <Select
                value={form.dia_vencimento}
                onValueChange={(v) => setForm({ ...form, dia_vencimento: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status do Curso</Label>
              <Select
                value={form.status_curso}
                onValueChange={(v) => setForm({ ...form, status_curso: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="concluído">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button type="submit" disabled={submitting} className="w-full">
                {form.id ? 'Atualizar Template' : 'Salvar Template'}
              </Button>
              {form.id && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setForm({
                      id: '',
                      aluno_id: '',
                      valor: '',
                      dia_vencimento: '',
                      status_curso: 'ativo',
                    })
                  }
                >
                  Cancelar Edição
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Templates Cadastrados</CardTitle>
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
    </div>
  )
}
