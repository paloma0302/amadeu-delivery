import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  const camposPreenchidos = usuario.trim().length > 0 && senha.trim().length > 0

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!usuario || !senha) {
      setErro('Preencha todos os campos')
      return
    }

    setCarregando(true)
    try {
      const dados = await login(usuario, senha)

      if (dados.tipo === 'aluno') {
        navigate('/aluno', { state: { usuario: dados.ra, aluno_id: dados.id } })
      } else {
        navigate('/professor', { state: { usuario: dados.ra } })
      }
    } catch (error: any) {
      setErro(error.message || 'Erro ao fazer login')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-20">
      <h1 className="text-4xl font-bold text-slate-700 text-center mb-14">
        Amadeu Delivery
      </h1>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-14">
        <form onSubmit={handleLogin} className="space-y-12">
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-4">
              Usuário
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Digite seu login"
              className="w-full px-5 py-4 text-base border border-gray-200 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-rose-300 focus:border-transparent outline-none"
            />
            <p className="text-sm text-gray-500 mt-5">
              <span className="font-semibold text-gray-600">Aluno:</span> 0000123456789sp
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <span className="font-semibold text-gray-600">Professor:</span> rg123456789sp
            </p>
          </div>

          <div>
            <label className="block text-lg font-bold text-slate-800 mb-4">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full px-5 py-4 text-base border border-gray-200 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-rose-300 focus:border-transparent outline-none"
            />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={!camposPreenchidos || carregando}
            className={`w-full py-4 rounded-full font-bold text-lg transition-colors shadow-sm text-white mt-2 ${
              camposPreenchidos && !carregando
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-rose-400'
            }`}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <hr className="border-gray-100 my-10" />

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">
            Primeiro acesso? Entre com seu RA e crie uma senha.
          </p>
          <button
            onClick={() => navigate('/recuperar-senha')}
            className="text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            Esqueci minha senha
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-10 text-center">
        Protótipo de TCC - Gerenciamento de Cantina Escolar
      </p>
    </div>
  )
}