import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { IconCheck } from '../components/icons'

export default function PedidoConfirmado() {
  const navigate = useNavigate()
  const location = useLocation()
  const { numeroPedido, total, usuario, aluno_id } = location.state || { numeroPedido: 0, total: 0, usuario: '', aluno_id: null }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header role="Aluno" usuario={usuario} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center">
          {/* Checkmark */}
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
            <IconCheck />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Pedido Confirmado!</h2>
          <p className="text-gray-500 mb-8">Seu pedido foi recebido com sucesso.</p>

          {/* Número do Pedido */}
          <div className="bg-gray-50 p-6 rounded-2xl mb-4">
            <p className="text-gray-500 text-sm mb-1">Número do Pedido</p>
            <p className="text-4xl font-bold text-red-600">{numeroPedido}</p>
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-6 rounded-2xl mb-6">
            <p className="text-gray-500 text-sm mb-1">Total Pago</p>
            <p className="text-3xl font-bold text-gray-800">R$ {total.toFixed(2)}</p>
          </div>

          {/* Status */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 text-left">
            <p className="text-blue-800 font-semibold text-sm">Status: Aguardando Preparo</p>
            <p className="text-blue-700 text-sm mt-1">
              Seu pedido está sendo preparado. Acompanhe o status em tempo real.
            </p>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <button
              onClick={() => navigate('/aluno', { state: { usuario, aluno_id } })}
              className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-full hover:bg-gray-200 transition-colors font-semibold"
            >
              Voltar ao Menu
            </button>
            <button
              onClick={() => navigate('/acompanhar-pedido', { state: { numeroPedido, usuario, aluno_id } })}
              className="w-full sm:flex-1 bg-red-600 text-white py-3.5 rounded-full hover:bg-red-700 transition-colors font-semibold"
            >
              Acompanhar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}