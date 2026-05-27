import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Send, Check, ChevronsUpDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

export function EnvioManual() {
  const [alunos, setAlunos] = useState<any[]>([])
  const [selectedAluno, setSelectedAluno] = useState<string>('')
  const [openCombobox, setOpenCombobox] = useState(false)
  const [messageType, setMessageType] = useState<string>('')
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const [tpl3Dias, setTpl3Dias] = useState('')
  const [tplVencimento, setTplVencimento] = useState('')

  useEffect(() => {
    fetchAlunos()
    fetchTemplates()
  }, [])

  const fetchAlunos = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, whatsapp')
        .order('nome')
      if (error) throw error
      if (data) setAlunos(data)
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.from('configuracoes_mensagens').select('*')
      if (error) throw error
      if (data) {
        const t3 = data.find((d: any) => d.tipo === 'lembrete_3_dias')
        const tv = data.find((d: any) => d.tipo === 'lembrete_vencimento')
        if (t3) setTpl3Dias(t3.texto)
        if (tv) setTplVencimento(tv.texto)
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error)
    }
  }

  const handleMessageTypeChange = (val: string) => {
    setMessageType(val)
    if (val === 'lembrete_3_dias') {
      setMessageText(tpl3Dias)
    } else if (val === 'lembrete_vencimento') {
      setMessageText(tplVencimento)
    } else {
      setMessageText('')
    }
  }

  const handleSend = async () => {
    const aluno = alunos.find((a) => a.id === selectedAluno)
    if (!aluno || !aluno.whatsapp) {
      toast({ title: 'Selecione um aluno com WhatsApp válido', variant: 'destructive' })
      return
    }
    if (!messageType || !messageText) {
      toast({ title: 'Preencha o tipo e o texto da mensagem', variant: 'destructive' })
      return
    }

    setSending(true)
    try {
      const { data, error } = await supabase.functions.invoke('send_whatsapp_evolution', {
        body: {
          phone_number: aluno.whatsapp,
          message_text: messageText,
          message_type: messageType,
        },
      })

      if (error) throw error
      if (data?.error) {
        if (data.error === 'Chave de API inválida' || data.error.includes('401')) {
          throw new Error('Erro: Chave de API inválida (verifique os Secrets)')
        }
        if (data.error === 'Instância não encontrada' || data.error.includes('404')) {
          throw new Error('Erro: Instância do WhatsApp não encontrada')
        }
        throw new Error(data.error)
      }

      await supabase.from('logs_mensagens').insert({
        aluno_nome: aluno.nome,
        whatsapp: aluno.whatsapp,
        tipo_mensagem: messageType,
        status: 'sucesso',
      })

      toast({ title: 'Mensagem enviada com sucesso!' })
      setMessageText('')
      setMessageType('')
      setSelectedAluno('')
    } catch (err: any) {
      try {
        await supabase.from('logs_mensagens').insert({
          aluno_nome: aluno.nome,
          whatsapp: aluno.whatsapp,
          tipo_mensagem: messageType,
          status: 'falha',
          erro: err.message,
        })
      } catch (logErr) {
        console.error('Erro ao registrar log de falha:', logErr)
      }

      toast({
        title: 'Falha ao enviar mensagem',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const selectedAlunoObj = alunos.find((a) => a.id === selectedAluno)

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Envio Manual de Mensagem</CardTitle>
        <CardDescription>
          Envie mensagens avulsas ou lembretes diretamente para o WhatsApp do aluno.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 flex flex-col">
          <Label>Selecionar Aluno</Label>
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between font-normal"
              >
                {selectedAlunoObj
                  ? `${selectedAlunoObj.nome} (${selectedAlunoObj.whatsapp || 'Sem WhatsApp'})`
                  : 'Buscar aluno...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Digite o nome do aluno..." />
                <CommandList>
                  <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                  <CommandGroup>
                    {alunos.map((aluno) => (
                      <CommandItem
                        key={aluno.id}
                        value={aluno.nome}
                        onSelect={() => {
                          setSelectedAluno(aluno.id === selectedAluno ? '' : aluno.id)
                          setOpenCombobox(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedAluno === aluno.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {aluno.nome} {aluno.whatsapp ? `(${aluno.whatsapp})` : '(Sem WhatsApp)'}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Tipo de Mensagem</Label>
          <Select value={messageType} onValueChange={handleMessageTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lembrete_3_dias">Lembrete: 3 Dias Antes</SelectItem>
              <SelectItem value="lembrete_vencimento">Lembrete: No Dia do Vencimento</SelectItem>
              <SelectItem value="mensagem_customizada">Mensagem Customizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Texto da Mensagem</Label>
          <Textarea
            rows={5}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Digite a mensagem aqui..."
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={sending || !selectedAluno || !messageType || !messageText}
        >
          {sending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Enviar Mensagem
        </Button>
      </CardContent>
    </Card>
  )
}
