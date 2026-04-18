import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, Edit2 } from 'lucide-react'

export function TemplateTable({ templates, loading, onEdit, onDelete }: any) {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Venc.</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
              Nenhum template cadastrado.
            </TableCell>
          </TableRow>
        ) : (
          templates.map((t: any) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium text-slate-700">{t.alunos?.nome}</TableCell>
              <TableCell>R$ {Number(t.valor).toFixed(2)}</TableCell>
              <TableCell>Dia {t.dia_vencimento}</TableCell>
              <TableCell className="capitalize text-slate-600">{t.alunos?.status_curso}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(t)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(t.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
