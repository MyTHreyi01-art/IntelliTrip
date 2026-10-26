import express from 'express';
import {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
} from '../controllers/destinationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getDestinations);
router.get('/:id', getDestinationById);
router.post('/', protect, authorizeRoles('Super Admin', 'Tourism Department Admin'), createDestination);
router.put('/:id', protect, authorizeRoles('Super Admin', 'Tourism Department Admin'), updateDestination);
router.delete('/:id', protect, authorizeRoles('Super Admin', 'Tourism Department Admin'), deleteDestination);

export default router;
