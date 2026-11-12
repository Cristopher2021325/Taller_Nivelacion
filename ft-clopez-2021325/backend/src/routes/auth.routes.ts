import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { validarLogin } from '../middleware/validaciones';

const router = Router();

router.post('/login', validarLogin, authController.login);
router.get('/perfil', verificarToken, authController.perfil);

export default router;
