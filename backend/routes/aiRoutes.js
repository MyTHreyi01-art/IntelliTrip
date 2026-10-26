import express from 'express';
import {
  chatAssistant,
  generateItinerary,
  saveItinerary,
  getUserItineraries,
  getAllItineraries,
  getItineraryById,
  deleteItinerary,
  budgetPlanner,
  getTravelDNA,
  updateTravelDNA,
  getPersonalizedRecommendations,
  analyzeReviewSentiment,
  predictCrowdDensity,
  forecastTourismDemand,
  groupTravelConsensus,
  getHiddenGemRecommendations,
  calculateSustainabilityScore
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/assistant', chatAssistant);
router.post('/generate-itinerary', protect, generateItinerary);
router.post('/save-itinerary', protect, saveItinerary);
router.post('/itineraries', protect, saveItinerary);
router.get('/itineraries/all', protect, authorizeRoles('Super Admin', 'Tourism Department Admin'), getAllItineraries);
router.get('/itineraries', protect, getUserItineraries);
router.get('/itineraries/:id', protect, getItineraryById);
router.delete('/itineraries/:id', protect, deleteItinerary);
router.post('/budget-planner', budgetPlanner);

router.get('/travel-dna', protect, getTravelDNA);
router.put('/travel-dna', protect, updateTravelDNA);
router.get('/recommendations', protect, getPersonalizedRecommendations);

// Phase 4 Advanced Python ML Endpoints
router.post('/sentiment', analyzeReviewSentiment);
router.post('/predict-crowd', predictCrowdDensity);
router.post('/forecast-demand', forecastTourismDemand);
router.post('/group-consensus', groupTravelConsensus);
router.post('/hidden-gems', getHiddenGemRecommendations);
router.post('/sustainability', calculateSustainabilityScore);

export default router;
