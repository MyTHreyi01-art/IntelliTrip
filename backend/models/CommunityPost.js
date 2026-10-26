import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Post content is required']
    },
    category: {
      type: String,
      enum: ['Tips', 'Stories', 'Photos', 'Questions', 'Recommendations'],
      default: 'Stories'
    },
    image: {
      type: String,
      default: ''
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        userName: {
          type: String,
          default: 'Anonymous Tourist'
        },
        text: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isReported: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
export default CommunityPost;
