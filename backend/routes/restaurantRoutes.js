import express from 'express';
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from '../controllers/restaurantController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.post('/', protect, authorizeRoles('Local Business Owner', 'Super Admin'), createRestaurant);
router.put('/:id', protect, authorizeRoles('Local Business Owner', 'Super Admin'), updateRestaurant);
router.delete('/:id', protect, authorizeRoles('Local Business Owner', 'Super Admin'), deleteRestaurant);

export default router;
