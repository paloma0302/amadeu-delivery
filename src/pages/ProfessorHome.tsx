import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { IconMinus, IconPlus } from '../components/icons'
import { listarPedidos, salvarPedidos, type PedidoArmazenado } from '../lib/pedidosStore'

type Pedido = PedidoArmazenado

interface Estoque {
  id: number
  nome: string
  quantidade: number
}

export default function ProfessorHome() {
  const location = useLocation()
  const usuario = (location.state as { usuario?: string } | null)?.usuario

  const [pedidos, setPedidos] = useState<Pedido[]>(() => listarPedidos())

  const [estoque, setEstoque] = useState<Estoque[]>([
    { id: 1, nome: 'Pão de batata com calabresa', quantidade: 10 },
    { id: 2, nome: 'Empadinha de frango', quantidade: 10 },
    { id: 3, nome: 'Bauruzinho', quantidade: 10 },
    { id: 4, nome: 'Esfiha de carne', quantidade: 15 },
    { id: 5, nome: 'Enroladinho de salsicha', quantidade: 20 },
  ])

  const ajustarEstoque = (id: number, delta: number) => {
    setEstoque(estoque.map(e =>
      e.id === id ? { ...e, quantidade: Math.max(0, e.quantidade + delta) } : e
    ))
  }

  const atualizarStatusPedido = (id: number) => {
    setPedidos(prev => {
      const atualizados = prev.map(p =>
        p.id === id ? { ...p, status: 'entregue' as Pedido['status'] } : p
      )
      salvarPedidos(atualizados)
      return atualizados
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'entregue': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'entregue': return 'Entregue'
      default: return status
    }
  }

  const pedidosPendentes = pedidos.filter(p => p.status !== 'entregue')

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="Professor" usuario={usuario} />

      {/* Banner */}
      <div className="bg-red-600 text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">Painel do Professor</h1>
          <p className="text-red-100 mt-2">Gerenciamento de pedidos e estoque</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pedidos Recebidos */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between border-b-2 border-red-500 pb-3 mb-5">
              <h2 className="text-xl font-bold text-gray-800">Pedidos Recebidos</h2>
            </div>

            {pedidosPendentes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-14 text-center text-gray-400">
                Nenhum pedido pendente
              </div>
            ) : (
              <div className="space-y-4">
                {pedidosPendentes.map(pedido => (
                  <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Pedido #{pedido.numero}</p>
                        <h3 className="text-lg font-bold text-gray-800 break-all">{pedido.aluno}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{pedido.horario}</p>
                        <p className="text-xl font-bold text-red-600">R$ {pedido.total.toFixed(2)}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 text-sm">{pedido.itens}</p>

                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusColor(pedido.status)}`}>
                        {getStatusLabel(pedido.status)}
                      </span>
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id)}
                        className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        Marcar como entregue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controle de Estoque */}
          <div>
            <div className="flex items-center justify-between border-b-2 border-red-500 pb-3 mb-5">
              <h2 className="text-xl font-bold text-gray-800">Controle de Estoque</h2>
            </div>

            <div className="space-y-4">
              {estoque.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="font-semibold text-gray-800 mb-3">{item.nome}</p>
                  <div className="bg-gray-50 rounded-xl py-4 text-center mb-3">
                    <p className="text-3xl font-bold text-red-600">{item.quantidade}</p>
                    <p className="text-xs text-gray-500 mt-1">unidades</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => ajustarEstoque(item.id, -1)}
                      className="flex items-center justify-center gap-1 bg-red-50 text-red-600 font-bold rounded-lg py-2 hover:bg-red-100 transition-colors"
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
        </div>
      </div>
    </div>
  )
}
