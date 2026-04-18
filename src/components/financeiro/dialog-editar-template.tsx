import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Loader2 } from 'lucide-react'

export function DialogEditarTemplate({
  template,
  open,
  onOpenChange,
  onUpdated,
  turmas = [],
}: any) {
  const [loading, setLoading] = useState(false)
  const [valor, setValor] = useState('')
  const [diaVencimento, setDiaVencimento] = useState('')
  const [status, setStatus] = useState('ativo')
  const [statusCurso, setStatusCurso] = useState('ativo')
  const [turma, setTurma] = useState('none')
  const [nomeAluno, setNomeAluno] = useState('')

  useEffect(() => {
    if (template && open) {
      setValor(template.valor?.toString() || '')
      setDiaVencimento(template.dia_vencimento?.toString() || '')
      setStatus(template.status_template || 'ativo')
      setStatusCurso(template.alunos?.status_curso || 'ativo')
      setTurma(template.alunos?.turma || 'none')
      setNomeAluno(template.alunos?.nome || '')
    }
  }, [template, open])

  const handleSave = async () => {
    if (!valor || !diaVencimento || !nomeAluno) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setLoading(true)

    // Atualiza os dados do aluno primeiro (incluindo a turma)
    const { error: errorAluno } = await supabase
      .from('alunos')
      .update({
        nome: nomeAluno,
        turma: turma === 'none' ? null : turma,
        status_curso: statusCurso,
      })
      .eq('id', template.aluno_id)

    if (errorAluno) {
      toast.error('Erro ao atualizar aluno')
      setLoading(false)
      return
    }

    // Atualiza a mensalidade
    const { error: errorTemplate } = await supabase
      .from('mensalidades_templates')
      .update({
        valor: Number(valor),
        dia_vencimento: Number(diaVencimento),
        status_template: status,
      })
      .eq('id', template.id)

    if (errorTemplate) {
      toast.error('Erro ao atualizar mensalidade')
    } else {
      toast.success('Atualizado com sucesso')
      onUpdated()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Aluno e Mensalidade</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome do Aluno</Label>
            <Input
              value={nomeAluno}
              onChange={(e) => setNomeAluno(e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label>Turma</Label>
            <Select value={turma} onValueChange={setTurma}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem turma</SelectItem>
                {turmas.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome_turma}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input type="number" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Dia de Venc.</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status do Curso</Label>
              <Select value={statusCurso} onValueChange={setStatusCurso}>
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
            <div className="space-y-2">
              <Label>Status do Template</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
