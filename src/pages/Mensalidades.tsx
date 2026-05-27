import { TemplatesMensalidade } from '@/components/financeiro/templates-mensalidade'

export default function Mensalidades() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Gerenciar Mensalidades
          </h1>
          <p className="text-slate-600 mt-1">
            Configuração de valores e datas de vencimento padrão dos alunos.
          </p>
        </div>
      </div>

      <div className="w-full">
        <TemplatesMensalidade />
      </div>
    </div>
  )
}
