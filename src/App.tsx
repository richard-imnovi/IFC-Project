import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Financeiro from './pages/Financeiro'
import DashboardAluno from './pages/DashboardAluno'
import Turmas from './pages/Turmas'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import { AuthProvider } from './hooks/use-auth'
import { ProtectedRoute } from './components/ProtectedRoute'

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute allowedRoles={['financeiro']} />}>
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/turmas" element={<Turmas />} />
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

export default App
