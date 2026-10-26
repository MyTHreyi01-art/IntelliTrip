const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

const postToPython = async (path, bodyData) => {
  const res = await fetch(`${PYTHON_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData || {})
  });
  if (!res.ok) {
    throw new Error(`Python service returned status ${res.status}`);
  }
  return await res.json();
};

export const pythonAiService = {
  // 1. Review Sentiment Analysis
  analyzeSentiment: async (text) => {
    try {
      return await postToPython('/analyze/sentiment', { text });
    } catch (err) {
      console.warn('[Python AI Service Warning] Sentiment fallback:', err.message);
      const isPos = text.toLowerCase().includes('good') || text.toLowerCase().includes('amazing') || text.toLowerCase().includes('great');
      return {
        sentimentScore: isPos ? 0.8 : 0.0,
        sentimentLabel: isPos ? 'Positive' : 'Neutral',
        confidence: 0.8,
        keywords: []
      };
    }
  },

  // 2. Crowd Prediction (Estimate)
  predictCrowd: async (destinationName, month = 'October', dayOfWeek = 'Saturday') => {
    try {
      return await postToPython('/predict/crowd', {
        destinationName,
        month,
        dayOfWeek
      });
    } catch (err) {
      console.warn('[Python AI Service Warning] Crowd prediction fallback:', err.message);
      return {
        destinationName,
        crowdLevel: 'Medium Crowd Density',
        densityScore: 55.0,
        recommendedVisitTime: 'Morning (8:30 AM - 11:00 AM)',
        disclaimer: 'Estimated prediction fallback output.'
      };
    }
  },

  // 3. Tourism Demand Forecasting (Estimate)
  forecastDemand: async (destinationName, targetMonth = 'November') => {
    try {
      return await postToPython('/forecast/demand', {
        destinationName,
        targetMonth
      });
    } catch (err) {
      console.warn('[Python AI Service Warning] Demand forecast fallback:', err.message);
      return {
        destinationName,
        targetMonth,
        forecastDemandIndex: 75.0,
        expectedVisitorGrowth: '+12% estimated peak',
        disclaimer: 'Estimated time-series forecast model fallback.'
      };
    }
  },

  // 4. Group Travel Intelligence (Consensus Vector)
  calculateGroupConsensus: async (travelersPreferences) => {
    try {
      return await postToPython('/group/consensus', {
        travelersPreferences
      });
    } catch (err) {
      console.warn('[Python AI Service Warning] Group consensus fallback:', err.message);
      return {
        groupSize: travelersPreferences.length,
        consensusVector: { adventure: 75, nature: 80, culture: 65, food: 80, luxury: 55 },
        groupSatisfactionScore: 88.5,
        recommendedGroupStyle: 'Balanced Explorer Group'
      };
    }
  },

  // 5. Hidden Gems Recommendations
  getHiddenGems: async (category, maxCost) => {
    try {
      return await postToPython('/recommend/hidden-gems', {
        category,
        maxCost
      });
    } catch (err) {
      console.warn('[Python AI Service Warning] Hidden gems fallback:', err.message);
      return {
        count: 2,
        disclaimer: 'Curated low-density destination fallback.',
        hiddenGems: [
          { id: 'hg_1', name: 'Spiti Valley', city: 'Kaza', category: 'Mountain', rating: 4.9, crowdLevel: 'Low', avgCost: 45, description: 'High-altitude cold desert monastery valley.' },
          { id: 'hg_2', name: 'Gokarna Beaches', city: 'Gokarna', category: 'Beach', rating: 4.8, crowdLevel: 'Low', avgCost: 40, description: 'Tranquil, pristine beach coastline.' }
        ]
      };
    }
  },

  // 6. Sustainability Scoring & Carbon Intelligence
  calculateSustainability: async (transportType, distanceKm) => {
    try {
      return await postToPython('/sustainability/score', {
        transportType,
        distanceKm
      });
    } catch (err) {
      console.warn('[Python AI Service Warning] Sustainability score fallback:', err.message);
      return {
        transportType,
        distanceKm,
        estimatedCo2Kg: (distanceKm * 0.15).toFixed(2),
        sustainabilityScore: 75.0,
        ecoRating: 'Moderate Carbon Footprint',
        greenerAlternative: 'Consider electric bus transit.',
        disclaimer: 'Approximate carbon emission score estimate.'
      };
    }
  }
};
