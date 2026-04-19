import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageSquare, Save, History } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Comunicacoes() {
  const [activeTab, setActiveTab] = useState('templates')

  const [tpl3Dias, setTpl3Dias] = useState('')
  const [tplVencimento, setTplVencimento] = useState('')
  const [savingTpl, setSavingTpl] = useState(false)
  const [loadingTpl, setLoadingTpl] = useState(true)

  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
    fetchLogs()
  }, [])

  const fetchTemplates = async () => {
    setLoadingTpl(true)
    const { data } = await supabase.from('configuracoes_mensagens').select('*')
    if (data) {
      const t3 = data.find((d: any) => d.tipo === 'lembrete_3_dias')
      const tv = data.find((d: any) => d.tipo === 'lembrete_vencimento')
      if (t3) setTpl3Dias(t3.texto)
      if (tv) setTplVencimento(tv.texto)
    }
    setLoadingTpl(false)
  }

  const fetchLogs = async () => {
    setLoadingLogs(true)
    const { data } = await supabase
      .from('logs_mensagens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setLogs(data)
    setLoadingLogs(false)
  }

  const handleSaveTemplates = async () => {
    setSavingTpl(true)
    try {
      const { error } = await supabase.from('configuracoes_mensagens').upsert(
        [
          { tipo: 'lembrete_3_dias', texto: tpl3Dias },
          { tipo: 'lembrete_vencimento', texto: tplVencimento },
        ],
        { onConflict: 'tipo' },
      )

      if (error) throw error
      toast({ title: 'Templates salvos com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar templates',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSavingTpl(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Templates de Mensagem
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="w-4 h-4" /> Histórico de Envios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Mensagens</CardTitle>
              <CardDescription>
                Personalize os textos enviados aos alunos via WhatsApp. Você pode usar as variáveis:{' '}
                {'{{nome}}'}, {'{{valor}}'}, {'{{vencimento}}'}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingTpl ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Lembrete: 3 Dias Antes do Vencimento
                    </label>
                    <Textarea
                      rows={5}
                      value={tpl3Dias}
                      onChange={(e) => setTpl3Dias(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lembrete: No Dia do Vencimento</label>
                    <Textarea
                      rows={5}
                      value={tplVencimento}
                      onChange={(e) => setTplVencimento(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSaveTemplates} disabled={savingTpl}>
                    {savingTpl ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Templates
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Envios</CardTitle>
              <CardDescription>
                Histórico das últimas 50 mensagens processadas pelo sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Aluno</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingLogs ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhum envio registrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(parseISO(log.created_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium">{log.aluno_nome}</TableCell>
                        <TableCell>{log.whatsapp}</TableCell>
                        <TableCell>
                          {log.tipo_mensagem === 'lembrete_3_dias'
                            ? '3 Dias Antes'
                            : log.tipo_mensagem === 'lembrete_vencimento'
                              ? 'Vencimento'
                              : log.tipo_mensagem}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={log.status === 'sucesso' ? 'default' : 'destructive'}
                            className={
                              log.status === 'sucesso' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                            }
                          >
                            {log.status.toUpperCase()}
                          </Badge>
                          {log.erro && (
                            <p
                              className="text-xs text-red-500 mt-1 max-w-[200px] truncate"
                              title={log.erro}
                            >
                              {log.erro}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
