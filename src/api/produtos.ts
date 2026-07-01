const API_URL = '';

export async function getProdutos() {
  const res = await fetch(`${API_URL}/api/produtos`);
  if (!res.ok) throw new Error('Erro ao carregar produtos');
  return res.json();
}

export async function getProdutosPorCategoria(categoriaId: number) {
  const res = await fetch(`${API_URL}/api/produtos?categoria=${categoriaId}`);
  if (!res.ok) throw new Error('Erro ao carregar produtos');
  return res.json();
}