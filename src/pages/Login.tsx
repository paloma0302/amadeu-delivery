import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const validarAluno = (login: string) => /^\d+sp$/.test(login)
  const validarProfessor = (login: string) => /^rg\d+sp$/.test(login)
  const camposPreenchidos = usuario.trim().length > 0 && senha.trim().length > 0

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!usuario || !senha) {
      setErro('Preencha todos os campos')
      return
    }

    if (validarAluno(usuario)) {
      navigate('/aluno', { state: { usuario } })
    } else if (validarProfessor(usuario)) {
      navigate('/professor', { state: { usuario } })
    } else {
      setErro('Formato de login inválido')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-20">
      <h1 className="text-4xl font-bold text-slate-700 text-center mb-14">
        Amadeu Delivery
      </h1>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-14">
        <form onSubmit={handleLogin} className="space-y-12">
          {/* Usuario */}
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

          {/* Senha */}
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

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erro}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            className={`w-full py-4 rounded-full font-bold text-lg transition-colors shadow-sm text-white mt-2 ${
              camposPreenchidos
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-rose-400 hover:bg-rose-500'
            }`}
          >
            Fazer cadastro
          </button>
        </form>

        <hr className="border-gray-100 my-10" />

        <p className="text-sm text-gray-500 text-center leading-relaxed">
          Use qualquer senha para demonstração. O sistema valida apenas o formato do login.
        </p>
      </div>

      <p className="text-sm text-gray-400 mt-10 text-center">
        Protótipo de TCC - Gerenciamento de Cantina Escolar
      </p>
    </div>
  )
}