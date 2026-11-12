import { Router } from 'express';
import * as clienteController from '../controllers/cliente.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { soloAdmin } from '../middleware/rol.middleware';
import { validarCliente } from '../middleware/validaciones';

const router = Router();

router.use(verificarToken);

router.get('/', clienteController.listar);
router.get('/:id', clienteController.obtener);
router.get('/:id/cuentas', clienteController.listarCuentas);
router.post('/', soloAdmin, validarCliente, clienteController.crear);
router.put('/:id', soloAdmin, validarCliente, clienteController.actualizar);
router.delete('/:id', soloAdmin, clienteController.eliminar);
router.patch('/:id/reactivar', soloAdmin, clienteController.reactivar);

export default router;
