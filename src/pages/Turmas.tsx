import { useState, useEffect } from 'react'
import { BookOpen, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const turmaSchema = z.object({
  nome_turma: z.string().min(3, 'Mínimo 3 caracteres'),
  descricao: z.string().optional(),
})

export default function Turmas() {
  const [turmas, setTurmas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTurma, setEditingTurma] = useState<any>(null)

  const form = useForm<z.infer<typeof turmaSchema>>({
    resolver: zodResolver(turmaSchema),
    defaultValues: { nome_turma: '', descricao: '' },
  })

  useEffect(() => {
    loadTurmas()
  }, [])

  const loadTurmas = async () => {
    const { data } = await supabase.from('turmas').select('*').order('nome_turma')
    if (data) setTurmas(data)
    setIsLoading(false)
  }

  const onSubmit = async (values: z.infer<typeof turmaSchema>) => {
    if (editingTurma) {
      const { error } = await supabase.from('turmas').update(values).eq('id', editingTurma.id)
      if (error) toast.error('Erro ao atualizar turma')
      else {
        toast.success('Turma atualizada com sucesso')
        setIsDialogOpen(false)
        loadTurmas()
      }
    } else {
      const { error } = await supabase.from('turmas').insert([values])
      if (error) toast.error('Erro ao criar turma')
      else {
        toast.success('Turma criada com sucesso')
        setIsDialogOpen(false)
        loadTurmas()
      }
    }
  }

  const handleEdit = (turma: any) => {
    setEditingTurma(turma)
    form.reset({ nome_turma: turma.nome_turma, descricao: turma.descricao || '' })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta turma?')) return
    const { error } = await supabase.from('turmas').delete().eq('id', id)
    if (error) toast.error('Erro ao excluir. Pode haver alunos vinculados.')
    else {
      toast.success('Turma excluída')
      loadTurmas()
    }
  }

  const openNewTurma = () => {
    setEditingTurma(null)
    form.reset({ nome_turma: '', descricao: '' })
    setIsDialogOpen(true)
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gerenciar Turmas</h1>
          <p className="text-slate-600 mt-1">Cadastre e edite as turmas do sistema.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewTurma}>
              <Plus className="w-4 h-4 mr-2" /> Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTurma ? 'Editar Turma' : 'Nova Turma'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="nome_turma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Turma</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Turma A - Manhã" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Detalhes da turma" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Lista de Turmas
          </CardTitle>
          <CardDescription>Todas as turmas cadastradas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                      Nenhuma turma cadastrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  turmas.map((turma) => (
                    <TableRow key={turma.id}>
                      <TableCell className="font-medium">{turma.nome_turma}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {turma.descricao || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(turma)}>
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(turma.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
