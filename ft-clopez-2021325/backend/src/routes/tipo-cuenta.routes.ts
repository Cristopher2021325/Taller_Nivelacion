import { Router } from 'express';
import * as tipoCuentaController from '../controllers/tipo-cuenta.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { soloAdmin } from '../middleware/rol.middleware';
import { validarTipoCuenta } from '../middleware/validaciones';

const router = Router();

router.use(verificarToken);

router.get('/', tipoCuentaController.listar);
router.get('/:id', tipoCuentaController.obtener);
router.post('/', soloAdmin, validarTipoCuenta, tipoCuentaController.crear);
router.put('/:id', soloAdmin, validarTipoCuenta, tipoCuentaController.actualizar);
router.delete('/:id', soloAdmin, tipoCuentaController.eliminar);

export default router;
