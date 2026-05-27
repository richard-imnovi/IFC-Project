import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  LogOut,
  Menu,
  X,
  DollarSign,
  MessageSquare,
  Users,
  User,
  ChevronRight,
  School,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isCadastroRoute = location.pathname.startsWith('/cadastro')
  const [cadastroOpen, setCadastroOpen] = useState(isCadastroRoute)

  useEffect(() => {
    if (location.pathname.startsWith('/cadastro')) {
      setCadastroOpen(true)
    }
  }, [location.pathname])

  if (profile?.tipo_acesso === 'financeiro') {
    return (
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out flex flex-col',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <div className="h-16 flex items-center px-6 border-b shrink-0">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold text-lg text-slate-900 tracking-tight">EduTech</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <Link
              to="/financeiro"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                location.pathname === '/financeiro'
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <DollarSign className="h-5 w-5 mr-3" />
              Financeiro
            </Link>

            <Collapsible open={cadastroOpen} onOpenChange={setCadastroOpen} className="space-y-1">
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isCadastroRoute
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3" />
                    Cadastro
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      cadastroOpen && 'rotate-90',
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 px-3 pt-1">
                <Link
                  to="/cadastro/alunos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center pl-8 py-2 text-sm font-medium rounded-md transition-colors',
                    location.pathname === '/cadastro/alunos'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <User className="h-4 w-4 mr-2" />
                  Gerenciar Alunos
                </Link>
                <Link
                  to="/cadastro/turmas"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center pl-8 py-2 text-sm font-medium rounded-md transition-colors',
                    location.pathname === '/cadastro/turmas'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <School className="h-4 w-4 mr-2" />
                  Gerenciar Turmas
                </Link>
                <Link
                  to="/cadastro/mensalidades"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center pl-8 py-2 text-sm font-medium rounded-md transition-colors',
                    location.pathname === '/cadastro/mensalidades'
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Gerenciar Mensalidades
                </Link>
              </CollapsibleContent>
            </Collapsible>

            <Link
              to="/comunicacoes"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                location.pathname === '/comunicacoes'
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              Comunicações
            </Link>
          </div>

          <div className="p-4 border-t shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
          <header className="h-16 flex items-center px-4 sm:px-6 bg-white border-b shrink-0 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6 text-slate-600" />
            </Button>
            <span className="ml-4 font-semibold text-lg text-slate-900 tracking-tight">
              IFC Piracicaba
            </span>
          </header>
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    )
  }

  // Default Header Layout for Aluno and Guests
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg text-slate-900 tracking-tight">EduTech</span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6">
            {!user && (
              <>
                <Link
                  to="/"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === '/' ? 'text-primary' : 'text-slate-600',
                  )}
                >
                  Cadastro
                </Link>
                <Link
                  to="/login"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === '/login' ? 'text-primary' : 'text-slate-600',
                  )}
                >
                  Entrar
                </Link>
              </>
            )}

            {profile?.tipo_acesso === 'aluno' && (
              <Link
                to="/aluno"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === '/aluno' ? 'text-primary' : 'text-slate-600',
                )}
              >
                Painel do Aluno
              </Link>
            )}

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-600 hover:text-red-600 h-8 px-2 sm:px-3"
              >
                <LogOut className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="border-t py-6 bg-white mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600 text-center md:text-left">
            &copy; {new Date().getFullYear()} EduTech. Todos os direitos reservados.
          </p>
          <div className="text-sm text-slate-600 flex justify-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              Suporte
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Termos
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
