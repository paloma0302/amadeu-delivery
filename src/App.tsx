import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import AlunoHome from './pages/AlunoHome'
import Pagamento from './pages/Pagamento'
import PedidoConfirmado from './pages/PedidoConfirmado'
import ProfessorHome from './pages/ProfessorHome'
import AcompanharPedido from './pages/AcompanharPedido'
import RecuperarSenha from './pages/RecuperarSenha'
import MeusPedidos from './pages/MeusPedidos'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/aluno" element={<AlunoHome />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/pedido-confirmado" element={<PedidoConfirmado />} />
        <Route path="/professor" element={<ProfessorHome />} />
        <Route path="/acompanhar-pedido" element={<AcompanharPedido />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/meus-pedidos" element={<MeusPedidos />} />
      </Routes>
    </Router>
  )
}

export default App