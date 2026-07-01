export async function getProdutosEstoque() {
  const res = await fetch('/api/produtos');
  if (!res.ok) throw new Error('Erro ao carregar estoque');
  return res.json();
}

export async function atualizarEstoque(id: number, quantidade: number) {
  const res = await fetch(`/api/produtos/${id}/estoque`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantidade }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar estoque');
  return res.json();
}