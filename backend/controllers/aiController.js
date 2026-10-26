import { aiService } from '../services/aiService.js';
import { pythonAiService } from '../services/pythonAiService.js';
import Itinerary from '../models/Itinerary.js';
import TravelDNA from '../models/TravelDNA.js';
import Destination from '../models/Destination.js';
import Hotel from '../models/Hotel.js';
import Experience from '../models/Experience.js';
import Booking from '../models/Booking.js';
import { recordActivity } from '../models/ActivityLog.js';

// @desc    AI Travel Assistant Chat (Natural Language Query)
// @route   POST /api/v1/ai/assistant
// @access  Public / Private
export const chatAssistant = async (req, res, next) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Please provide a travel query prompt' });
    }

    // Context from database
    const destinations = await Destination.find()
      .select('name city category averageCostPerDay bestTimeToVisit description attractions knownFor historicalBackground')
      .limit(20);
    const conversationHistory = Array.isArray(history)
      ? history.slice(-8)
        .filter((message) => ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
        .map((message) => ({ role: message.role, content: message.content.slice(0, 1000) }))
      : [];
    const response = await aiService.askTravelAssistant(prompt, { destinations }, conversationHistory);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI Day-by-Day Itinerary & Save
// @route   POST /api/v1/ai/generate-itinerary
// @access  Private
export const generateItinerary = async (req, res, next) => {
  try {
    const { destination, days, budget, travelers, interests, saveItinerary } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, message: 'Destination is required' });
    }

    // Fetch catalog context
    const destDoc = await Destination.findOne({
      $or: [
        { name: { $regex: destination, $options: 'i' } },
        { city: { $regex: destination, $options: 'i' } }
      ]
    });

    const catalogData = {
      destination: destDoc ? destDoc.name : destination,
      city: destDoc ? destDoc.city : destination,
      knownFor: destDoc?.knownFor || '',
      historicalBackground: destDoc?.historicalBackground || '',
      bestTimeToVisit: destDoc?.bestTimeToVisit || '',
      attractions: (destDoc?.attractions || []).map(({ name, description, whyNotMiss }) => ({
        name,
        description,
        whyNotMiss
      }))
    };

    const itineraryResult = await aiService.generateAIItinerary({
      destination,
      days,
      budget,
      travelers,
      interests,
      catalogData
    });

    let savedDoc = null;
    if (saveItinerary === true && req.user) {
      savedDoc = await Itinerary.create({
        user: req.user._id,
        title: itineraryResult.title || `${days || 3}-Day Trip to ${destination}`,
        destinationName: destination,
        destination: destDoc ? destDoc._id : null,
        durationDays: Number(days) || 3,
        travelers: Number(travelers) || 2,
        totalBudget: Number(budget) || 15000,
        estimatedExpenses: itineraryResult.estimatedExpenses,
        interests: Array.isArray(interests) ? interests : [interests || 'Sightseeing'],
        dayPlans: itineraryResult.dayPlans,
        status: 'Saved'
      });
    }

    const responseData = savedDoc
      ? { ...savedDoc.toObject(), source: itineraryResult.source, isSaved: true }
      : {
          ...itineraryResult,
          destinationName: destination,
          durationDays: Number(days),
          travelers: Number(travelers),
          totalBudget: Number(budget),
          interests,
          isSaved: false
        };

    res.status(201).json({
      success: true,
      message: savedDoc ? 'AI Itinerary generated and saved successfully' : 'AI Itinerary generated successfully',
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save an AI-generated itinerary to user profile
// @route   POST /api/v1/ai/itineraries OR POST /api/v1/ai/save-itinerary
// @access  Private
export const saveItinerary = async (req, res, next) => {
  try {
    const {
      title,
      destinationName,
      durationDays,
      travelers,
      totalBudget,
      estimatedExpenses,
      interests,
      dayPlans,
      destinationId
    } = req.body;

    let destDoc = null;
    if (destinationId) {
      destDoc = await Destination.findById(destinationId);
    } else if (destinationName) {
      destDoc = await Destination.findOne({
        $or: [
          { name: { $regex: destinationName, $options: 'i' } },
          { city: { $regex: destinationName, $options: 'i' } }
        ]
      });
    }

    const newItinerary = await Itinerary.create({
      user: req.user._id,
      title: title || `${durationDays || 3}-Day Trip to ${destinationName || 'Destination'}`,
      destinationName: destinationName || 'Custom Destination',
      destination: destDoc ? destDoc._id : null,
      durationDays: Number(durationDays) || 3,
      travelers: Number(travelers) || 2,
      totalBudget: Number(totalBudget) || 15000,
      estimatedExpenses: estimatedExpenses || {},
      interests: Array.isArray(interests) ? interests : [interests || 'Sightseeing'],
      dayPlans: dayPlans || [],
      status: 'Saved'
    });

    await recordActivity({
      user: req.user,
      action: 'Saved AI Itinerary',
      module: 'Itinerary',
      details: `${req.user.name} saved an AI itinerary for ${destinationName || 'Destination'} (${durationDays || 3} days)`,
      entityId: newItinerary._id,
      metadata: { destinationName, durationDays, totalBudget }
    });

    res.status(201).json({
      success: true,
      message: 'AI Itinerary saved successfully to your profile',
      data: newItinerary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved itineraries (Super Admin & Tourism Admin)
// @route   GET /api/v1/ai/itineraries/all
// @access  Private (Super Admin)
export const getAllItineraries = async (req, res, next) => {
  try {
    const itineraries = await Itinerary.find()
      .populate('user', 'name email role')
      .populate('destination', 'name city images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: itineraries.length, data: itineraries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved itineraries
// @route   GET /api/v1/ai/itineraries
// @access  Private
export const getUserItineraries = async (req, res, next) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user._id })
      .populate('destination', 'name city images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: itineraries.length, data: itineraries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single itinerary by ID
// @route   GET /api/v1/ai/itineraries/:id
// @access  Private
export const getItineraryById = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id).populate('destination');
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    res.json({ success: true, data: itinerary });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a saved itinerary
// @route   DELETE /api/v1/ai/itineraries/:id
// @access  Private
export const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    if (itinerary.user.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this itinerary' });
    }

    await Itinerary.findByIdAndDelete(req.params.id);

    await recordActivity({
      user: req.user,
      action: 'Deleted AI Itinerary',
      module: 'Itinerary',
      details: `${req.user.name} deleted AI itinerary "${itinerary.title || itinerary.destinationName}"`,
      entityId: req.params.id,
      metadata: { title: itinerary.title, destinationName: itinerary.destinationName }
    });

    res.json({
      success: true,
      message: 'Itinerary deleted successfully',
      data: { _id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Budget Planner & Dynamic Guardian Analysis
// @route   POST /api/v1/ai/budget-planner
// @access  Public / Private
export const budgetPlanner = async (req, res, next) => {
  try {
    const { destination, days, budget, travelers } = req.body;
    const result = await aiService.calculateBudgetPlanner({ destination, days, budget, travelers });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's Travel DNA profile
// @route   GET /api/v1/ai/travel-dna
// @access  Private
export const getTravelDNA = async (req, res, next) => {
  try {
    let dna = await TravelDNA.findOne({ user: req.user._id });
    if (!dna) {
      dna = await TravelDNA.create({
        user: req.user._id,
        scores: { adventure: 75, nature: 80, culture: 60, food: 85, relaxation: 65, luxury: 50, budget: 70, photography: 80 },
        primaryStyle: 'Adventure & Nature Seeker'
      });
    }
    res.json({ success: true, data: dna });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Travel DNA scores
// @route   PUT /api/v1/ai/travel-dna
// @access  Private
export const updateTravelDNA = async (req, res, next) => {
  try {
    const { scores, primaryStyle } = req.body;
    let dna = await TravelDNA.findOne({ user: req.user._id });
    if (!dna) {
      dna = new TravelDNA({ user: req.user._id });
    }

    if (scores) {
      dna.scores = { ...dna.scores, ...scores };
    }
    if (primaryStyle) {
      dna.primaryStyle = primaryStyle;
    }

    await dna.save();
    res.json({ success: true, message: 'Travel DNA profile updated', data: dna });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized recommendations using real MongoDB catalog & Travel DNA
// @route   GET /api/v1/ai/recommendations
// @access  Private
export const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    let dnaDoc = await TravelDNA.findOne({ user: req.user._id });
    const dnaScores = dnaDoc ? dnaDoc.scores : { adventure: 75, nature: 80, culture: 60, food: 85, luxury: 50 };

    const [destinations, hotels, experiences, completedTrips, pastBookings] = await Promise.all([
      Destination.find(),
      Hotel.find(),
      Experience.find(),
      Itinerary.find({ user: req.user._id, status: 'Completed' })
        .select('destinationName interests')
        .lean(),
      Booking.find({ user: req.user._id, status: { $ne: 'Cancelled' }, endDate: { $lt: new Date() } })
        .populate({ path: 'itemRef', populate: { path: 'destination', select: 'name city' } })
        .select('itemType itemRef')
        .lean()
    ]);

    const tripHistory = {
      visitedDestinationNames: [
        ...completedTrips.map((trip) => trip.destinationName),
        ...pastBookings.map((booking) => {
          const item = booking.itemRef;
          return item?.destination?.name || item?.destination?.city || item?.city;
        }).filter(Boolean)
      ],
      interests: [...new Set(completedTrips.flatMap((trip) => trip.interests || []))]
    };
    const scored = aiService.scorePersonalizedRecommendations(
      dnaScores,
      destinations,
      hotels,
      experiences,
      tripHistory
    );

    res.json({
      success: true,
      data: scored
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PHASE 4: PYTHON ML FASTAPI INTEGRATIONS
// ==========================================

// @desc    1. Review Sentiment Analysis
// @route   POST /api/v1/ai/sentiment
// @access  Public / Private
export const analyzeReviewSentiment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Review text is required for sentiment analysis' });
    }
    const result = await pythonAiService.analyzeSentiment(text);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    2. Crowd Prediction (Estimate)
// @route   POST /api/v1/ai/predict-crowd
// @access  Public / Private
export const predictCrowdDensity = async (req, res, next) => {
  try {
    const { destinationName, month, dayOfWeek } = req.body;
    if (!destinationName) {
      return res.status(400).json({ success: false, message: 'destinationName is required' });
    }
    const result = await pythonAiService.predictCrowd(destinationName, month, dayOfWeek);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    3. Tourism Demand Forecasting (Estimate)
// @route   POST /api/v1/ai/forecast-demand
// @access  Public / Private
export const forecastTourismDemand = async (req, res, next) => {
  try {
    const { destinationName, targetMonth } = req.body;
    if (!destinationName) {
      return res.status(400).json({ success: false, message: 'destinationName is required' });
    }
    const result = await pythonAiService.forecastDemand(destinationName, targetMonth);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    4. Group Travel Intelligence Consensus
// @route   POST /api/v1/ai/group-consensus
// @access  Public / Private
export const groupTravelConsensus = async (req, res, next) => {
  try {
    const { travelersPreferences } = req.body;
    if (!travelersPreferences || !Array.isArray(travelersPreferences) || travelersPreferences.length === 0) {
      return res.status(400).json({ success: false, message: 'travelersPreferences array is required' });
    }
    const result = await pythonAiService.calculateGroupConsensus(travelersPreferences);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    5. Hidden Gems Recommendation
// @route   POST /api/v1/ai/hidden-gems
// @access  Public / Private
export const getHiddenGemRecommendations = async (req, res, next) => {
  try {
    const { category, maxCost } = req.body;
    const result = await pythonAiService.getHiddenGems(category, maxCost);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    6. Sustainability Scoring & Carbon Estimate
// @route   POST /api/v1/ai/sustainability
// @access  Public / Private
export const calculateSustainabilityScore = async (req, res, next) => {
  try {
    const { transportType, distanceKm } = req.body;
    if (!transportType || distanceKm === undefined) {
      return res.status(400).json({ success: false, message: 'transportType and distanceKm are required' });
    }
    const result = await pythonAiService.calculateSustainability(transportType, Number(distanceKm));
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

