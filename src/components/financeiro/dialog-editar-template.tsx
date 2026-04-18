import { useState } from 'react'
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

export function DialogEditarTemplate({
  template,
  open,
  onOpenChange,
  onUpdated,
}: {
  template: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}) {
  const [valor, setValor] = useState(template.valor.toString())
  const [diaVencimento, setDiaVencimento] = useState(template.dia_vencimento.toString())
  const [statusCurso, setStatusCurso] = useState(template.alunos?.status_curso || 'ativo')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error: errorAluno } = await supabase
      .from('alunos')
      .update({ status_curso: statusCurso })
      .eq('id', template.aluno_id)

    if (errorAluno) {
      toast.error('Erro ao atualizar status do aluno')
      setLoading(false)
      return
    }

    const { error: errorTemplate } = await supabase
      .from('mensalidades_templates')
      .update({
        valor: Number(valor),
        dia_vencimento: Number(diaVencimento),
        status_template: statusCurso === 'ativo' ? 'ativo' : 'inativo',
      })
      .eq('id', template.id)

    setLoading(false)

    if (errorTemplate) {
      toast.error('Erro ao atualizar mensalidade')
    } else {
      toast.success('Atualizado com sucesso')
      onUpdated()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Mensalidade - {template.alunos?.nome}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Valor Mensalidade (R$)</Label>
            <Input
              type="number"
              step="0.01"
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Dia de Vencimento</Label>
            <Select value={diaVencimento} onValueChange={setDiaVencimento}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
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
          <Button type="submit" disabled={loading} className="w-full">
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
