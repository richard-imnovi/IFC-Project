import { useNavigate } from 'react-router-dom'
import { Book, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Index() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full animate-fade-in px-4">
      <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Book className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4 text-center">
        IFC Piracicaba
      </h1>
      <p className="text-lg text-slate-600 mb-8 max-w-md text-center">
        Sistema de Gestão de Alunos e Mensalidades. Faça login para acessar o painel administrativo
        ou a área do aluno.
      </p>
      <Button
        size="lg"
        className="w-full sm:w-auto h-14 px-8 text-lg shadow-md group transition-all duration-300"
        onClick={() => navigate('/login')}
      >
        <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
        Entrar no Sistema
      </Button>
    </div>
  )
}
