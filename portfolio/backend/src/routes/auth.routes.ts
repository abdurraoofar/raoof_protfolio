import { Router } from 'express';
import { postLogin, loginSchema } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate';

const router = Router();

router.post('/login', validateRequest(loginSchema), postLogin);

export default router;
