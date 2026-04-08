import { Outlet, Link, useLocation } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg text-foreground tracking-tight">EduTech</span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6">
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
              to="/financeiro"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === '/financeiro' ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              Financeiro
            </Link>
            <Link
              to="/aluno"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === '/aluno' ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              Painel do Aluno
            </Link>
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
