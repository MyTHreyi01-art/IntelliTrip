import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  logoutUser,
  getAdminOnlyData,
  getAllUsers,
  adminUpdateUser,
  adminDeleteUser
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Super Admin user management routes
router.get('/users', protect, authorizeRoles('Super Admin'), getAllUsers);
router.put('/users/:id', protect, authorizeRoles('Super Admin'), adminUpdateUser);
router.delete('/users/:id', protect, authorizeRoles('Super Admin'), adminDeleteUser);

// Route requiring Admin authorization (testing role protection)
router.get(
  '/admin-only',
  protect,
  authorizeRoles('Super Admin', 'Tourism Department Admin'),
  getAdminOnlyData
);

export default router;
