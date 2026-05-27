import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Financeiro from './pages/Financeiro'
import DashboardAluno from './pages/DashboardAluno'
import Turmas from './pages/Turmas'
import Alunos from './pages/Alunos'
import ComunicacoesPage from './pages/Comunicacoes'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import EsqueciSenha from './pages/EsqueciSenha'
import RedefinirSenha from './pages/RedefinirSenha'
import { AuthProvider } from './hooks/use-auth'
import { ProtectedRoute } from './components/ProtectedRoute'

const App = () => {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || ''
      if (
        (event.reason?.name === 'AbortError' && msg.includes('steal')) ||
        msg.includes('The operation was aborted due to timeout') ||
        msg.includes('timeout')
      ) {
        event.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />

              <Route element={<ProtectedRoute allowedRoles={['financeiro']} />}>
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/cadastro/turmas" element={<Turmas />} />
                <Route path="/cadastro/alunos" element={<Alunos />} />
                <Route path="/comunicacoes" element={<ComunicacoesPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['aluno']} />}>
                <Route path="/aluno" element={<DashboardAluno />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
