import { Router } from 'express';
import * as sucursalController from '../controllers/sucursal.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { soloAdmin } from '../middleware/rol.middleware';
import { validarSucursal } from '../middleware/validaciones';

const router = Router();

router.use(verificarToken);

router.get('/', sucursalController.listar);
router.get('/:id', sucursalController.obtener);
router.post('/', soloAdmin, validarSucursal, sucursalController.crear);
router.put('/:id', soloAdmin, validarSucursal, sucursalController.actualizar);
router.delete('/:id', soloAdmin, sucursalController.eliminar);

export default router;
