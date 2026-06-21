import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { adicionarPedido } from '../lib/pedidosStore'

interface Lanche {
  id: number
  nome: string
  preco: number
}

export default function Pagamento() {
  const navigate = useNavigate()
  const location = useLocation()
  const { carrinho, lanches, usuario } = location.state || { carrinho: [], lanches: [], usuario: '' }
  const [copiado, setCopiado] = useState(false)

  const total = carrinho.reduce((acc: number, item: any) => {
    const lanche = lanches.find((l: Lanche) => l.id === item.id)
    return acc + (lanche?.preco || 0) * item.quantidade
  }, 0)

  const chavePix = 'Apm Da Escola Estadual Prof Amadeu Oliverio'

  const copiarChave = () => {
    navigator.clipboard.writeText(chavePix)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handleConfirmar = () => {
    const numeroPedido = Math.floor(Math.random() * 10000) + 1000
    const horario = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const itensTexto = carrinho
      .map((item: any) => {
        const lanche = lanches.find((l: Lanche) => l.id === item.id)
        return `${lanche?.nome} x${item.quantidade}`
      })
      .join(', ')

    adicionarPedido({
      id: Date.now(),
      numero: numeroPedido,
      aluno: usuario || 'RA não identificado',
      itens: itensTexto,
      total,
      status: 'pendente',
      horario,
    })

    navigate('/pedido-confirmado', { state: { numeroPedido, total, usuario } })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="Aluno" usuario={usuario} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-12 text-gray-800">Resumo do Pedido</h2>

        {/* Itens */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 sm:p-10 mb-8 sm:mb-10">
          <h3 className="text-lg font-bold mb-5 text-gray-800">Itens</h3>
          <div className="space-y-3">
            {carrinho.map((item: any) => {
              const lanche = lanches.find((l: Lanche) => l.id === item.id)
              return (
                <div key={item.id} className="flex justify-between text-gray-600 text-sm">
                  <span>{lanche?.nome} x{item.quantidade}</span>
                  <span>R$ {((lanche?.preco || 0) * item.quantidade).toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          <div className="border-t border-gray-100 mt-6 pt-6 flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-red-600">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* PIX */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 sm:p-10 mb-10 sm:mb-12">
          <h3 className="text-lg font-bold mb-5 text-gray-800">Pagamento via PIX</h3>
          <p className="text-gray-500 text-sm mb-5">Copie a chave PIX abaixo e faça a transferência:</p>
          <div className="bg-gray-50 p-5 rounded-xl mb-5 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center">
            <code className="text-lg font-mono text-gray-700">{chavePix}</code>
            <button
              onClick={copiarChave}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                copiado
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {copiado ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Após confirmar o pagamento, você receberá o número do seu pedido.
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <button
            onClick={() => navigate('/aluno', { state: { usuario } })}
            className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-full hover:bg-gray-200 transition-colors font-semibold"
          >
            Voltar
          </button>
          <button
            onClick={handleConfirmar}
            className="w-full sm:flex-1 bg-red-600 text-white py-3.5 rounded-full hover:bg-red-700 transition-colors font-semibold"
          >
            Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  )
}
