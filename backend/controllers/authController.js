import User, { USER_ROLES } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { recordActivity } from '../models/ActivityLog.js';

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, password, role, bio } = req.body;
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    const normalizedPhone = String(req.body.phone || '').replace(/\D/g, '');
    console.log(`[API /register] Registering user: ${normalizedEmail}, role: ${role}`);

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : [])
      ]
    });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === normalizedEmail
          ? 'An account with this email already exists'
          : 'An account with this phone number already exists'
      });
    }

    // Validate role if specified
    let selectedRole = role || 'Tourist';
    if (role && !USER_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Allowed roles: ${USER_ROLES.join(', ')}`
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: selectedRole,
      phone: normalizedPhone,
      bio: bio || ''
    });

    if (user) {
      const token = generateToken(user._id, user.role);
      console.log(`[API /register] User created successfully: ${user._id}`);

      await recordActivity({
        user,
        action: 'User Registered',
        module: 'User',
        details: `New account created: ${user.name} (${user.email}) registered as ${user.role}`,
        entityId: user._id,
        metadata: { role: user.role, email: user.email }
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          bio: user.bio,
          token
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error(`[API /register Error] ${error.message}`);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'That email or phone number is already registered' });
    }
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { password } = req.body;
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    console.log(`[API /login] Login attempt for: ${normalizedEmail}`);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        userExists: false,
        message: 'No account found with this email. Please sign up to create an account.'
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        userExists: true,
        message: 'Incorrect password. Please try again.'
      });
    }

    const token = generateToken(user._id, user.role);
    console.log(`[API /login] Login successful for user: ${user._id}`);

    await recordActivity({
      user,
      action: 'User Signed In',
      module: 'User',
      details: `${user.name} logged into IntelliTrip as ${user.role}`,
      entityId: user._id,
      metadata: { role: user.role, email: user.email }
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        token
      }
    });
  } catch (error) {
    console.error(`[API /login Error] ${error.message}`);
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const token = generateToken(updatedUser._id, updatedUser.role);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  return res.json({
    success: true,
    message: 'User logged out successfully'
  });
};

// @desc    Admin-only protected endpoint test
// @route   GET /api/v1/auth/admin-only
// @access  Private (Admin roles only)
export const getAdminOnlyData = async (req, res) => {
  return res.json({
    success: true,
    message: 'Access granted to Admin-protected resource',
    data: {
      adminRole: req.user.role,
      systemMetrics: { activeUsers: 42, serverHealth: 'Optimal' }
    }
  });
};

// @desc    Get all users (Super Admin only)
// @route   GET /api/v1/auth/users
// @access  Private (Super Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update user role or info
// @route   PUT /api/v1/auth/users/:id
// @access  Private (Super Admin)
export const adminUpdateUser = async (req, res, next) => {
  try {
    const { name, email, role, phone, bio } = req.body;
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role && !USER_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    if (name) userToUpdate.name = name;
    if (email) userToUpdate.email = email.trim().toLowerCase();
    if (role) userToUpdate.role = role;
    if (phone !== undefined) userToUpdate.phone = phone;
    if (bio !== undefined) userToUpdate.bio = bio;

    if (req.body.password) {
      userToUpdate.password = req.body.password;
    }

    await userToUpdate.save();

    await recordActivity({
      user: req.user,
      action: 'Admin Modified User',
      module: 'User',
      details: `Super Admin ${req.user.name} modified account for ${userToUpdate.name} (${userToUpdate.email})`,
      entityId: userToUpdate._id,
      metadata: { targetUser: userToUpdate.email, newRole: userToUpdate.role }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
        phone: userToUpdate.phone,
        bio: userToUpdate.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete user
// @route   DELETE /api/v1/auth/users/:id
// @access  Private (Super Admin)
export const adminDeleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (userToDelete._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active administrator account' });
    }

    await User.findByIdAndDelete(req.params.id);

    await recordActivity({
      user: req.user,
      action: 'Admin Deleted User',
      module: 'User',
      details: `Super Admin ${req.user.name} deleted user account ${userToDelete.name} (${userToDelete.email})`,
      entityId: req.params.id,
      metadata: { targetUser: userToDelete.email }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
