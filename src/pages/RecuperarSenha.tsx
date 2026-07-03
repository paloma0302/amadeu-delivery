import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RecuperarSenha() {
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState<'ra' | 'codigo' | 'sucesso'>('ra')
  const [ra, setRa] = useState('')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleEnviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!ra) {
      setErro('Digite seu RA')
      return
    }

    setCarregando(true)
    try {
      const res = await fetch('/api/senha/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ra }),
      })

      const dados = await res.json()
      if (!res.ok) throw new Error(dados.erro)

      setEtapa('codigo')
    } catch (error: any) {
      setErro(error.message || 'Erro ao enviar código')
    } finally {
      setCarregando(false)
    }
  }

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!codigo || !novaSenha || !confirmarSenha) {
      setErro('Preencha todos os campos')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setCarregando(true)
    try {
      const res = await fetch('/api/senha/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ra, codigo, novaSenha }),
      })

      const dados = await res.json()
      if (!res.ok) throw new Error(dados.erro)

      setEtapa('sucesso')
    } catch (error: any) {
      setErro(error.message || 'Erro ao verificar código')
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

        {etapa === 'ra' && (
          <form onSubmit={handleEnviarCodigo} className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Recuperar senha</h2>
              <p className="text-gray-500 text-sm">Digite seu RA e enviaremos um código para seu email institucional.</p>
            </div>

            <div>
              <label className="block text-lg font-bold text-slate-800 mb-4">RA</label>
              <input
                type="text"
                value={ra}
                onChange={e => setRa(e.target.value)}
                placeholder="Ex: 00001105902821sp"
                className="w-full px-5 py-4 text-base border border-gray-200 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-rose-300 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                O código será enviado para {ra ? `${ra}@al.educacao.sp.gov.br` : 'seu email institucional'}
              </p>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-4 rounded-full font-bold text-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
            >
              {carregando ? 'Enviando...' : 'Enviar código'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-4 rounded-full font-bold text-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Voltar
            </button>
          </form>
        )}

        {etapa === 'codigo' && (
          <form onSubmit={handleVerificarCodigo} className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Digite o código</h2>
              <p className="text-gray-500 text-sm">
                Enviamos um código para <strong>{ra}@al.educacao.sp.gov.br</strong>. Verifique sua caixa de entrada.
              </p>
            </div>

            <div>
              <label className="block text-lg font-bold text-slate-800 mb-4">Código</label>
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full px-5 py-4 text-base border border-gray-200 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-rose-300 focus:border-transparent outline-none text-center text-2xl tracking-widest"
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-slate-800 mb-4">Nova senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-5 py-4 text-base border border-gray-200 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-rose-300 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-slate-800 mb-4">Confirmar senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
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
              disabled={carregando}
              className="w-full py-4 rounded-full font-bold text-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
            >
              {carregando ? 'Verificando...' : 'Alterar senha'}
            </button>

            <button
              type="button"
              onClick={() => { setEtapa('ra'); setErro('') }}
              className="w-full py-4 rounded-full font-bold text-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Voltar
            </button>
          </form>
        )}

        {etapa === 'sucesso' && (
          <div className="text-center space-y-8">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto text-white text-4xl">
              ✓
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Senha alterada!</h2>
              <p className="text-gray-500">Sua senha foi alterada com sucesso. Faça login com a nova senha.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 rounded-full font-bold text-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Ir para o login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}