import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'

interface Pedido {
  id: number
  status: string
  total: number
  criado_em: string
  itens: { nome: string; quantidade: number; preco_unitario: number }[]
}

const STATUS_STEPS = [
  { key: 'pendente', label: 'Pedido Recebido', descricao: 'Aguardando o intervalo' },
  { key: 'pronto_para_retirada', label: 'Pronto para Retirada', descricao: 'Já pode ir buscar na cantina!' },
  { key: 'entregue', label: 'Entregue', descricao: 'Pedido retirado. Bom apetite!' },
]

export default function AcompanharPedido() {
  const navigate = useNavigate()
  const location = useLocation()
  const { numeroPedido, usuario, aluno_id } = location.state || {}

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const buscarPedido = async () => {
    try {
      const res = await fetch(`/api/pedidos/${numeroPedido}`)
      if (!res.ok) throw new Error('Pedido não encontrado')
      const dados = await res.json()
      setPedido(dados)
    } catch {
      setErro('Erro ao buscar pedido')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarPedido()
    const intervalo = setInterval(buscarPedido, 30000)
    return () => clearInterval(intervalo)
  }, [])

  const getStatusIndex = (status: string) => {
    return STATUS_STEPS.findIndex(s => s.key === status)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pronto_para_retirada': return 'bg-green-100 text-green-800 border-green-200'
      case 'entregue': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const statusAtualIndex = pedido ? getStatusIndex(pedido.status) : 0
  const stepAtual = STATUS_STEPS.find(s => s.key === pedido?.status)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="Aluno" usuario={usuario} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
          Acompanhar Pedido #{numeroPedido}
        </h2>

        {carregando ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : erro ? (
          <p className="text-center text-red-500">{erro}</p>
        ) : pedido ? (
          <div className="space-y-6">

            {/* Status atual */}
            <div className={`border rounded-2xl p-5 ${getStatusColor(pedido.status)}`}>
              <p className="text-sm font-semibold mb-1">Status atual</p>
              <p className="text-xl font-bold">{stepAtual?.label}</p>
              <p className="text-sm mt-1">{stepAtual?.descricao}</p>
            </div>

            {/* Linha do tempo */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-6">Progresso do Pedido</h3>
              <div className="space-y-4">
                {STATUS_STEPS.map((step, index) => {
                  const concluido = index <= statusAtualIndex
                  const atual = index === statusAtualIndex
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        concluido ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {concluido ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${atual ? 'text-red-600' : concluido ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {atual && (
                          <p className="text-xs text-gray-500 mt-0.5">{step.descricao}</p>
                        )}
                      </div>
                      {atual && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                          Agora
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Itens do pedido */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Itens do Pedido</h3>
              <div className="space-y-2">
                {pedido.itens.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-600">
                    <span>{item.nome} x{item.quantidade}</span>
                    <span>R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-red-600">R$ {Number(pedido.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={buscarPedido}
                className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-full hover:bg-gray-200 transition-colors font-semibold"
              >
                Atualizar Status
              </button>
              <button
                onClick={() => navigate('/aluno', { state: { usuario, aluno_id } })}
                className="w-full sm:flex-1 bg-red-600 text-white py-3.5 rounded-full hover:bg-red-700 transition-colors font-semibold"
              >
                Voltar ao Menu
              </button>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  )
}