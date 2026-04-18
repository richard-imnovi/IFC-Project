import { useState } from 'react'
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
import { createUser } from '@/services/create-user'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [turma, setTurma] = useState<string>('none')
  const [valor, setValor] = useState('450.00')
  const [diaVencimento, setDiaVencimento] = useState('10')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      nome,
      email,
      password: senha,
      whatsapp,
      turma: turma === 'none' ? null : turma,
      valor: Number(valor),
      dia_vencimento: Number(diaVencimento),
    }

    const { error } = await createUser(payload)
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Erro ao cadastrar aluno')
      return
    }

    toast.success('Aluno cadastrado com sucesso')
    setOpen(false)
    setNome('')
    setEmail('')
    setSenha('')
    setWhatsapp('')
    setTurma('none')
    setValor('450.00')
    setDiaVencimento('10')
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="default" size="sm">
          Novo Aluno
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col p-0 sm:max-w-[425px]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Novo Aluno</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
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

            <div className="pt-2 border-t mt-4 mb-2">
              <Label className="text-base font-semibold mb-4 block mt-2">
                Dados da Mensalidade
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dia de Venc.</Label>
                  <Select value={diaVencimento} onValueChange={setDiaVencimento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Dia" />
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
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4">
              Salvar Aluno
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
