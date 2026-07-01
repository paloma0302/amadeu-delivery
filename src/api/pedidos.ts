export async function criarPedido(aluno_id: number, itens: { produto_id: number; quantidade: number }[]) {
  const res = await fetch('/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aluno_id, itens }),
  });

  if (!res.ok) {
    const erro = await res.json();
    throw new Error(erro.erro || 'Erro ao criar pedido');
  }

  return res.json();
}

export async function getPedidos() {
  const res = await fetch('/api/pedidos');
  if (!res.ok) throw new Error('Erro ao carregar pedidos');
  return res.json();
}

export async function atualizarStatusPedido(id: number, status: string) {
  const res = await fetch(`/api/pedidos/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar status');
  return res.json();
}