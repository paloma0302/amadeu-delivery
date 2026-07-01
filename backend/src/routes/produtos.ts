import { Router, Request, Response } from 'express';
import pool from '../database';

const router = Router();

// GET /api/produtos
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.nome AS categoria_nome
      FROM produtos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.disponivel = TRUE AND c.ativa = TRUE
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

// PUT /api/produtos/:id/estoque — atualiza estoque
router.put('/:id/estoque', async (req: Request, res: Response) => {
  const { quantidade } = req.body;
  try {
    await pool.query(
      'UPDATE produtos SET estoque = ? WHERE id = ?',
      [quantidade, req.params.id]
    );
    res.json({ mensagem: 'Estoque atualizado!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar estoque' });
  }
});

export default router;