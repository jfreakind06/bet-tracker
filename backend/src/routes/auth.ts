import { Router } from 'express';
import { login, register, checkUsername } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check-username/:username', checkUsername);

export default router;
