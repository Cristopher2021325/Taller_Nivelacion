import app from './app';
import { probarConexion } from './config/db';
import { env } from './config/env';

const iniciar = async () => {
  try {
    await probarConexion();
    console.log('Conexión a MySQL establecida correctamente');
  } catch (error) {
    console.error('No se pudo conectar a MySQL:', (error as Error).message);
  }

  app.listen(env.port, () => {
    console.log(`Servidor escuchando en http://localhost:${env.port}/api`);
  });
};

iniciar();