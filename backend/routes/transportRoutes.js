import express from 'express';
import {
  getTransports,
  getTransportById,
  createTransport,
  updateTransport,
  deleteTransport
} from '../controllers/transportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getTransports);
router.get('/:id', getTransportById);
router.post('/', protect, authorizeRoles('Transport Provider', 'Super Admin'), createTransport);
router.put('/:id', protect, authorizeRoles('Transport Provider', 'Super Admin'), updateTransport);
router.delete('/:id', protect, authorizeRoles('Transport Provider', 'Super Admin'), deleteTransport);

export default router;
