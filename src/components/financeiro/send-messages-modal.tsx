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
import { MessageCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

  const templatePadrao =
    'Olá {{nome}}, tudo bem?\n\nVerificamos que sua mensalidade no valor de {{valor}} com vencimento em {{vencimento}} encontra-se em atraso.\n\nPara realizar o pagamento via PIX, utilize a nossa chave: 12.345.678/0001-90 (CNPJ).\n\nQualquer dúvida, estamos à disposição!'

  useEffect(() => {
    if (open) {
      fetchAtrasados()
      fetchTemplate()
    }
  }, [open])

  const fetchTemplate = async () => {
    const { data } = await supabase
      .from('configuracoes_mensagens')
      .select('texto')
      .eq('tipo', 'cobranca_atraso')
      .single()

    if (data?.texto) {
      setMessage(data.texto)
    } else {
      setMessage(templatePadrao)
    }
  }

  const fetchAtrasados = async () => {
    setLoadingData(true)
    const hoje = new Date().toISOString().split('T')[0]

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
            whatsapp
          )
        )
      `)
      .in('status', ['pendente', 'atrasado'])
      .lt('data_vencimento', hoje)

    if (error) {
      console.error(error)
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

          return {
            mensalidade_id: m.id,
            data_vencimento: m.data_vencimento,
            valor: tpl?.valor,
            aluno_id: aluno?.id,
            nome: aluno?.nome,
            whatsapp: aluno?.whatsapp,
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
    if (!message.trim()) {
      toast({ title: 'A mensagem não pode estar vazia', variant: 'destructive' })
      return
    }

    setLoading(true)
    let sent = 0
    let errors = 0

    const selectedAlunos = alunos.filter((a) => selected.includes(a.mensalidade_id))

    for (const aluno of selectedAlunos) {
      const [year, month, day] = aluno.data_vencimento.split('-')
      const dataVencimentoFormatada = `${day}/${month}/${year}`
      const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(aluno.valor)

      const msgPersonalizada = message
        .replace(/{{nome}}/g, aluno.nome)
        .replace(/{{valor}}/g, valorFormatado)
        .replace(/{{vencimento}}/g, dataVencimentoFormatada)

      try {
        const { error } = await supabase.functions.invoke('send_whatsapp_message', {
          body: {
            phone_number: aluno.whatsapp,
            message_text: msgPersonalizada,
            message_type: 'cobranca_atraso',
          },
        })

        if (error) throw error

        await supabase.from('logs_mensagens').insert({
          mensalidade_id: aluno.mensalidade_id,
          aluno_nome: aluno.nome,
          whatsapp: aluno.whatsapp,
          tipo_mensagem: 'cobranca_atraso',
          status: 'sucesso',
        })

        sent++
      } catch (error: any) {
        console.error(`Erro ao enviar para ${aluno.nome}:`, error)
        await supabase.from('logs_mensagens').insert({
          mensalidade_id: aluno.mensalidade_id,
          aluno_nome: aluno.nome,
          whatsapp: aluno.whatsapp,
          tipo_mensagem: 'cobranca_atraso',
          status: 'falha',
          erro: error.message,
        })
        errors++
      }
    }

    setLoading(false)
    setOpen(false)

    toast({
      title: 'Envio concluído',
      description: `${sent} mensagens enviadas com sucesso.${errors > 0 ? ` ${errors} falhas.` : ''}`,
      variant: errors > 0 ? 'destructive' : 'default',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Cobrar Atrasados</span>
            <span className="inline sm:hidden">Cobrar</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enviar Cobrança - Alunos Atrasados</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Alunos em atraso</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                disabled={loadingData || alunos.length === 0}
              >
                {selected.length === alunos.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </Button>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : alunos.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-md">
                Nenhum aluno com mensalidade em atraso encontrado.
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
                    />
                    <div
                      className="grid gap-1.5 leading-none cursor-pointer flex-1"
                      onClick={() => toggleSelect(aluno.mensalidade_id)}
                    >
                      <label className="text-sm font-medium leading-none cursor-pointer">
                        {aluno.nome}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Venceu em: {aluno.data_vencimento.split('-').reverse().join('/')} -{' '}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(aluno.valor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Mensagem</h4>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px]"
              placeholder="Digite a mensagem..."
            />
            <p className="text-xs text-slate-500">
              Variáveis disponíveis: {'{{nome}}'}, {'{{valor}}'}, {'{{vencimento}}'}
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
