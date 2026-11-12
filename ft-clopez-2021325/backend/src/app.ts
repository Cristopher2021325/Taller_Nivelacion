import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { manejarErrores, rutaNoEncontrada } from './middleware/error.middleware';
import routes from './routes';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({ mensaje: 'API Sistema Bancario en funcionamiento' });
});

app.use('/api', routes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
