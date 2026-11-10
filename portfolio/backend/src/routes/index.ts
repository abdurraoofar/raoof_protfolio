import { Router } from 'express';
import healthRoutes from './health.routes';
import adminRoutes from './admin.routes';
import portfolioRoutes from './portfolio.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', adminRoutes);
router.use('/', portfolioRoutes);

export default router;
