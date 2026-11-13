import { Router } from 'express';
import * as empleadoController from '../controllers/empleado.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { soloAdmin } from '../middleware/rol.middleware';
import { validarEmpleado } from '../middleware/validaciones';

const router = Router();

router.use(verificarToken);

router.get('/', empleadoController.listar);
router.get('/:id', empleadoController.obtener);
router.post('/', soloAdmin, validarEmpleado, empleadoController.crear);
router.put('/:id', soloAdmin, validarEmpleado, empleadoController.actualizar);
router.delete('/:id', soloAdmin, empleadoController.eliminar);

export default router;
