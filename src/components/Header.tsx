import { useNavigate } from 'react-router-dom'
import { IconLogout } from './icons'

interface HeaderProps {
  role: 'Aluno' | 'Professor'
  usuario?: string
}

export default function Header({ role, usuario }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
            A
          </div>
          <span className="text-lg font-bold text-gray-800 tracking-tight">AMADEU</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right leading-tight">
            <p className="text-xs text-gray-500">{role}</p>
            <p className="text-sm font-semibold text-gray-800 break-all">
              {role} {usuario || (role === 'Aluno' ? '0000123456789sp' : 'rg123456789sp')}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            <IconLogout />
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
