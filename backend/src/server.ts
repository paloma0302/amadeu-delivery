import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import produtosRouter from './routes/produtos';
import pedidosRouter from './routes/pedidos';
import authRouter from './routes/auth';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/pedidos', pedidosRouter);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});