import express from 'express';
import {
  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience
} from '../controllers/experienceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getExperiences);
router.get('/:id', getExperienceById);
router.post('/', protect, authorizeRoles('Tour Guide', 'Local Business Owner', 'Travel Agency', 'Super Admin'), createExperience);
router.put('/:id', protect, authorizeRoles('Tour Guide', 'Local Business Owner', 'Travel Agency', 'Super Admin'), updateExperience);
router.delete('/:id', protect, authorizeRoles('Tour Guide', 'Local Business Owner', 'Travel Agency', 'Super Admin'), deleteExperience);

export default router;
