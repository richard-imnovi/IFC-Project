import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('Erro 404: O usuário tentou acessar uma rota inexistente:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-slate-900 tracking-tight">404</h1>
        <p className="text-xl text-slate-600">Ops! Página não encontrada</p>
        <div className="pt-4">
          <Link
            to="/"
            className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors font-medium"
          >
            Voltar para o Início
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
