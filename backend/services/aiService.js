import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

// Initialize Gemini SDK with server-side key
const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey !== 'your_google_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn('[Gemini Service] Warning: Gemini SDK initialization issue:', err.message);
  }
}

// Clean JSON response string from Markdown fences if present
const cleanJSONResponse = (text) => {
  if (!text) return '{}';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return cleaned;
};

export const aiService = {
  // 1. AI Travel Assistant (Natural Language Query Processing)
  askTravelAssistant: async (userPrompt, catalogContext = {}, conversationHistory = []) => {
    if (genAI) {
      try {
        const modelName = 'gemini-1.5-flash-latest';
        const model = genAI.getGenerativeModel({ model: modelName });
        const systemPrompt = `You are IntelliTrip AI, an expert, enthusiastic smart tourism assistant.
User Prompt: "${userPrompt}"
Available Catalog Context: ${JSON.stringify(catalogContext)}
Recent conversation: ${JSON.stringify(conversationHistory)}

Respond like a helpful travel adviser in a natural conversation. Use plain English sentences only: no markdown, headings, bullets, numbered lists, bold text, or code formatting. Use recent conversation to understand follow-up questions. Prefer places and facts from the available catalog, and do not claim live weather, availability, or crowd data unless provided. Include useful recommendations, estimated costs, best seasons, and practical tips in flowing conversational prose. When asked for an itinerary, tailor it to stated dates, budget, and interests. Ask one concise follow-up when essential details are missing.`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        return {
          source: 'Gemini AI',
          reply: response.text()
        };
      } catch (error) {
        console.warn('[Gemini API Notice] Using smart heuristic fallback engine:', error.message);
      }
    }

    // Smart Fallback Engine when Gemini Key is unconfigured or unavailable
    return {
      source: 'IntelliTrip Smart Engine',
      reply: `For "${userPrompt}", I’d start by staying near the main attractions and heading out early to make the most of each day. A comfortable estimate is $60-$120 per person per day for lodging, meals, local transport, and activities. October through March is often a pleasant time to travel, but check local conditions before booking.

    For a three-day visit, spend the first day settling in and seeing a signature landmark, a nearby market or museum, and the old quarter or a scenic viewpoint. On the second day, choose a guided activity that fits your interests, then leave time for another nearby attraction and a relaxed evening. Use the final morning for a garden, temple, waterfront, or sunrise viewpoint before heading home.

    Book popular tours and restaurants ahead, confirm opening hours and cancellation terms, and allow extra time for local traffic. Share your destination, trip length, budget, and interests, and I can make this plan more specific.`
    };
  },

  // 2. AI Trip Planner (Structured Itinerary Generator)
  generateAIItinerary: async ({ destination, days, budget, travelers, interests, catalogData }) => {
    const durationDays = Number(days) || 3;
    const totalBudgetNum = Number(budget) || 500;
    const travelersCount = Number(travelers) || 2;
    const interestList = Array.isArray(interests) ? interests : [interests || 'Sightseeing'];

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const prompt = `You are IntelliTrip AI Trip Generator. Create a structured day-by-day travel itinerary for:
Destination: ${destination}
Duration: ${durationDays} days
Travelers: ${travelersCount}
Total Budget: $${totalBudgetNum}
Interests: ${interestList.join(', ')}
Available Local Catalog Context: ${JSON.stringify(catalogData || {})}

Return ONLY a single valid raw JSON object (NO markdown, NO preamble) matching this schema:
{
  "title": "Unforgettable ${durationDays}-Day Trip to ${destination}",
  "destinationName": "${destination}",
  "durationDays": ${durationDays},
  "travelers": ${travelersCount},
  "totalBudget": ${totalBudgetNum},
  "estimatedExpenses": {
    "accommodation": number,
    "food": number,
    "transport": number,
    "activities": number,
    "total": number
  },
  "interests": ["${interestList.join('", "')}"],
      "dayPlans": [
    {
      "dayNumber": 1,
      "theme": "Arrival & Exploration",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity description",
      "evening": "Evening activity description",
      "schedule": [
        { "time": "08:00", "activity": "Breakfast and departure", "location": "Hotel", "duration": "1 hour" },
        { "time": "10:00", "activity": "Main attraction", "location": "Named place", "duration": "2 hours" }
      ],
      "meals": { "breakfast": "Specific suggestion", "lunch": "Specific suggestion", "dinner": "Specific suggestion" },
      "transport": "How to move between locations and approximate travel time",
      "stay": "Recommended stay area and check-in guidance",
      "highlights": ["Three concrete highlights"],
      "tips": ["One practical local tip", "One booking or timing tip"],
      "estimatedCost": number
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = cleanJSONResponse(text);
        const parsed = JSON.parse(cleaned);
        parsed.dayPlans = (parsed.dayPlans || []).map((day, index) => ({
          ...day,
          dayNumber: day.dayNumber || index + 1,
          schedule: Array.isArray(day.schedule) ? day.schedule : [],
          meals: day.meals || { breakfast: '', lunch: '', dinner: '' },
          highlights: Array.isArray(day.highlights) ? day.highlights : [],
          tips: Array.isArray(day.tips) ? day.tips : []
        }));
        return { source: 'Gemini AI', ...parsed };
      } catch (err) {
        console.error('[Gemini Itinerary Error] Using smart structured fallback:', err.message);
      }
    }

    // Fallback structured generator
    const dailyCost = Math.round(totalBudgetNum / durationDays);
    const dayPlans = [];
    for (let i = 1; i <= durationDays; i++) {
      dayPlans.push({
        dayNumber: i,
        theme: i === 1 ? 'Arrival & Cultural Introduction' : i === durationDays ? 'Scenic Sights & Departure' : 'Adventure & Local Experiences',
        morning: `Morning exploration of top attractions and scenic landmarks in ${destination}.`,
        afternoon: `Enjoy authentic local cuisine followed by a guided experience or outdoor activity.`,
        evening: `Sunset views, local bazaar walk, and evening fine dining experience.`,
        schedule: [
          { time: '08:00', activity: `Breakfast and preparation for ${destination}`, location: 'Hotel', duration: '1 hour' },
          { time: '09:30', activity: `Explore the signature sights of ${destination}`, location: destination, duration: '3 hours' },
          { time: '13:00', activity: 'Regional lunch and rest', location: 'Recommended local restaurant', duration: '1.5 hours' },
          { time: '15:00', activity: 'Guided local experience or scenic activity', location: destination, duration: '3 hours' },
          { time: '19:00', activity: 'Dinner and evening walk', location: 'Central district', duration: '2 hours' }
        ],
        meals: {
          breakfast: `Hotel breakfast with regional specialties in ${destination}.`,
          lunch: `A well-rated local restaurant serving the signature cuisine of ${destination}.`,
          dinner: `A relaxed dinner near the evening activity; reserve ahead for the best tables.`
        },
        transport: `Use a pre-booked cab between major sights; allow 20-30 minutes between stops for local traffic.`,
        stay: `Stay in the central or heritage district of ${destination} to reduce daily transfer time.`,
        highlights: [`Signature sights of ${destination}`, 'Regional food tasting', 'A guided local experience'],
        tips: ['Start outdoor visits early for cooler weather and smaller crowds.', 'Confirm attraction hours and transport pickup the evening before.'],
        estimatedCost: dailyCost
      });
    }

    return {
      source: 'IntelliTrip Heuristic Engine',
      title: `${durationDays}-Day Express Journey to ${destination}`,
      destinationName: destination,
      durationDays,
      travelers: travelersCount,
      totalBudget: totalBudgetNum,
      estimatedExpenses: {
        accommodation: Math.round(totalBudgetNum * 0.4),
        food: Math.round(totalBudgetNum * 0.25),
        transport: Math.round(totalBudgetNum * 0.15),
        activities: Math.round(totalBudgetNum * 0.2),
        total: totalBudgetNum
      },
      interests: interestList,
      dayPlans
    };
  },

  // 3. AI Budget Planner & Dynamic Guardian
  calculateBudgetPlanner: async ({ destination, days, budget, travelers }) => {
    const daysCount = Number(days) || 3;
    const totalBudget = Number(budget) || 500;
    const estAcc = Math.round(totalBudget * 0.4);
    const estFood = Math.round(totalBudget * 0.25);
    const estTrans = Math.round(totalBudget * 0.15);
    const estAct = Math.round(totalBudget * 0.2);
    const estTotal = estAcc + estFood + estTrans + estAct;

    const isOverBudget = estTotal > totalBudget;

    return {
      destination,
      days: daysCount,
      travelers: Number(travelers) || 2,
      totalBudget,
      breakdown: {
        accommodation: estAcc,
        food: estFood,
        transportation: estTrans,
        activities: estAct,
        estimatedTotal: estTotal
      },
      status: isOverBudget ? 'Over Budget Warning' : 'Within Healthy Budget',
      aiSavingsTip: isOverBudget
        ? `Consider booking homestays or shared bike rentals in ${destination} to save up to 25% on daily stay costs.`
        : `Your budget is well-balanced! We recommend reserving guided experiences 3 days prior to arrival.`
    };
  },

  // 4. Personalized Explainable Recommendation System
  scorePersonalizedRecommendations: (travelDNA, destinations = [], hotels = [], experiences = [], tripHistory = {}) => {
    const dna = travelDNA || { adventure: 75, nature: 80, culture: 60, food: 85, luxury: 50 };
    const dimensions = {
      adventure: ['adventure', 'trek', 'hike', 'climb', 'rafting', 'paraglid', 'safari', 'camp'],
      nature: ['nature', 'mountain', 'forest', 'wildlife', 'waterfall', 'island', 'beach', 'lake', 'garden'],
      culture: ['culture', 'heritage', 'histor', 'temple', 'palace', 'museum', 'tradition', 'architecture'],
      food: ['food', 'dining', 'restaurant', 'cuisine', 'culinary', 'cafe', 'market', 'cooking'],
      relaxation: ['relax', 'spa', 'wellness', 'beach', 'resort', 'retreat', 'cruise'],
      luxury: ['luxury', 'premium', 'palace', 'resort', 'private', 'suite', 'villa', 'five-star'],
      budget: ['budget', 'affordable', 'backpack', 'hostel', 'low-cost', 'homestay'],
      photography: ['photo', 'photography', 'scenic', 'viewpoint', 'sunrise', 'sunset', 'landmark']
    };
    const labels = Object.keys(dimensions).reduce((result, key) => {
      result[key] = key[0].toUpperCase() + key.slice(1);
      return result;
    }, {});
    const scoreItem = (item) => {
      const searchableText = JSON.stringify({
        name: item.name,
        title: item.title,
        category: item.category,
        description: item.description,
        knownFor: item.knownFor,
        tags: item.tags,
        amenities: item.amenities,
        includedServices: item.includedServices,
        attractions: item.attractions
      }).toLowerCase();
      const matchedDimensions = Object.entries(dimensions)
        .filter(([, keywords]) => keywords.some((keyword) => searchableText.includes(keyword)))
        .map(([dimension]) => dimension);
      const rankedDimensions = matchedDimensions.length
        ? matchedDimensions
        : Object.keys(dimensions).sort((first, second) => Number(dna[second] || 0) - Number(dna[first] || 0)).slice(0, 3);
      const score = Math.round(rankedDimensions.reduce((total, dimension) => total + Number(dna[dimension] || 0), 0) / rankedDimensions.length);
      const reason = matchedDimensions.length
        ? `A strong fit for your ${matchedDimensions.slice(0, 2).map((dimension) => `${labels[dimension].toLowerCase()} (${Number(dna[dimension] || 0)}%)`).join(' and ')} preferences.`
        : `Picked for your top travel interests: ${rankedDimensions.map((dimension) => labels[dimension].toLowerCase()).join(', ')}.`;
      return { score: Math.max(0, Math.min(99, score)), reason };
    };
    const visitedDestinations = new Set((tripHistory.visitedDestinationNames || []).map((name) => String(name).toLowerCase()));
    const pastInterests = (tripHistory.interests || []).map((interest) => interest.toLowerCase());

    const scoredDestinations = destinations.filter((destination) => {
      const name = String(destination.name || '').toLowerCase();
      const city = String(destination.city || '').toLowerCase();
      return !visitedDestinations.has(name) && !visitedDestinations.has(city);
    }).map((d) => {
      const { score: matchScore, reason: matchReason } = scoreItem(d);
      let score = matchScore;
      let reason = matchReason;

      const destinationTags = [...(d.tags || []), d.category].map((tag) => tag.toLowerCase());
      const historyMatches = pastInterests.filter((interest) =>
        destinationTags.some((tag) => tag.includes(interest) || interest.includes(tag))
      ).length;
      if (historyMatches > 0) {
        score = Math.min(99, score + Math.min(12, historyMatches * 4));
        reason = `${score}% Match: New destination that fits interests from your completed trips.`;
      } else if (visitedDestinations.size > 0) {
        reason = `${score}% Match: A new destination picked for your Travel DNA.`;
      }

      return { ...d.toObject(), matchScore: score, matchReason: reason, isNewToYou: visitedDestinations.size > 0 };
    });

    const scoredHotels = hotels.map((h) => {
      const { score, reason } = scoreItem(h);
      return { ...h.toObject(), matchScore: score, matchReason: reason };
    });

    const scoredExperiences = experiences.map((exp) => {
      const { score, reason } = scoreItem(exp);
      return { ...exp.toObject(), matchScore: score, matchReason: reason };
    });

    return {
      destinations: scoredDestinations.sort((a, b) => b.matchScore - a.matchScore),
      hotels: scoredHotels.sort((a, b) => b.matchScore - a.matchScore),
      experiences: scoredExperiences.sort((a, b) => b.matchScore - a.matchScore)
    };
  }
};
