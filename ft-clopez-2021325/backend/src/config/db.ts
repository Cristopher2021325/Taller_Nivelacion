import mysql, { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { env } from './env';

export const pool: Pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionLimit: 10,
 
  decimalNumbers: true,
  
  typeCast: (campo, siguiente) => (campo.type === 'DATE' ? campo.string() : siguiente()),
});


export type Ejecutor = Pool | PoolConnection;


export const consultar = async <T>(sql: string, params: unknown[] = [], ejecutor: Ejecutor = pool): Promise<T[]> => {
  const [filas] = await ejecutor.query(sql, params);
  return filas as T[];
};


export const ejecutar = async (sql: string, params: unknown[] = [], ejecutor: Ejecutor = pool): Promise<ResultSetHeader> => {
  const [resultado] = await ejecutor.query(sql, params);
  return resultado as ResultSetHeader;
};

export const probarConexion = async (): Promise<void> => {
  const conexion = await pool.getConnection();
  try {
    await conexion.query('select 1');
  } finally {
    conexion.release();
  }
};
