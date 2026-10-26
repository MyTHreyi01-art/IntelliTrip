import express from 'express';
import {
  getPosts,
  createPost,
  toggleLikePost,
  addCommentPost,
  deletePost
} from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/posts', getPosts);
router.post('/posts', protect, createPost);
router.post('/posts/:id/like', protect, toggleLikePost);
router.post('/posts/:id/comment', protect, addCommentPost);
router.delete('/posts/:id', protect, deletePost);

export default router;
