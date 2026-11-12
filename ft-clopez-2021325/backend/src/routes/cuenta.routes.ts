import { Router } from 'express';
import * as cuentaController from '../controllers/cuenta.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { soloAdmin } from '../middleware/rol.middleware';
import { validarCuenta } from '../middleware/validaciones';

const router = Router();

router.use(verificarToken);

router.get('/', cuentaController.listar);
router.get('/:id', cuentaController.obtener);
router.post('/', soloAdmin, validarCuenta, cuentaController.crear);
router.put('/:id', soloAdmin, validarCuenta, cuentaController.actualizar);
router.delete('/:id', soloAdmin, cuentaController.eliminar);

export default router;
