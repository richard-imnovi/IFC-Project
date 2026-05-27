import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'

export function SendMessagesModal({
  children,
  preSelectedAluno,
}: {
  children?: React.ReactNode
  preSelectedAluno?: string
}) {
  const [open, setOpen] = useState(false)
  const [alunos, setAlunos] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const { toast } = useToast()

  const defaultTemplate =
    'Olá [NOME], sua mensalidade está atrasada. Favor regularizar o pagamento. Valor: R$ [VALOR]. Vencimento: [DATA]. Pix: [CHAVE_PIX]'

  const chavePix = '12.345.678/0001-90'

  useEffect(() => {
    if (open) {
      fetchAtrasados()
      setMessage('')
    }
  }, [open])

  const fetchAtrasados = async () => {
    setLoadingData(true)
    const hoje = startOfDay(new Date())
    const hojeStr = hoje.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('mensalidades_geradas')
      .select(`
        id,
        data_vencimento,
        status,
        mensalidades_templates (
          valor,
          alunos (
            id,
            nome,
            whatsapp,
            turmas (
              nome_turma
            )
          )
        )
      `)
      .in('status', ['pendente', 'atrasado'])
      .lt('data_vencimento', hojeStr)

    if (error) {
      console.error(error)
      toast({ title: 'Erro ao carregar alunos. Tente novamente.', variant: 'destructive' })
      setLoadingData(false)
      return
    }

    const formatted =
      data
        ?.map((m: any) => {
          const tpl = Array.isArray(m.mensalidades_templates)
            ? m.mensalidades_templates[0]
            : m.mensalidades_templates
          const aluno = Array.isArray(tpl?.alunos) ? tpl.alunos[0] : tpl?.alunos
          const turma = Array.isArray(aluno?.turmas) ? aluno.turmas[0] : aluno?.turmas

          const daysInArrears = differenceInDays(hoje, startOfDay(parseISO(m.data_vencimento)))

          return {
            mensalidade_id: m.id,
            data_vencimento: m.data_vencimento,
            valor: tpl?.valor,
            aluno_id: aluno?.id,
            nome: aluno?.nome,
            whatsapp: aluno?.whatsapp,
            turma_nome: turma?.nome_turma || 'Sem Turma',
            days_in_arrears: daysInArrears > 0 ? daysInArrears : 0,
          }
        })
        .filter((a: any) => a.whatsapp) || []

    setAlunos(formatted)

    if (preSelectedAluno) {
      const preSelected = formatted
        .filter((a: any) => a.nome === preSelectedAluno)
        .map((a: any) => a.mensalidade_id)
      if (preSelected.length > 0) {
        setSelected(preSelected)
      } else {
        setSelected(formatted.map((a: any) => a.mensalidade_id))
      }
    } else {
      setSelected(formatted.map((a: any) => a.mensalidade_id))
    }

    setLoadingData(false)
  }

  const toggleSelectAll = () => {
    if (selected.length === alunos.length) {
      setSelected([])
    } else {
      setSelected(alunos.map((a) => a.mensalidade_id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const handleSend = async () => {
    if (selected.length === 0) {
      toast({ title: 'Nenhum aluno selecionado', variant: 'destructive' })
      return
    }

    setLoading(true)
    let sent = 0
    let errors = 0

    const finalMessageTemplate = message.trim() ? message : defaultTemplate

    const selectedAlunos = alunos.filter((a) => selected.includes(a.mensalidade_id))

    for (const aluno of selectedAlunos) {
      const [year, month, day] = aluno.data_vencimento.split('-')
      const dataVencimentoFormatada = `${day}/${month}/${year}`
      const valorFormatado = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(aluno.valor || 0)

      const msgPersonalizada = finalMessageTemplate
        .replace(/\[NOME\]/g, aluno.nome || '')
        .replace(/\[VALOR\]/g, valorFormatado)
        .replace(/\[DATA\]/g, dataVencimentoFormatada)
        .replace(/\[CHAVE_PIX\]/g, chavePix)

      try {
        const { error, data } = await supabase.functions.invoke('send_whatsapp_evolution', {
          body: {
            phone_number: aluno.whatsapp,
            message_text: msgPersonalizada,
            message_type: 'mensagem_customizada',
          },
        })

        if (error || (data && data.error)) {
          throw new Error(error?.message || data?.error || 'Unknown error')
        }

        await supabase.from('logs_mensagens').insert({
          mensalidade_id: aluno.mensalidade_id,
          aluno_nome: aluno.nome || 'Desconhecido',
          whatsapp: aluno.whatsapp,
          tipo_mensagem: 'mensagem_customizada',
          status: 'sucesso',
        })

        sent++
      } catch (error: any) {
        console.error(`Erro ao enviar para ${aluno.nome}:`, error)
        await supabase.from('logs_mensagens').insert({
          mensalidade_id: aluno.mensalidade_id,
          aluno_nome: aluno.nome || 'Desconhecido',
          whatsapp: aluno.whatsapp,
          tipo_mensagem: 'mensagem_customizada',
          status: 'falha',
          erro: error.message,
        })
        errors++
        toast({
          title: `Erro ao enviar para ${aluno.nome}. Tente novamente.`,
          variant: 'destructive',
        })
      }
    }

    setLoading(false)

    if (sent > 0) {
      toast({
        title: `Mensagens enviadas para ${sent} alunos`,
      })
      if (errors === 0) {
        setOpen(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Enviar Mensagem para Atrasados</span>
            <span className="inline sm:hidden">Cobrar</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enviar Mensagem para Alunos Atrasados</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Alunos em atraso</h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  disabled={loading || loadingData || alunos.length === 0}
                >
                  {selected.length === alunos.length ? 'Desselecionar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : alunos.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-md">
                Nenhum aluno atrasado no momento.
              </div>
            ) : (
              <div className="space-y-2 border rounded-md p-2 max-h-48 overflow-y-auto">
                {alunos.map((aluno) => (
                  <div
                    key={aluno.mensalidade_id}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded-md"
                  >
                    <Checkbox
                      id={`aluno-${aluno.mensalidade_id}`}
                      checked={selected.includes(aluno.mensalidade_id)}
                      onCheckedChange={() => toggleSelect(aluno.mensalidade_id)}
                      disabled={loading}
                    />
                    <div
                      className="grid gap-1.5 leading-none cursor-pointer flex-1"
                      onClick={() => !loading && toggleSelect(aluno.mensalidade_id)}
                    >
                      <label className="text-sm font-medium leading-none cursor-pointer">
                        {aluno.nome}{' '}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          ({aluno.turma_nome})
                        </span>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {aluno.days_in_arrears} dias de atraso | Venceu em:{' '}
                        {aluno.data_vencimento.split('-').reverse().join('/')} |{' '}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(aluno.valor || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mensagem (opcional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              placeholder={defaultTemplate}
              disabled={loading}
            />
            <p className="text-xs text-slate-500">
              Variáveis disponíveis: [NOME], [VALOR], [DATA], [CHAVE_PIX]
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={loading || selected.length === 0}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enviar {selected.length > 0 ? `(${selected.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
