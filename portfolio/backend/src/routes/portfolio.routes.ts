import { Router } from 'express';
import {
  getPortfolio,
  getProjects,
  getCertifications,
  getActiveResume,
  postContact,
  contactSchema
} from '../controllers/portfolio.controller';
import { validateRequest } from '../middlewares/validate';

const router = Router();

router.get('/portfolio', getPortfolio);
router.get('/projects', getProjects);
router.get('/certifications', getCertifications);
router.get('/resume/active', getActiveResume);
router.post('/contact', validateRequest(contactSchema), postContact);

export default router;
