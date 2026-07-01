export async function login(ra: string, senha: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ra, senha }),
  });

  if (!res.ok) {
    const erro = await res.json();
    throw new Error(erro.erro || 'Erro ao fazer login');
  }

  return res.json();
}