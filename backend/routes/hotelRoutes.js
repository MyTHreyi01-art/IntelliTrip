import express from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  addRoomToHotel
} from '../controllers/hotelController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/', protect, authorizeRoles('Hotel Owner', 'Super Admin'), createHotel);
router.put('/:id', protect, authorizeRoles('Hotel Owner', 'Super Admin'), updateHotel);
router.delete('/:id', protect, authorizeRoles('Hotel Owner', 'Super Admin'), deleteHotel);
router.post('/:hotelId/rooms', protect, authorizeRoles('Hotel Owner', 'Super Admin'), addRoomToHotel);

export default router;
