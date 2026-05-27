import { useState, useEffect } from 'react'
import { Users, Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const alunoSchema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres'),
  whatsapp: z.string().optional().nullable(),
  turma: z.string().optional().nullable(),
  status_curso: z.enum(['ativo', 'concluído', 'cancelado', 'suspenso']),
})

export default function Alunos() {
  const [alunos, setAlunos] = useState<any[]>([])
  const [turmas, setTurmas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAluno, setEditingAluno] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const form = useForm<z.infer<typeof alunoSchema>>({
    resolver: zodResolver(alunoSchema),
    defaultValues: { nome: '', whatsapp: '', turma: 'none', status_curso: 'ativo' },
  })

  useEffect(() => {
    loadTurmas()
    loadAlunos()
  }, [])

  const loadTurmas = async () => {
    const { data } = await supabase.from('turmas').select('*').order('nome_turma')
    if (data) setTurmas(data)
  }

  const loadAlunos = async () => {
    const { data } = await supabase
      .from('alunos')
      .select(`
      *,
      turmas ( nome_turma )
    `)
      .order('nome')
    if (data) setAlunos(data)
    setIsLoading(false)
  }

  const onSubmit = async (values: z.infer<typeof alunoSchema>) => {
    const payload = {
      ...values,
      turma: values.turma === 'none' || values.turma === '' ? null : values.turma,
    }

    if (editingAluno) {
      const { error } = await supabase.from('alunos').update(payload).eq('id', editingAluno.id)
      if (error) {
        toast.error('Erro ao atualizar aluno')
      } else {
        toast.success('Aluno salvo com sucesso!')
        setIsDialogOpen(false)
        loadAlunos()
      }
    } else {
      const { error } = await supabase.from('alunos').insert([payload])
      if (error) {
        toast.error('Erro ao criar aluno')
      } else {
        toast.success('Aluno salvo com sucesso!')
        setIsDialogOpen(false)
        loadAlunos()
      }
    }
  }

  const handleEdit = (aluno: any) => {
    setEditingAluno(aluno)
    form.reset({
      nome: aluno.nome,
      whatsapp: aluno.whatsapp || '',
      turma: aluno.turma || 'none',
      status_curso: (aluno.status_curso as any) || 'ativo',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este aluno?')) return
    const { error } = await supabase.from('alunos').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir aluno')
    } else {
      toast.success('Aluno excluído')
      loadAlunos()
    }
  }

  const openNewAluno = () => {
    setEditingAluno(null)
    form.reset({ nome: '', whatsapp: '', turma: 'none', status_curso: 'ativo' })
    setIsDialogOpen(true)
  }

  const filteredAlunos = alunos.filter((a) =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-emerald-100 text-emerald-800'
      case 'concluído':
        return 'bg-blue-100 text-blue-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      case 'suspenso':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gerenciar Alunos</h1>
          <p className="text-slate-600 mt-1">Cadastre, edite e gerencie os alunos do sistema.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewAluno}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-full">
            <DialogHeader>
              <DialogTitle>{editingAluno ? 'Editar Aluno' : 'Novo Aluno'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do aluno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="5511999999999" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="turma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turma</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || 'none'}
                        value={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma turma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma / Sem Turma</SelectItem>
                          {turmas.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.nome_turma}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status_curso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status do Curso</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="concluído">Concluído</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                          <SelectItem value="suspenso">Suspenso</SelectItem>
                        </SelectContent>
                      </Select>
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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Lista de Alunos
            </CardTitle>
            <CardDescription>Todos os alunos cadastrados no sistema.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlunos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        Nenhum aluno encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAlunos.map((aluno) => (
                      <TableRow key={aluno.id}>
                        <TableCell className="font-medium">{aluno.nome}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {aluno.whatsapp || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {aluno.turmas?.nome_turma || 'Sem Turma'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(aluno.status_curso)}`}
                          >
                            {aluno.status_curso.charAt(0).toUpperCase() +
                              aluno.status_curso.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(aluno)}>
                            <Pencil className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(aluno.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
