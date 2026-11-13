import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const env = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'sistema_bancario',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'clave_secreta_sistema_bancario_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
};
