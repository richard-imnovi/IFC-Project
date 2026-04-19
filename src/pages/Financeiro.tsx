import { Link } from 'react-router-dom'
import { BookOpen, DollarSign, LayoutDashboard, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardVisaoGeral } from '@/components/financeiro/dashboard-visao-geral'
import { TemplatesMensalidade } from '@/components/financeiro/templates-mensalidade'
import { Comunicacoes } from '@/components/financeiro/comunicacoes'
import { SendMessagesModal } from '@/components/financeiro/send-messages-modal'

export default function Financeiro() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Financeiro</h1>
          <p className="text-slate-600 mt-1">Visão geral e gestão de pagamentos dos alunos.</p>
        </div>
        <div className="flex items-center gap-2">
          <SendMessagesModal />
          <Button asChild variant="outline">
            <Link to="/turmas">
              <BookOpen className="w-4 h-4 mr-2" /> Gerenciar Turmas
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="mb-6 h-12 w-full sm:w-auto">
          <TabsTrigger
            value="visao-geral"
            className="flex items-center gap-2 px-6 flex-1 sm:flex-none"
          >
            <LayoutDashboard className="w-4 h-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="mensalidades"
            className="flex items-center gap-2 px-6 flex-1 sm:flex-none"
          >
            <DollarSign className="w-4 h-4" /> Mensalidades
          </TabsTrigger>
          <TabsTrigger
            value="comunicacoes"
            className="flex items-center gap-2 px-6 flex-1 sm:flex-none"
          >
            <MessageSquare className="w-4 h-4" /> Comunicações
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="visao-geral"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <DashboardVisaoGeral />
        </TabsContent>
        <TabsContent
          value="mensalidades"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <TemplatesMensalidade />
        </TabsContent>
        <TabsContent
          value="comunicacoes"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <Comunicacoes />
        </TabsContent>
      </Tabs>
    </div>
  )
}
