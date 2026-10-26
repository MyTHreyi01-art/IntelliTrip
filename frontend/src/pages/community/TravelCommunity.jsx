import React, { useState, useEffect } from 'react';
import { communityService } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import { MessageSquare, Heart, Share2, PlusCircle, Tag, User, Trash2, Send } from 'lucide-react';

const TravelCommunity = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'Stories',
    image: ''
  });

  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await communityService.getPosts(activeCategory);
      setPosts(res.data || []);
    } catch (err) {
      showNotification(err.message || 'Failed to fetch community posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    try {
      await communityService.createPost(newPost);
      showNotification('Community post published!', 'success');
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', category: 'Stories', image: '' });
      fetchPosts();
    } catch (err) {
      showNotification(err.message || 'Failed to create post', 'error');
    }
  };

  const handleToggleLike = async (postId) => {
    if (!user) {
      showNotification('Please login to like posts', 'warning');
      return;
    }
    try {
      await communityService.toggleLike(postId);
      fetchPosts();
    } catch (err) {
      showNotification(err.message || 'Failed to update like', 'error');
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      await communityService.addComment(postId, text);
      showNotification('Comment added', 'success');
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (err) {
      showNotification(err.message || 'Failed to add comment', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await communityService.deletePost(postId);
      showNotification('Post deleted', 'success');
      fetchPosts();
    } catch (err) {
      showNotification(err.message || 'Failed to delete post', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <MessageSquare size={14} /> Travel Community Forum
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem' }}>
            Global Traveler Network
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Share itineraries, local recommendations, travel tips, and stories.</p>
        </div>

        {user && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Share Travel Story
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['', 'Tips', 'Stories', 'Photos', 'Questions', 'Recommendations'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.85rem' }}
          >
            {cat || 'All Category Topics'}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {loading ? (
        <Loader message="Loading travel community discussions..." />
      ) : posts.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No community posts yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Be the first tourist to share a travel tip or story!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {posts.map((post) => {
            const isLiked = user && post.likes?.some((id) => id === user._id || id._id === user._id);
            return (
              <div key={post._id} className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={styles.avatarCircle}>
                      <User size={20} color="#fff" />
                    </div>
                    <div>
                      <strong style={{ fontSize: '1rem', display: 'block' }}>{post.user?.name || 'Anonymous Tourist'}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {post.user?.role || 'Tourist'} • {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-secondary">{post.category}</span>
                    {user && (post.user?._id === user._id || user.role?.includes('Admin')) && (
                      <button onClick={() => handleDeletePost(post._id)} style={styles.iconBtn} title="Delete Post">
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{post.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '1rem' }}>{post.content}</p>

                {post.image && (
                  <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <button onClick={() => handleToggleLike(post._id)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: isLiked ? '#ef4444' : 'var(--text-muted)' }}>
                    <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} />
                    <span>{post.likes?.length || 0} Likes</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <MessageSquare size={18} />
                    <span>{post.comments?.length || 0} Comments</span>
                  </div>
                </div>

                {/* Comment Section */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                  {post.comments && post.comments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
                      {post.comments.map((c, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.88rem' }}>
                          <strong style={{ color: 'var(--color-primary)', marginRight: '0.5rem' }}>{c.userName}:</strong>
                          <span>{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {user && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Write a comment..."
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                      />
                      <button onClick={() => handleAddComment(post._id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        <Send size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card" style={styles.modalContent}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>Create Travel Post</h2>
            <form onSubmit={handleCreatePost}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Post Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g., Top 5 Hidden Cafes in Mysore"
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Category</label>
                <select className="form-control" value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}>
                  {['Tips', 'Stories', 'Photos', 'Questions', 'Recommendations'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your travel insight..."
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Image URL (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPost.image}
                  onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  avatarCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1rem'
  },
  modalContent: {
    width: '100%',
    maxWidth: '550px',
    padding: '2rem',
    background: '#1a1a24'
  }
};

export default TravelCommunity;
