import { Comunicacoes } from '@/components/financeiro/comunicacoes'

export default function ComunicacoesPage() {
  return (
    <div className="w-full max-w-5xl self-start mt-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Comunicações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie templates, histórico de envios e envie mensagens manuais para os alunos.
        </p>
      </div>
      <Comunicacoes />
    </div>
  )
}
