import { Router } from 'express';
import { getHealthCheck, getHealthDb, postHealthEcho, healthEchoSchema } from '../controllers/health.controller';
import { validateRequest } from '../middlewares/validate';

const router = Router();

router.get('/', getHealthCheck);
router.get('/db', getHealthDb);
router.post('/echo', validateRequest(healthEchoSchema), postHealthEcho);

export default router;
