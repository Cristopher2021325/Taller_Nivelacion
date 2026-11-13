import { Router } from 'express';
import authRoutes from './auth.routes';
import clienteRoutes from './cliente.routes';
import cuentaRoutes from './cuenta.routes';
import empleadoRoutes from './empleado.routes';
import operacionRoutes from './operacion.routes';
import sucursalRoutes from './sucursal.routes';
import tipoCuentaRoutes from './tipo-cuenta.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clientes', clienteRoutes);
router.use('/cuentas', cuentaRoutes);
router.use('/tipos-cuenta', tipoCuentaRoutes);
router.use('/sucursales', sucursalRoutes);
router.use('/empleados', empleadoRoutes);
router.use('/', operacionRoutes);

export default router;
