import { Pool, types } from 'pg';
import { env } from './env';

types.setTypeParser(1082, (valor: string) => valor);
types.setTypeParser(1700, (valor: string) => parseFloat(valor));

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
});


pool.on('error', (error) => {
  console.error('Conexión con PostgreSQL perdida:', error.message);
});

export const probarConexion = async (): Promise<void> => {
  const cliente = await pool.connect();
  try {
    await cliente.query('select 1');
  } finally {
    cliente.release();
  }
};
