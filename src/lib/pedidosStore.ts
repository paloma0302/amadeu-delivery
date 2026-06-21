export interface PedidoArmazenado {
  id: number
  numero: number
  aluno: string
  itens: string
  total: number
  status: 'pendente' | 'entregue'
  horario: string
}

const STORAGE_KEY = 'amadeu_pedidos'

export function listarPedidos(): PedidoArmazenado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function salvarPedidos(pedidos: PedidoArmazenado[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos))
  } catch {
    // se o storage não estiver disponível, ignora silenciosamente
  }
}

export function adicionarPedido(pedido: PedidoArmazenado) {
  const pedidos = listarPedidos()
  salvarPedidos([pedido, ...pedidos])
}
