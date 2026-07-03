import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import produtosRouter from './routes/produtos';
import pedidosRouter from './routes/pedidos';
import authRouter from './routes/auth';
import senhaRouter from './routes/senha';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/senha', senhaRouter);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});