import { Router } from 'express';
import * as operacionController from '../controllers/operacion.controller';
import * as movimientoController from '../controllers/movimiento.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { soloAdmin } from '../middleware/rol.middleware';
import {
  validarMovimiento,
  validarOperacion,
  validarTransferencia,
} from '../middleware/validaciones';

const router = Router();

// operaciones (solo admin)
router.post('/depositos', verificarToken, soloAdmin, validarOperacion, operacionController.depositar);
router.post('/retiros', verificarToken, soloAdmin, validarOperacion, operacionController.retirar);
router.post('/transferencias', verificarToken, soloAdmin, validarTransferencia, operacionController.transferir);
router.post('/movimientos', verificarToken, soloAdmin, validarMovimiento, operacionController.registrarMovimiento);

// consultas (cualquier usuario autenticado)
router.get('/movimientos', verificarToken, movimientoController.listar);
router.get('/movimientos/cuenta/:idCuenta', verificarToken, movimientoController.listarPorCuenta);
router.get('/reportes/resumen', verificarToken, movimientoController.resumen);

export default router;
