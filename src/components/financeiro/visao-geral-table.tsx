import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

export function VisaoGeralTable({ students, onSendMessage }: any) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Turma</TableHead>
          <TableHead>Nome do Aluno</TableHead>
          <TableHead>Situação</TableHead>
          <TableHead>Valor da Mensalidade</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
              Nenhum aluno encontrado para este filtro.
            </TableCell>
          </TableRow>
        ) : (
          students.map((student: any) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium text-slate-600">{student.turma}</TableCell>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>
                {student.status === 'em_dia' ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    Em dia
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                    Atrasado
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-slate-600">{formatCurrency(student.fee)}</TableCell>
              <TableCell className="text-right">
                {student.status === 'atrasado' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onSendMessage(student.name)}
                    className="h-8"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Enviar Mensagem</span>
                    <span className="inline sm:hidden">Mensagem</span>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
