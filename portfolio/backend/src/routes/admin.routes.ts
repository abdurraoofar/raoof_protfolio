import { Router } from 'express';
import {
  postAdminRegister,
  postAdminLogin,
  loginSchema,
  getAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
  projectSchema,
  getAdminMessages,
  deleteAdminMessage,
  patchAdminMessageRead,
  getAdminSkills,
  createAdminSkill,
  updateAdminSkill,
  deleteAdminSkill,
  skillSchema,
  getAdminExperiences,
  createAdminExperience,
  updateAdminExperience,
  deleteAdminExperience,
  experienceSchema,
  getAdminEducations,
  createAdminEducation,
  updateAdminEducation,
  deleteAdminEducation,
  educationSchema,
  getAdminProfile,
  updateAdminProfile,
  profileSchema,
  getAdminResumes,
  createAdminResume,
  activateAdminResume,
  getAdminSocialLinks,
  createAdminSocialLink,
  updateAdminSocialLink,
  deleteAdminSocialLink,
  socialLinkSchema
} from '../controllers/admin.controller';
import { validateRequest } from '../middlewares/validate';
import { authenticateAdmin } from '../middlewares/auth';

const router = Router();

// Public auth endpoints
router.post('/register', postAdminRegister);
router.post('/login', validateRequest(loginSchema), postAdminLogin);

// Protected routes
router.use(authenticateAdmin);

// Projects
router.get('/projects', getAdminProjects);
router.post('/projects', validateRequest(projectSchema), createAdminProject);
router.put('/projects/:id', validateRequest(projectSchema), updateAdminProject);
router.delete('/projects/:id', deleteAdminProject);

// Messages
router.get('/messages', getAdminMessages);
router.delete('/messages/:id', deleteAdminMessage);
router.patch('/messages/:id/read', patchAdminMessageRead);

// Skills
router.get('/skills', getAdminSkills);
router.post('/skills', validateRequest(skillSchema), createAdminSkill);
router.put('/skills/:id', validateRequest(skillSchema), updateAdminSkill);
router.delete('/skills/:id', deleteAdminSkill);

// Experiences
router.get('/experiences', getAdminExperiences);
router.post('/experiences', validateRequest(experienceSchema), createAdminExperience);
router.put('/experiences/:id', validateRequest(experienceSchema), updateAdminExperience);
router.delete('/experiences/:id', deleteAdminExperience);

// Educations
router.get('/educations', getAdminEducations);
router.post('/educations', validateRequest(educationSchema), createAdminEducation);
router.put('/educations/:id', validateRequest(educationSchema), updateAdminEducation);
router.delete('/educations/:id', deleteAdminEducation);

// Profile
router.get('/profile', getAdminProfile);
router.put('/profile', validateRequest(profileSchema), updateAdminProfile);

// Resume
router.get('/resume', getAdminResumes);
router.post('/resume', createAdminResume);
router.patch('/resume/:id/activate', activateAdminResume);

// Social Links
router.get('/social-links', getAdminSocialLinks);
router.post('/social-links', validateRequest(socialLinkSchema), createAdminSocialLink);
router.put('/social-links/:id', validateRequest(socialLinkSchema), updateAdminSocialLink);
router.delete('/social-links/:id', deleteAdminSocialLink);

export default router;
