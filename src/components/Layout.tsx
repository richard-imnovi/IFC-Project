import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg text-foreground tracking-tight">EduTech</span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6">
            {!user && (
              <>
                <Link
                  to="/"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === '/' ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  Cadastro
                </Link>
                <Link
                  to="/login"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === '/login' ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  Entrar
                </Link>
              </>
            )}

            {profile?.tipo_acesso === 'financeiro' && (
              <Link
                to="/financeiro"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === '/financeiro' ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                Financeiro
              </Link>
            )}

            {profile?.tipo_acesso === 'aluno' && (
              <Link
                to="/aluno"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === '/aluno' ? 'text-primary' : 'text-muted-foreground',
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
                className="text-muted-foreground hover:text-primary h-8 px-2 sm:px-3"
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

      <footer className="border-t py-6 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} EduTech. Todos os direitos reservados.
          </p>
          <div className="text-sm text-muted-foreground flex justify-center gap-6">
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
