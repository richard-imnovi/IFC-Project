import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { DialogNovaTurma } from './dialog-nova-turma'

export function DialogNovoAluno({
  turmas,
  onCreated,
  onTurmaCreated,
}: {
  turmas: any[]
  onCreated: () => void
  onTurmaCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [turma, setTurma] = useState<string>('none')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: any = {
      nome,
      whatsapp,
      status_curso: 'ativo',
    }
    if (turma !== 'none') payload.turma = turma

    const { error } = await supabase.from('alunos').insert(payload)
    setLoading(false)

    if (error) {
      toast.error('Erro ao cadastrar aluno')
      return
    }

    toast.success('Aluno cadastrado com sucesso')
    setOpen(false)
    setNome('')
    setWhatsapp('')
    setTurma('none')
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Novo Aluno
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Aluno</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Turma</Label>
              <DialogNovaTurma onCreated={onTurmaCreated} />
            </div>
            <Select value={turma} onValueChange={setTurma}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem Turma</SelectItem>
                {turmas.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome_turma}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
