import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { IconImageOff, IconMinus, IconPlus } from '../components/icons'
import { getProdutos } from '../api/produtos'
import { getPeriodoAtual, getMensagemPeriodo } from '../lib/horarios'

interface Lanche {
  id: number
  nome: string
  preco: number
  estoque: number
  imagem_url?: string
  categoria_id: number
  categoria_nome: string
}

const CATEGORIAS = [
  { label: 'Todos', valor: null },
  { label: 'Salgados Assados', valor: 1 },
  { label: 'Bebidas', valor: 2 },
  { label: 'Salgadinhos', valor: 3 },
  { label: 'Doces', valor: 4 },
]

export default function AlunoHome() {
  const [lanches, setLanches] = useState<Lanche[]>([])
  const [carregando, setCarregando] = useState(true)
  const [carrinho, setCarrinho] = useState<{ id: number; quantidade: number }[]>([])
  const [quantidades, setQuantidades] = useState<Record<number, number>>({})
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null)
  const [periodo, setPeriodo] = useState(getPeriodoAtual())
  const [mensagem, setMensagem] = useState(getMensagemPeriodo())
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = (location.state as { usuario?: string; aluno_id?: number } | null)?.usuario
  const aluno_id = (location.state as { usuario?: string; aluno_id?: number } | null)?.aluno_id

  useEffect(() => {
    getProdutos()
      .then((dados: Lanche[]) => {
        setLanches(dados)
        setQuantidades(dados.reduce((acc, l) => ({ ...acc, [l.id]: 1 }), {}))
      })
      .catch(() => alert('Erro ao carregar produtos'))
      .finally(() => setCarregando(false))

    const intervalo = setInterval(() => {
      setPeriodo(getPeriodoAtual())
      setMensagem(getMensagemPeriodo())
    }, 60000)

    return () => clearInterval(intervalo)
  }, [])

  const podeFazerPedido = periodo === 'pedidos_abertos'

  const lanchesFiltrados = categoriaSelecionada === null
    ? lanches
    : lanches.filter(l => l.categoria_id === categoriaSelecionada)

  const ajustarQuantidade = (id: number, delta: number) => {
    const lanche = lanches.find(l => l.id === id)
    const estoqueMax = lanche?.estoque || 1
    setQuantidades(q => ({
      ...q,
      [id]: Math.min(estoqueMax, Math.max(1, (q[id] || 1) + delta))
    }))
  }

  const adicionarAoCarrinho = (id: number) => {
    if (!podeFazerPedido) return
    const qtd = quantidades[id] || 1
    const lanche = lanches.find(l => l.id === id)
    if (!lanche || lanche.estoque === 0) return

    setCarrinho(prev => {
      const item = prev.find(c => c.id === id)
      if (item) {
        const novaQtd = Math.min(lanche.estoque, item.quantidade + qtd)
        return prev.map(c => c.id === id ? { ...c, quantidade: novaQtd } : c)
      }
      return [...prev, { id, quantidade: qtd }]
    })
  }

  const total = carrinho.reduce((acc, item) => {
    const lanche = lanches.find(l => l.id === item.id)
    return acc + (lanche?.preco || 0) * item.quantidade
  }, 0)

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0)

  const handlePagar = () => {
    if (carrinho.length === 0) {
      alert('Adicione itens ao carrinho')
      return
    }
    navigate('/pagamento', { state: { carrinho, lanches, usuario, aluno_id } })
  }

  const getBannerPeriodo = () => {
    switch (periodo) {
      case 'retirada_liberada':
        return 'bg-green-600'
      case 'bloqueado':
        return 'bg-gray-600'
      default:
        return 'bg-red-600'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="Aluno" usuario={usuario} />

      {/* Botão Meus Pedidos */}
      <div className="bg-white border-b border-gray-100 px-6 py-2">
        <div className="max-w-6xl mx-auto flex justify-end">
          <button
            onClick={() => navigate('/meus-pedidos', { state: { usuario, aluno_id } })}
            className="text-sm text-red-600 font-semibold hover:text-red-700"
          >
            Meu Pedido →
          </button>
        </div>
      </div>

      <div className={`${getBannerPeriodo()} text-white px-6 py-12`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">AMADEU DELIVERY</h1>
          <p className="text-white/80 mt-2">{mensagem}</p>
        </div>
      </div>

      {periodo === 'retirada_liberada' && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3">
          <p className="text-green-800 text-sm font-semibold text-center">
            🎉 Intervalo! Vá até a cantina retirar seu pedido.
          </p>
        </div>
      )}
      {periodo === 'bloqueado' && (
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <p className="text-gray-600 text-sm font-semibold text-center">
            ⏰ Pedidos encerrados por hoje. Volte amanhã!
          </p>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.label}
                onClick={() => setCategoriaSelecionada(cat.valor)}
                className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  categoriaSelecionada === cat.valor
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {carregando ? (
          <p className="text-center text-gray-500">Carregando produtos...</p>
        ) : lanchesFiltrados.length === 0 ? (
          <p className="text-center text-gray-400">Nenhum produto nessa categoria</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lanchesFiltrados.map(lanche => (
              <div
                key={lanche.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-red-500 overflow-hidden flex flex-col"
              >
                {lanche.imagem_url ? (
                  <img src={lanche.imagem_url} alt={lanche.nome} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                    <IconImageOff />
                    <span className="text-xs mt-2">Imagem indisponível</span>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{lanche.nome}</h3>
                  <p className="text-red-600 font-bold text-xl mb-1">R$ {Number(lanche.preco).toFixed(2)}</p>
                  <p className="text-gray-500 text-sm mb-4">{lanche.estoque} unidades disponíveis</p>

                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => ajustarQuantidade(lanche.id, -1)}
                      disabled={lanche.estoque === 0 || !podeFazerPedido}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center disabled:opacity-40"
                    >
                      <IconMinus />
                    </button>
                    <span className="font-semibold text-gray-800 w-6 text-center">
                      {lanche.estoque === 0 ? 0 : quantidades[lanche.id]}
                    </span>
                    <button
                      onClick={() => ajustarQuantidade(lanche.id, 1)}
                      disabled={lanche.estoque === 0 || quantidades[lanche.id] >= lanche.estoque || !podeFazerPedido}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center disabled:opacity-40"
                    >
                      <IconPlus />
                    </button>
                  </div>

                  <button
                    onClick={() => adicionarAoCarrinho(lanche.id)}
                    disabled={lanche.estoque === 0 || !podeFazerPedido}
                    className="mt-auto w-full bg-red-600 text-white py-2.5 rounded-full font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {lanche.estoque === 0
                      ? 'Sem estoque'
                      : !podeFazerPedido
                      ? periodo === 'retirada_liberada' ? 'Retire seu pedido' : 'Pedidos encerrados'
                      : 'Adicionar pedido'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {carrinho.length > 0 && podeFazerPedido && (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-80 z-50">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Carrinho ({totalItens})</h3>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {carrinho.map(item => {
              const lanche = lanches.find(l => l.id === item.id)
              return (
                <div key={item.id} className="flex justify-between text-sm text-gray-700">
                  <span>{lanche?.nome} x{item.quantidade}</span>
                  <span>R$ {((lanche?.preco || 0) * item.quantidade).toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-red-600">R$ {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handlePagar}
            className="w-full bg-red-600 text-white py-2.5 rounded-full hover:bg-red-700 transition-colors font-semibold"
          >
            Ir para Pagamento
          </button>
        </div>
      )}
    </div>
  )
}