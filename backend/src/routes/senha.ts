import { Router, Request, Response } from 'express';
import pool from '../database';
import nodemailer from 'nodemailer';

const router = Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Armazena códigos temporários em memória
const codigos: Record<string, { codigo: string; expira: number }> = {};

// POST /api/senha/recuperar — envia código por email
router.post('/recuperar', async (req: Request, res: Response) => {
  const { ra } = req.body;

  if (!ra) {
    return res.status(400).json({ erro: 'RA é obrigatório' });
  }

  try {
    const [usuarios]: any = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [ra]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ erro: 'RA não encontrado' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    const expira = Date.now() + 10 * 60 * 1000

    codigos[ra] = { codigo, expira }

    const email = `${ra}@al.educacao.sp.gov.br`

    await transporter.sendMail({
      from: `"Amadeu Delivery" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Código de recuperação de senha - Amadeu Delivery',
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Amadeu Delivery</h2>
          <p>Seu código de recuperação de senha é:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #dc2626;">${codigo}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Este código expira em 10 minutos.</p>
          <p style="color: #6b7280; font-size: 14px;">Se você não solicitou a recuperação de senha, ignore este email.</p>
        </div>
      `,
    });

    res.json({ mensagem: 'Código enviado para seu email institucional!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao enviar email' });
  }
});

// POST /api/senha/verificar — verifica código e altera senha
router.post('/verificar', async (req: Request, res: Response) => {
  const { ra, codigo, novaSenha } = req.body;

  if (!ra || !codigo || !novaSenha) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  const registro = codigos[ra];

  if (!registro) {
    return res.status(400).json({ erro: 'Nenhum código solicitado para este RA' });
  }

  if (Date.now() > registro.expira) {
    delete codigos[ra];
    return res.status(400).json({ erro: 'Código expirado. Solicite um novo.' });
  }

  if (registro.codigo !== codigo) {
    return res.status(400).json({ erro: 'Código incorreto' });
  }

  try {
    await pool.query(
      'UPDATE usuarios SET senha_hash = ? WHERE email = ?',
      [novaSenha, ra]
    );

    delete codigos[ra];
    res.json({ mensagem: 'Senha alterada com sucesso!' });

  } catch (error) {
    res.status(500).json({ erro: 'Erro ao alterar senha' });
  }
});

export default router;