import React, { useState } from 'react';
import { aiService } from '../../services/aiService';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import {
  Brain,
  Smile,
  Users,
  TrendingUp,
  Sparkles,
  Leaf,
  Compass,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Tag
} from 'lucide-react';

const AdvancedAITools = () => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('sentiment');
  const [loading, setLoading] = useState(false);

  // Tab 1: Sentiment State
  const [sentimentInput, setSentimentInput] = useState(
    'The resort was absolutely stunning with amazing mountain views and friendly staff! However, the dinner service was slightly slow.'
  );
  const [sentimentResult, setSentimentResult] = useState(null);

  // Tab 2: Crowd Prediction State
  const [crowdDest, setCrowdDest] = useState('Mysore Palace');
  const [crowdMonth, setCrowdMonth] = useState('October');
  const [crowdDay, setCrowdDay] = useState('Saturday');
  const [crowdResult, setCrowdResult] = useState(null);

  // Tab 3: Demand Forecast State
  const [demandDest, setDemandDest] = useState('Manali');
  const [demandMonth, setDemandMonth] = useState('November');
  const [demandResult, setDemandResult] = useState(null);

  // Tab 4: Group Intelligence State
  const [travelersList, setTravelersList] = useState([
    { name: 'Alex (Adventure Lover)', adventure: 90, nature: 85, culture: 40, food: 70, luxury: 30 },
    { name: 'Sam (Foodie & Culture)', adventure: 40, nature: 60, culture: 95, food: 90, luxury: 60 },
    { name: 'Jordan (Relaxation)', adventure: 30, nature: 75, culture: 50, food: 80, luxury: 85 }
  ]);
  const [groupResult, setGroupResult] = useState(null);

  // Tab 5: Hidden Gems State
  const [gemCategory, setGemCategory] = useState('Mountain');
  const [gemMaxCost, setGemMaxCost] = useState(100);
  const [gemResult, setGemResult] = useState(null);

  // Tab 6: Sustainability State
  const [ecoTransport, setEcoTransport] = useState('Flight');
  const [ecoDistance, setEcoDistance] = useState(650);
  const [ecoResult, setEcoResult] = useState(null);

  // 1. Run Sentiment Analysis
  const handleRunSentiment = async (e) => {
    e.preventDefault();
    if (!sentimentInput.trim()) return;
    setLoading(true);
    try {
      const res = await aiService.analyzeSentiment(sentimentInput);
      setSentimentResult(res.data);
      showNotification('Sentiment analysis completed', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to analyze sentiment', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Run Crowd Prediction
  const handleRunCrowd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await aiService.predictCrowd(crowdDest, crowdMonth, crowdDay);
      setCrowdResult(res.data);
      showNotification('Crowd density prediction generated', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to predict crowd density', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Run Demand Forecast
  const handleRunDemand = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await aiService.forecastDemand(demandDest, demandMonth);
      setDemandResult(res.data);
      showNotification('Tourism demand forecast generated', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to forecast demand', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Run Group Consensus
  const handleRunGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formatted = travelersList.map((t) => ({
        adventure: Number(t.adventure),
        nature: Number(t.nature),
        culture: Number(t.culture),
        food: Number(t.food),
        luxury: Number(t.luxury)
      }));
      const res = await aiService.getGroupConsensus(formatted);
      setGroupResult(res.data);
      showNotification('Group travel consensus calculated', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to calculate group consensus', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 5. Run Hidden Gems
  const handleRunGems = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await aiService.getHiddenGems(gemCategory, Number(gemMaxCost));
      setGemResult(res.data);
      showNotification('Hidden gem recommendations retrieved', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to fetch hidden gems', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 6. Run Sustainability Score
  const handleRunEco = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await aiService.calculateSustainability(ecoTransport, Number(ecoDistance));
      setEcoResult(res.data);
      showNotification('Sustainability & carbon score calculated', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to calculate sustainability score', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Brain size={14} color="var(--color-accent)" /> Python FastAPI ML Service
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem' }}>
          Advanced Machine Learning Tools
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Powered by Python, Pandas, NumPy, Scikit-learn microservice for intelligent travel analytics.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem',
          marginBottom: '2rem'
        }}
      >
        <button
          onClick={() => setActiveTab('sentiment')}
          className={`btn ${activeTab === 'sentiment' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Smile size={16} /> Review Sentiment Analysis
        </button>
        <button
          onClick={() => setActiveTab('crowd')}
          className={`btn ${activeTab === 'crowd' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Users size={16} /> Crowd Density Prediction
        </button>
        <button
          onClick={() => setActiveTab('demand')}
          className={`btn ${activeTab === 'demand' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <TrendingUp size={16} /> Tourism Demand Forecast
        </button>
        <button
          onClick={() => setActiveTab('group')}
          className={`btn ${activeTab === 'group' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <BarChart2 size={16} /> Group Travel Consensus
        </button>
        <button
          onClick={() => setActiveTab('gems')}
          className={`btn ${activeTab === 'gems' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Sparkles size={16} /> Hidden Gems
        </button>
        <button
          onClick={() => setActiveTab('sustainability')}
          className={`btn ${activeTab === 'sustainability' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Leaf size={16} /> Sustainability Score
        </button>
      </div>

      {loading && <Loader message="Running Python Scikit-learn ML Model..." />}

      {/* TAB 1: REVIEW SENTIMENT ANALYSIS */}
      {activeTab === 'sentiment' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smile color="var(--color-primary)" size={20} /> Review Sentiment Classifier
            </h2>
            <form onSubmit={handleRunSentiment}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Hotel or Destination Review Text</label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={sentimentInput}
                  onChange={(e) => setSentimentInput(e.target.value)}
                  placeholder="Paste travel review text..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                Analyze Sentiment with NLP Model
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Model Output Results</h3>
            {sentimentResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sentiment Label:</span>
                  <span
                    className={`badge ${
                      sentimentResult.sentimentLabel === 'Positive'
                        ? 'badge-success'
                        : sentimentResult.sentimentLabel === 'Negative'
                        ? 'badge-danger'
                        : 'badge-secondary'
                    }`}
                    style={{ fontSize: '0.95rem', padding: '0.35rem 0.75rem' }}
                  >
                    {sentimentResult.sentimentLabel}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Polarity Score:</span>
                  <strong style={{ fontSize: '1.1rem' }}>{sentimentResult.sentimentScore} / 1.0</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Model Confidence:</span>
                  <span>{(sentimentResult.confidence * 100).toFixed(0)}%</span>
                </div>
                {sentimentResult.keywords && sentimentResult.keywords.length > 0 && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                      Extracted Keywords:
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {sentimentResult.keywords.map((kw, i) => (
                        <span key={i} className="badge badge-outline" style={{ fontSize: '0.85rem' }}>
                          <Tag size={12} style={{ marginRight: '0.25rem' }} /> {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {sentimentResult.disclaimer && (
                  <div style={styles.disclaimerBox}>
                    <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <strong>Estimate Disclaimer:</strong> {sentimentResult.disclaimer}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Enter review text on the left and click analyze to test model predictions.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CROWD PREDICTION */}
      {activeTab === 'crowd' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users color="var(--color-primary)" size={20} /> Crowd Density Predictor
            </h2>
            <form onSubmit={handleRunCrowd}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Destination</label>
                <input
                  type="text"
                  className="form-control"
                  value={crowdDest}
                  onChange={(e) => setCrowdDest(e.target.value)}
                  placeholder="e.g., Mysore Palace, Goa Beaches"
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Month of Visit</label>
                <select className="form-control" value={crowdMonth} onChange={(e) => setCrowdMonth(e.target.value)}>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
                    (m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Day of Week</label>
                <select className="form-control" value={crowdDay} onChange={(e) => setCrowdDay(e.target.value)}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                Predict Crowd Density (Model Estimate)
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Crowd Prediction Model Output</h3>
            {crowdResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Destination:</span>
                  <strong>{crowdResult.destinationName}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Crowd Density:</span>
                  <span className="badge badge-warning" style={{ fontSize: '0.95rem' }}>
                    {crowdResult.crowdLevel} (ESTIMATE)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Density Index:</span>
                  <strong style={{ fontSize: '1.1rem' }}>{crowdResult.densityScore} / 100</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>
                    Recommended Low-Crowd Visit Time Window:
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-accent)' }}>
                    {crowdResult.recommendedVisitTime}
                  </strong>
                </div>
                <div style={styles.disclaimerBox}>
                  <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <strong>Estimate Disclaimer:</strong> {crowdResult.disclaimer}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Submit destination and date details to generate a crowd estimation model result.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DEMAND FORECASTING */}
      {activeTab === 'demand' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp color="var(--color-primary)" size={20} /> Tourism Demand Forecaster
            </h2>
            <form onSubmit={handleRunDemand}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Destination</label>
                <input
                  type="text"
                  className="form-control"
                  value={demandDest}
                  onChange={(e) => setDemandDest(e.target.value)}
                  placeholder="e.g., Manali, Kerala Backwaters"
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Forecast Target Month</label>
                <select className="form-control" value={demandMonth} onChange={(e) => setDemandMonth(e.target.value)}>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
                    (m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    )
                  )}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                Generate Demand Forecast (Model Estimate)
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Demand Forecast Result</h3>
            {demandResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Location & Month:</span>
                  <strong>{demandResult.destinationName} ({demandResult.targetMonth})</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Demand Index:</span>
                  <span className="badge badge-primary" style={{ fontSize: '1rem' }}>
                    {demandResult.forecastDemandIndex} / 100 Index (ESTIMATE)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Expected Growth Trend:</span>
                  <strong style={{ color: '#10b981' }}>{demandResult.expectedVisitorGrowth}</strong>
                </div>
                <div style={styles.disclaimerBox}>
                  <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <strong>Estimate Disclaimer:</strong> {demandResult.disclaimer}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Select target month and location to forecast seasonal travel demand trends.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GROUP TRAVEL CONSENSUS */}
      {activeTab === 'group' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 color="var(--color-primary)" size={20} /> Group Preference Aggregator
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Synthesize multi-traveler taste profiles into a single consensus vector.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {travelersList.map((t, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <strong>{t.name}</strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>Adv: {t.adventure}</span>
                    <span>Nat: {t.nature}</span>
                    <span>Cult: {t.culture}</span>
                    <span>Food: {t.food}</span>
                    <span>Lux: {t.luxury}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleRunGroup} className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              Calculate Group Consensus Vector
            </button>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Consensus Intelligence</h3>
            {groupResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Travelers Analyzed:</span>
                  <strong>{groupResult.groupSize} Members</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Satisfaction Index:</span>
                  <span className="badge badge-success" style={{ fontSize: '0.95rem' }}>
                    {groupResult.groupSatisfactionScore}% Consensus (ESTIMATE)
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                    Calculated Consensus Vector:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {groupResult.consensusVector &&
                      Object.entries(groupResult.consensusVector).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ textTransform: 'capitalize' }}>{k}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${v}%`, height: '100%', background: 'var(--color-primary)' }} />
                            </div>
                            <strong>{v.toFixed(0)}%</strong>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Recommended Travel Style:</span>
                  <strong style={{ color: 'var(--color-accent)' }}>{groupResult.recommendedGroupStyle}</strong>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Click calculate to process group preferences using mean vector aggregation.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: HIDDEN GEMS */}
      {activeTab === 'gems' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles color="var(--color-primary)" size={20} /> Hidden Gem Finder
            </h2>
            <form onSubmit={handleRunGems}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Category Filter</label>
                <select className="form-control" value={gemCategory} onChange={(e) => setGemCategory(e.target.value)}>
                  {['Mountain', 'Beach', 'Culture', 'Nature', 'Heritage'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Max Cost per Day ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={gemMaxCost}
                  onChange={(e) => setGemMaxCost(e.target.value)}
                  min={10}
                  max={500}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                Filter Low-Density Hidden Gems
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Discovered Hidden Gems</h3>
            {gemResult && gemResult.hiddenGems ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {gemResult.hiddenGems.map((gem) => (
                  <div
                    key={gem.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{gem.name}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{gem.city} • {gem.category}</span>
                      </div>
                      <span className="badge badge-success">${gem.avgCost}/day</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>{gem.description}</p>
                  </div>
                ))}
                {gemResult.disclaimer && (
                  <div style={styles.disclaimerBox}>
                    <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <strong>Estimate Disclaimer:</strong> {gemResult.disclaimer}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Search for under-the-radar destinations with high rating & low crowd density.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: SUSTAINABILITY SCORE */}
      {activeTab === 'sustainability' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Leaf color="#10b981" size={20} /> Eco-Footprint Calculator
            </h2>
            <form onSubmit={handleRunEco}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Mode of Transit</label>
                <select className="form-control" value={ecoTransport} onChange={(e) => setEcoTransport(e.target.value)}>
                  {['Flight', 'Car', 'Train', 'Bus', 'Electric Car'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Distance (in Kilometers)</label>
                <input
                  type="number"
                  className="form-control"
                  value={ecoDistance}
                  onChange={(e) => setEcoDistance(e.target.value)}
                  min={1}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                Calculate Carbon Footprint & Sustainability Score
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Sustainability Rating Output</h3>
            {ecoResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated CO2 Emission:</span>
                  <strong style={{ fontSize: '1.1rem', color: '#ef4444' }}>{ecoResult.estimatedCo2Kg} kg CO2</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sustainability Score:</span>
                  <span className="badge badge-success" style={{ fontSize: '0.95rem' }}>
                    {ecoResult.sustainabilityScore} / 100 (ESTIMATE)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Eco Rating:</span>
                  <strong>{ecoResult.ecoRating}</strong>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#10b981', display: 'block', fontWeight: 600 }}>
                    Greener Transit Recommendation:
                  </span>
                  <span style={{ fontSize: '0.9rem' }}>{ecoResult.greenerAlternative}</span>
                </div>
                <div style={styles.disclaimerBox}>
                  <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <strong>Estimate Disclaimer:</strong> {ecoResult.disclaimer}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Enter trip distance and vehicle mode to assess environmental impact.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  disclaimerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '0.75rem',
    borderRadius: '8px',
    marginTop: '0.5rem'
  }
};

export default AdvancedAITools;
