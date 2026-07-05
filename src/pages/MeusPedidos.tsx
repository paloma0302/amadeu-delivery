import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { getPedidosAtivosAluno, getHistoricoAluno } from '../api/pedidos'

interface Pedido {
  id: number
  status: string
  total: number
  criado_em: string
  itens: string
}

const ABAS = ['Meu Pedido', 'Histórico']

export default function MeusPedidos() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, aluno_id } = location.state || {}

  const [abaSelecionada, setAbaSelecionada] = useState('Meu Pedido')
  const [pedidosAtivos, setPedidosAtivos] = useState<Pedido[]>([])
  const [historico, setHistorico] = useState<Pedido[]>([])
  const [totalGasto, setTotalGasto] = useState(0)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!aluno_id) return

    Promise.all([
      getPedidosAtivosAluno(aluno_id),
      getHistoricoAluno(aluno_id)
    ])
      .then(([ativos, hist]) => {
        setPedidosAtivos(ativos)
        setHistorico(hist.pedidos)
        setTotalGasto(hist.total_gasto)
      })
      .catch(() => alert('Erro ao carregar pedidos'))
      .finally(() => setCarregando(false))
  }, [aluno_id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'pronto_para_retirada': return 'bg-green-100 text-green-800'
      case 'entregue': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'pronto_para_retirada': return '🎉 Pronto para Retirada'
      case 'entregue': return 'Entregue'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="Aluno" usuario={usuario} />

      <div className="bg-red-600 text-white px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">Meu Pedido</h1>
          <p className="text-red-100 mt-2">Acompanhe seu pedido e histórico</p>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-1">
            {ABAS.map(aba => (
              <button
                key={aba}
                onClick={() => setAbaSelecionada(aba)}
                className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  abaSelecionada === aba
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {aba}
                {aba === 'Meu Pedido' && pedidosAtivos.length > 0 && (
                  <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                    {pedidosAtivos.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {carregando ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : abaSelecionada === 'Meu Pedido' ? (
          <div>
            {pedidosAtivos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-14 text-center text-gray-400">
                Nenhum pedido ativo no momento
              </div>
            ) : (
              <div className="space-y-4">
                {pedidosAtivos.map(pedido => (
                  <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Pedido #{pedido.id}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(pedido.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-red-600">R$ {Number(pedido.total).toFixed(2)}</p>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{pedido.itens}</p>
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusColor(pedido.status)}`}>
                        {getStatusLabel(pedido.status)}
                      </span>
                      <button
                        onClick={() => navigate('/acompanhar-pedido', { state: { numeroPedido: pedido.id, usuario, aluno_id } })}
                        className="text-sm text-red-600 font-semibold hover:text-red-700"
                      >
                        Acompanhar →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {historico.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-14 text-center text-gray-400">
                Nenhum pedido entregue ainda
              </div>
            ) : (
              <div className="space-y-4">
                {historico.map(pedido => (
                  <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Pedido #{pedido.id}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(pedido.criado_em).toLocaleDateString('pt-BR')} às {new Date(pedido.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-800">R$ {Number(pedido.total).toFixed(2)}</p>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{pedido.itens}</p>
                    <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600">
                      ✓ Entregue
                    </span>
                  </div>
                ))}

                {/* Total gasto */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-700 font-semibold">Total gasto até hoje</p>
                    <p className="text-2xl font-bold text-red-600">R$ {Number(totalGasto).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-10">
        <button
          onClick={() => navigate('/aluno', { state: { usuario, aluno_id } })}
          className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-full hover:bg-gray-200 transition-colors font-semibold"
        >
          Voltar ao Cardápio
        </button>
      </div>
    </div>
  )
}