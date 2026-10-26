import Experience from '../models/Experience.js';
import { recordActivity } from '../models/ActivityLog.js';

// @desc    Get local experiences & activities
// @route   GET /api/v1/experiences
// @access  Public
export const getExperiences = async (req, res, next) => {
  try {
    const { destinationId, category, search, maxPrice } = req.query;
    const query = {};

    if (destinationId) query.destination = destinationId;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (maxPrice) query.pricePerPerson = { $lte: Number(maxPrice) };

    const experiences = await Experience.find(query)
      .populate('destination', 'name city country')
      .populate('provider', 'name email phone');

    res.json({ success: true, count: experiences.length, data: experiences });
  } catch (error) {
    next(error);
  }
};

// @desc    Get experience details by ID
// @route   GET /api/v1/experiences/:id
// @access  Public
export const getExperienceById = async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id)
      .populate('destination', 'name city country')
      .populate('provider', 'name email phone bio');

    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }
    res.json({ success: true, data: experience });
  } catch (error) {
    next(error);
  }
};

// @desc    Create local experience (Tour Guide / Business / Admin)
// @route   POST /api/v1/experiences
// @access  Private
export const createExperience = async (req, res, next) => {
  try {
    const experience = await Experience.create({
      ...req.body,
      provider: req.user._id
    });

    await recordActivity({
      user: req.user,
      action: 'Created Experience',
      module: 'Experience',
      details: `${req.user.name} created experience "${experience.title}"`,
      entityId: experience._id,
      metadata: { title: experience.title, category: experience.category }
    });

    res.status(201).json({ success: true, data: experience });
  } catch (error) {
    next(error);
  }
};

// @desc    Update experience (Tour Guide / Business / Admin)
// @route   PUT /api/v1/experiences/:id
// @access  Private
export const updateExperience = async (req, res, next) => {
  try {
    let experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    if (experience.provider && experience.provider.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this experience' });
    }

    experience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await recordActivity({
      user: req.user,
      action: 'Updated Experience',
      module: 'Experience',
      details: `${req.user.name} updated experience "${experience.title}"`,
      entityId: experience._id,
      metadata: { title: experience.title }
    });

    res.json({ success: true, data: experience });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete experience (Tour Guide / Business / Admin)
// @route   DELETE /api/v1/experiences/:id
// @access  Private
export const deleteExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    if (experience.provider && experience.provider.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this experience' });
    }

    await Experience.findByIdAndDelete(req.params.id);

    await recordActivity({
      user: req.user,
      action: 'Deleted Experience',
      module: 'Experience',
      details: `${req.user.name} deleted experience "${experience.title}"`,
      entityId: req.params.id,
      metadata: { title: experience.title }
    });

    res.json({ success: true, message: 'Experience deleted successfully' });
  } catch (error) {
    next(error);
  }
};
