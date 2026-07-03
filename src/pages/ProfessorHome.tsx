import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { IconMinus, IconPlus } from '../components/icons'
import { getPedidos, atualizarStatusPedido } from '../api/pedidos'
import { getProdutosEstoque, atualizarEstoque } from '../api/estoque'

interface Pedido {
  id: number
  status: string
  total: number
  criado_em: string
  aluno: string
  itens: string
}

interface Estoque {
  id: number
  nome: string
  estoque: number
  categoria_nome: string
}

const ABAS = ['Pedidos', 'Estoque']

export default function ProfessorHome() {
  const location = useLocation()
  const usuario = (location.state as { usuario?: string } | null)?.usuario

  const [abaSelecionada, setAbaSelecionada] = useState('Pedidos')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [estoque, setEstoque] = useState<Estoque[]>([])
  const [carregando, setCarregando] = useState(true)
  const [valoresInput, setValoresInput] = useState<Record<number, string>>({})

  useEffect(() => {
    Promise.all([getPedidos(), getProdutosEstoque()])
      .then(([pedidosData, estoqueData]) => {
        setPedidos(pedidosData)
        setEstoque(estoqueData)
        setValoresInput(estoqueData.reduce((acc: Record<number, string>, item: Estoque) => ({
          ...acc,
          [item.id]: String(item.estoque)
        }), {}))
      })
      .catch(() => alert('Erro ao carregar dados'))
      .finally(() => setCarregando(false))
  }, [])

  const ajustarEstoque = async (id: number, delta: number) => {
    const item = estoque.find(e => e.id === id)
    if (!item) return
    const novaQtd = Math.max(0, item.estoque + delta)
    try {
      await atualizarEstoque(id, novaQtd)
      setEstoque(estoque.map(e => e.id === id ? { ...e, estoque: novaQtd } : e))
      setValoresInput(v => ({ ...v, [id]: String(novaQtd) }))
    } catch {
      alert('Erro ao atualizar estoque')
    }
  }

  const handleInputChange = (id: number, valor: string) => {
    if (/^\d*$/.test(valor)) {
      setValoresInput(v => ({ ...v, [id]: valor }))
    }
  }

  const handleInputBlur = async (id: number) => {
    const novaQtd = Math.max(0, parseInt(valoresInput[id] || '0'))
    const item = estoque.find(e => e.id === id)
    if (!item || novaQtd === item.estoque) return
    try {
      await atualizarEstoque(id, novaQtd)
      setEstoque(estoque.map(e => e.id === id ? { ...e, estoque: novaQtd } : e))
      setValoresInput(v => ({ ...v, [id]: String(novaQtd) }))
    } catch {
      alert('Erro ao atualizar estoque')
      setValoresInput(v => ({ ...v, [id]: String(item.estoque) }))
    }
  }

  const atualizarStatus = async (id: number, status: string) => {
    try {
      await atualizarStatusPedido(id, status)
      if (status === 'entregue') {
        setPedidos(prev => prev.filter(p => p.id !== id))
      } else {
        setPedidos(prev => prev.map(p => p.id === id ? { ...p, status } : p))
      }
    } catch {
      alert('Erro ao atualizar pedido')
    }
  }

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
      case 'pronto_para_retirada': return 'Pronto para Retirada'
      case 'entregue': return 'Entregue'
      default: return status
    }
  }

  const estoqueAgrupado = estoque.reduce((acc, item) => {
    const cat = item.categoria_nome || 'Outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, Estoque[]>)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="Professor" usuario={usuario} />

      <div className="bg-red-600 text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">Painel do Professor</h1>
          <p className="text-red-100 mt-2">Gerenciamento de pedidos e estoque</p>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6">
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
                {aba === 'Pedidos' && pedidos.length > 0 && (
                  <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                    {pedidos.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {carregando ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : abaSelecionada === 'Pedidos' ? (
          <div>
            {pedidos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-14 text-center text-gray-400">
                Nenhum pedido pendente
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map(pedido => (
                  <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Pedido #{pedido.id}</p>
                        <h3 className="text-lg font-bold text-gray-800">{pedido.aluno}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(pedido.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xl font-bold text-red-600">R$ {Number(pedido.total).toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">{pedido.itens}</p>
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusColor(pedido.status)}`}>
                        {getStatusLabel(pedido.status)}
                      </span>
                      <div className="flex gap-2">
                        {pedido.status === 'pendente' && (
                          <button
                            onClick={() => atualizarStatus(pedido.id, 'pronto_para_retirada')}
                            className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition-colors text-sm font-semibold"
                          >
                            Liberar Retirada
                          </button>
                        )}
                        {pedido.status === 'pronto_para_retirada' && (
                          <button
                            onClick={() => atualizarStatus(pedido.id, 'entregue')}
                            className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-semibold"
                          >
                            Marcar como Entregue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-6">Clique no número para digitar a quantidade diretamente, ou use os botões + e - para ajustes rápidos.</p>
            {Object.entries(estoqueAgrupado).map(([categoria, itens]) => (
              <div key={categoria} className="mb-10">
                <div className="border-b-2 border-red-500 pb-3 mb-5">
                  <h2 className="text-xl font-bold text-gray-800">{categoria}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {itens.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <p className="font-semibold text-gray-800 mb-3 text-sm">{item.nome}</p>
                      <div className="bg-gray-50 rounded-xl py-3 text-center mb-3">
                        <input
                          type="number"
                          min="0"
                          value={valoresInput[item.id] ?? item.estoque}
                          onChange={e => handleInputChange(item.id, e.target.value)}
                          onBlur={() => handleInputBlur(item.id)}
                          className={`w-20 text-center text-3xl font-bold bg-transparent outline-none border-b-2 border-transparent focus:border-red-400 transition-colors ${
                            item.estoque === 0 ? 'text-gray-400' : 'text-red-600'
                          }`}
                        />
                        <p className="text-xs text-gray-500 mt-1">unidades</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => ajustarEstoque(item.id, -1)}
                          disabled={item.estoque === 0}
                          className="flex items-center justify-center gap-1 bg-red-50 text-red-600 font-bold rounded-lg py-2 hover:bg-red-100 transition-colors disabled:opacity-40"
                        >
                          <IconMinus />
                        </button>
                        <button
                          onClick={() => ajustarEstoque(item.id, 1)}
                          className="flex items-center justify-center gap-1 bg-green-50 text-green-600 font-bold rounded-lg py-2 hover:bg-green-100 transition-colors"
                        >
                          <IconPlus />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}