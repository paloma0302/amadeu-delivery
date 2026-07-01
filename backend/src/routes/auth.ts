import { Router, Request, Response } from 'express';
import pool from '../database';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { ra, senha } = req.body;

  if (!ra || !senha) {
    return res.status(400).json({ erro: 'RA e senha são obrigatórios' });
  }

  try {
    // Verifica se o usuário já existe
    const [usuarios]: any = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [ra]
    );

    if (usuarios.length > 0) {
      // Usuário existe — verifica a senha
      const usuario = usuarios[0];
      if (usuario.senha_hash !== senha) {
        return res.status(401).json({ erro: 'Senha incorreta' });
      }
      return res.json({
        id: usuario.id,
        nome: usuario.nome,
        ra: usuario.email,
        tipo: usuario.tipo,
      });
    }

    // Usuário não existe — cria automaticamente
    const tipo = /^rg\d+sp$/.test(ra) ? 'admin' : 'aluno';
    const [resultado]: any = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)',
      [ra, ra, senha, tipo]
    );

    res.status(201).json({
      id: resultado.insertId,
      nome: ra,
      ra,
      tipo,
    });

  } catch (error) {
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

export default router;