import { Router, Request, Response } from 'express';
import pool from '../database';

const router = Router();

// GET /api/pedidos — lista todos os pedidos
router.get('/', async (req: Request, res: Response) => {
  try {
    const [pedidos]: any = await pool.query(`
      SELECT 
        pe.id,
        pe.status,
        pe.total,
        pe.criado_em,
        u.nome AS aluno,
        GROUP_CONCAT(CONCAT(p.nome, ' x', ip.quantidade) SEPARATOR ', ') AS itens
      FROM pedidos pe
      JOIN usuarios u ON pe.aluno_id = u.id
      JOIN itens_pedido ip ON pe.id = ip.pedido_id
      JOIN produtos p ON ip.produto_id = p.id
      WHERE pe.status != 'entregue'
      GROUP BY pe.id, pe.status, pe.total, pe.criado_em, u.nome
      ORDER BY pe.criado_em DESC
    `);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
});

// POST /api/pedidos — cria pedido e desconta estoque
router.post('/', async (req: Request, res: Response) => {
  const { aluno_id, itens } = req.body;

  if (!aluno_id || !itens || itens.length === 0) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  // Verifica se está no horário permitido para pedidos
  const agora = new Date();
  const minutos = agora.getHours() * 60 + agora.getMinutes();
  const bloqueios = [
    { inicio: 9 * 60 + 40, fim: 10 * 60 + 10 },
    { inicio: 11 * 60 + 50, fim: 24 * 60 },
  ];
  const bloqueado = bloqueios.some(b => minutos >= b.inicio && minutos < b.fim);
  if (bloqueado) {
    return res.status(403).json({ erro: 'Fora do horário permitido para pedidos' });
  }

  const connection = await (pool as any).getConnection();

  try {
    await connection.beginTransaction();

    const [pedidoResult]: any = await connection.query(
      'INSERT INTO pedidos (aluno_id, status, total) VALUES (?, ?, 0)',
      [aluno_id, 'pendente']
    );
    const pedidoId = pedidoResult.insertId;

    for (const item of itens) {
      const [produto]: any = await connection.query(
        'SELECT estoque, preco FROM produtos WHERE id = ? FOR UPDATE',
        [item.produto_id]
      );

      if (produto.length === 0) {
        throw new Error(`Produto ${item.produto_id} não encontrado`);
      }

      if (produto[0].estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto ${item.produto_id}`);
      }

      await connection.query(
        'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, item.produto_id, item.quantidade, produto[0].preco]
      );

      await connection.query(
        'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
        [item.quantidade, item.produto_id]
      );
    }

    const [totalResult]: any = await connection.query(
      'SELECT SUM(quantidade * preco_unitario) as total FROM itens_pedido WHERE pedido_id = ?',
      [pedidoId]
    );
    await connection.query(
      'UPDATE pedidos SET total = ? WHERE id = ?',
      [totalResult[0].total, pedidoId]
    );

    await connection.commit();
    res.status(201).json({ mensagem: 'Pedido criado com sucesso!', pedidoId });

  } catch (error: any) {
    await connection.rollback();
    res.status(400).json({ erro: error.message });
  } finally {
    connection.release();
  }
});

// GET /api/pedidos/:id — busca pedido por id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [pedido]: any = await pool.query(
      'SELECT * FROM pedidos WHERE id = ?',
      [req.params.id]
    );
    if (pedido.length === 0) return res.status(404).json({ erro: 'Pedido não encontrado' });

    const [itens]: any = await pool.query(
      `SELECT ip.*, p.nome FROM itens_pedido ip 
       JOIN produtos p ON ip.produto_id = p.id 
       WHERE ip.pedido_id = ?`,
      [req.params.id]
    );

    res.json({ ...pedido[0], itens });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar pedido' });
  }
});

// PUT /api/pedidos/:id/status — atualiza status do pedido
router.put('/:id/status', async (req: Request, res: Response) => {
  const { status } = req.body;
  try {
    await pool.query(
      'UPDATE pedidos SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ mensagem: 'Status atualizado!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

export default router;