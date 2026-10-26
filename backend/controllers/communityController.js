import CommunityPost from '../models/CommunityPost.js';
import { recordActivity } from '../models/ActivityLog.js';

// @desc    Get all community posts
// @route   GET /api/v1/community/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const posts = await CommunityPost.find(filter)
      .populate('user', 'name role avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post
// @route   POST /api/v1/community/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { title, content, category, image } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const post = await CommunityPost.create({
      user: req.user._id,
      title,
      content,
      category: category || 'Stories',
      image: image || ''
    });

    const populated = await CommunityPost.findById(post._id).populate('user', 'name role avatar');

    await recordActivity({
      user: req.user,
      action: 'Created Community Post',
      module: 'Community',
      details: `${req.user.name} published community story "${post.title}" (${post.category})`,
      entityId: post._id,
      metadata: { title: post.title, category: post.category }
    });

    res.status(201).json({
      success: true,
      message: 'Community post created successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a post
// @route   POST /api/v1/community/posts/:id/like
// @access  Private
export const toggleLikePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id.toString();
    const index = post.likes.findIndex((id) => id.toString() === userId);

    if (index >= 0) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({
      success: true,
      data: { likesCount: post.likes.length, isLiked: index < 0 }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/v1/community/posts/:id/comment
// @access  Private
export const addCommentPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      userName: req.user.name,
      text
    });

    await post.save();
    const updated = await CommunityPost.findById(post._id).populate('user', 'name role avatar');

    res.json({
      success: true,
      message: 'Comment added',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/v1/community/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString() && !req.user.role.includes('Admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    await recordActivity({
      user: req.user,
      action: 'Deleted Community Post',
      module: 'Community',
      details: `${req.user.name} removed community post "${post.title}"`,
      entityId: req.params.id,
      metadata: { title: post.title }
    });

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};
