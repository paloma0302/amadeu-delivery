import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { IconImageOff, IconMinus, IconPlus } from '../components/icons'

interface Lanche {
  id: number
  nome: string
  preco: number
  estoque: number
  imagemUrl?: string
}

const lanches: Lanche[] = [
  { id: 1, nome: 'Pão de batata com calabresa', preco: 7.0, estoque: 10, imagemUrl: '/lanches/pao-de-batata-calabresa.jpg' },
  { id: 2, nome: 'Empadinha de frango', preco: 7.0, estoque: 10, imagemUrl: '/lanches/empadinha-de-frango.png' },
  { id: 3, nome: 'Bauruzinho', preco: 7.0, estoque: 10, imagemUrl: '/lanches/bauruzinho.jpg' },
  { id: 4, nome: 'Esfiha de carne', preco: 7.0, estoque: 15, imagemUrl: '/lanches/esfiha-de-carne.jpg' },
  { id: 5, nome: 'Enroladinho de salsicha', preco: 7.0, estoque: 20, imagemUrl: '/lanches/enroladinho-de-salsicha.jpg' },
]

export default function AlunoHome() {
  const [carrinho, setCarrinho] = useState<{ id: number; quantidade: number }[]>([])
  const [quantidades, setQuantidades] = useState<Record<number, number>>(
    lanches.reduce((acc, l) => ({ ...acc, [l.id]: 1 }), {})
  )
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = (location.state as { usuario?: string } | null)?.usuario

  const ajustarQuantidade = (id: number, delta: number) => {
    setQuantidades(q => ({ ...q, [id]: Math.max(1, (q[id] || 1) + delta) }))
  }

  const adicionarAoCarrinho = (id: number) => {
    const qtd = quantidades[id] || 1
    setCarrinho(prev => {
      const item = prev.find(c => c.id === id)
      if (item) {
        return prev.map(c => c.id === id ? { ...c, quantidade: c.quantidade + qtd } : c)
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
    navigate('/pagamento', { state: { carrinho, lanches, usuario } })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="Aluno" usuario={usuario} />

      {/* Banner */}
      <div className="bg-red-600 text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">AMADEU DELIVERY</h1>
          <p className="text-red-100 mt-2">Lanches disponíveis do dia</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lanches.map(lanche => (
            <div
              key={lanche.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-red-500 overflow-hidden flex flex-col"
            >
              {lanche.imagemUrl ? (
                <img src={lanche.imagemUrl} alt={lanche.nome} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <IconImageOff />
                  <span className="text-xs mt-2">Imagem indisponível</span>
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{lanche.nome}</h3>
                <p className="text-red-600 font-bold text-xl mb-1">R$ {lanche.preco.toFixed(2)}</p>
                <p className="text-gray-500 text-sm mb-4">{lanche.estoque} unidades disponíveis</p>

                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => ajustarQuantidade(lanche.id, -1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
                  >
                    <IconMinus />
                  </button>
                  <span className="font-semibold text-gray-800 w-6 text-center">
                    {quantidades[lanche.id]}
                  </span>
                  <button
                    onClick={() => ajustarQuantidade(lanche.id, 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
                  >
                    <IconPlus />
                  </button>
                </div>

                <button
                  onClick={() => adicionarAoCarrinho(lanche.id)}
                  className="mt-auto w-full bg-red-600 text-white py-2.5 rounded-full font-semibold hover:bg-red-700 transition-colors"
                >
                  Adicionar pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carrinho Flutuante */}
      {carrinho.length > 0 && (
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