import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';
import { Sparkles, Calendar, Users, MapPin, CheckCircle, Save, ArrowRight, Info, Bookmark, Trash2, Route } from 'lucide-react';

const INTEREST_OPTIONS = ['Adventure', 'Nature', 'Culture', 'Food & Dining', 'Relaxation', 'Luxury', 'Budget', 'Shopping', 'Photography'];
const DNA_INTERESTS = {
  adventure: 'Adventure',
  nature: 'Nature',
  culture: 'Culture',
  food: 'Food & Dining',
  relaxation: 'Relaxation',
  luxury: 'Luxury',
  budget: 'Budget',
  photography: 'Photography'
};

const AITripPlanner = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const promptParam = queryParams.get('prompt') || '';
  const destParam = queryParams.get('destination') || '';

  const [destination, setDestination] = useState(destParam || promptParam || 'Goa Beach Paradise');
  const [days, setDays] = useState(4);
  const [budget, setBudget] = useState(15000);
  const [travelers, setTravelers] = useState(2);
  const [selectedInterests, setSelectedInterests] = useState(['Adventure', 'Nature']);

  useEffect(() => {
    if (promptParam) {
      setDestination(promptParam);
    } else if (destParam) {
      setDestination(destParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    aiService.getTravelDNA().then((res) => {
      if (cancelled || !res.data?.scores) return;
      const interests = Object.entries(res.data.scores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 3)
        .map(([category]) => DNA_INTERESTS[category])
        .filter(Boolean);
      if (interests.length) setSelectedInterests(interests);
    }).catch(() => { });
    return () => { cancelled = true; };
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedItineraryId, setSavedItineraryId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification('Please log in to generate and plan AI itineraries', 'info');
      navigate('/login');
      return;
    }

    setLoading(true);
    setGeneratedItinerary(null);
    setSavedItineraryId(null);
    try {
      // Do NOT directly save it; pass saveItinerary: false
      const res = await aiService.generateItinerary({
        destination,
        days: Number(days),
        budget: Number(budget),
        travelers: Number(travelers),
        interests: selectedInterests,
        saveItinerary: false
      });

      const planData = res.data || res;
      setGeneratedItinerary(planData);
      showNotification('Smart AI Itinerary generated! Review the day plans below and click "Save Itinerary" if you wish to keep it.', 'success');
    } catch (err) {
      showNotification(err.message || 'AI generation failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!user) {
      showNotification('Please log in to save your itinerary', 'info');
      navigate('/login');
      return;
    }
    if (!generatedItinerary) return;

    setSaving(true);
    try {
      const res = await aiService.saveItinerary({
        title: generatedItinerary.title || `${days}-Day Trip to ${destination}`,
        destinationName: destination,
        durationDays: Number(days),
        travelers: Number(travelers),
        totalBudget: Number(budget),
        estimatedExpenses: generatedItinerary.estimatedExpenses,
        interests: selectedInterests,
        dayPlans: generatedItinerary.dayPlans
      });

      const savedData = res.data || res;
      setSavedItineraryId(savedData._id);

      // Trigger instant real-time synchronization across Dashboard and Itineraries
      window.dispatchEvent(new CustomEvent('intellitrip:itinerary_updated', { detail: savedData }));
      window.dispatchEvent(new Event('itinerary_updated'));
      try {
        localStorage.setItem('intellitrip_last_itinerary_sync', Date.now().toString());
      } catch {}

      showNotification('AI Itinerary saved to your profile successfully!', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to save itinerary. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItinerary = async () => {
    if (!savedItineraryId) return;
    if (!window.confirm('Are you sure you want to remove this saved itinerary from your profile?')) return;

    setDeleting(true);
    try {
      await aiService.deleteItinerary(savedItineraryId);
      setSavedItineraryId(null);

      // Trigger instant real-time synchronization across Dashboard and Itineraries
      window.dispatchEvent(new CustomEvent('intellitrip:itinerary_updated', { detail: { _id: savedItineraryId, deleted: true } }));
      window.dispatchEvent(new Event('itinerary_updated'));
      try {
        localStorage.setItem('intellitrip_last_itinerary_sync', Date.now().toString());
      } catch {}

      showNotification('Itinerary deleted from your profile.', 'info');
    } catch (err) {
      showNotification(err.message || 'Failed to delete itinerary.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <BackButton />
      <div style={{ marginBottom: '2.5rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 2.5rem auto' }}>
        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={14} color="var(--color-accent)" /> Powered by Google Gemini AI
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem' }}>
          AI-Powered Smart Trip Planner
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Enter your travel details and let Gemini generate an optimized day-by-day itinerary tailored to your budget and interests.
        </p>
      </div>

      <div style={styles.plannerGrid}>
        {/* Form Column */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Trip Parameters</h3>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={styles.label}>Destination City or Region</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Goa, Jaipur, Mysore"
                style={styles.input}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={styles.label}>Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  required
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Travelers Count</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div>
              <label style={styles.label}>Total Budget (₹ INR)</label>
              <input
                type="number"
                min={500}
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Select Travel Interests</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)',
                        background: isSelected ? 'var(--color-primary-light)' : '#ffffff',
                        color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}{interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem' }}>
              <Sparkles size={18} />
              {loading ? 'Generating AI Itinerary...' : 'Generate Smart Itinerary'}
            </button>
          </form>
        </div>

        {/* Output Column */}
        <div>
          {loading ? (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <Loader message="Gemini AI is analyzing destination activities and calculating budget breakdown..." />
            </div>
          ) : generatedItinerary ? (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span className="badge badge-success">Generated by {generatedItinerary.source || 'Gemini AI'}</span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem' }}>
                    {generatedItinerary.title}
                  </h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Est. Total</span>
                  <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    ₹{(Number(generatedItinerary.estimatedExpenses?.total || budget)).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Action Banner: Save or Delete Itinerary Option */}
              <div style={{
                background: savedItineraryId ? 'rgba(16, 185, 129, 0.08)' : 'rgba(212, 175, 55, 0.08)',
                border: `1px solid ${savedItineraryId ? 'rgba(16, 185, 129, 0.3)' : 'rgba(212, 175, 55, 0.25)'}`,
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                margin: '1.25rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {savedItineraryId ? (
                      <>
                        <CheckCircle size={16} color="#10b981" /> Itinerary Saved in Your Profile
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} color="#d4af37" /> Plan Generated — Save to Profile?
                      </>
                    )}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    {savedItineraryId
                      ? 'Saved to your profile. You can view it in My Itineraries or delete it anytime.'
                      : 'This plan is generated for your preview. Click "Save Itinerary" to add it to your saved plans.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {!savedItineraryId ? (
                    <button
                      type="button"
                      onClick={handleSaveItinerary}
                      disabled={saving}
                      className="btn btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.85rem',
                        padding: '0.55rem 1.25rem',
                        fontWeight: 700
                      }}
                    >
                      <Bookmark size={15} />
                      {saving ? 'Saving...' : 'Save Itinerary'}
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/tourist/bookings"
                        state={{ defaultTab: 'itineraries' }}
                        className="btn btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.82rem',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        <Route size={14} /> My Itineraries
                      </Link>
                      <button
                        type="button"
                        onClick={handleDeleteItinerary}
                        disabled={deleting}
                        className="btn btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.82rem',
                          padding: '0.5rem 1rem',
                          color: '#ef4444',
                          borderColor: 'rgba(239, 68, 68, 0.4)'
                        }}
                      >
                        <Trash2 size={14} />
                        {deleting ? 'Deleting...' : 'Delete Itinerary'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Expense Breakdown Box */}
              {generatedItinerary.estimatedExpenses && (
                <div style={styles.expenseBox}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>AI Expense Breakdown</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Stay:</span>
                      <p style={{ fontWeight: 700 }}>₹{Number(generatedItinerary.estimatedExpenses.accommodation || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Food:</span>
                      <p style={{ fontWeight: 700 }}>₹{Number(generatedItinerary.estimatedExpenses.food || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Transport:</span>
                      <p style={{ fontWeight: 700 }}>₹{Number(generatedItinerary.estimatedExpenses.transport || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Activities:</span>
                      <p style={{ fontWeight: 700 }}>₹{Number(generatedItinerary.estimatedExpenses.activities || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Day Plans Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                {generatedItinerary.dayPlans && generatedItinerary.dayPlans.map((dp) => (
                  <div key={dp.dayNumber} style={styles.dayCard}>
                    <div style={styles.dayHeader}>
                      <span className="badge badge-primary">Day {dp.dayNumber}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{dp.theme || `Day ${dp.dayNumber} Highlights`}</h4>
                      <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        ~₹{Number(dp.estimatedCost || 1500).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={styles.timelineBody}>
                      <div style={styles.timelineSlot}>
                        <span style={styles.slotTag}>🌅 Morning</span>
                        <p style={styles.slotText}>{dp.morning}</p>
                      </div>

                      <div style={styles.timelineSlot}>
                        <span style={styles.slotTag}>☀️ Afternoon</span>
                        <p style={styles.slotText}>{dp.afternoon}</p>
                      </div>

                      <div style={styles.timelineSlot}>
                        <span style={styles.slotTag}>🌙 Evening</span>
                        <p style={styles.slotText}>{dp.evening}</p>
                      </div>
                    </div>

                    {dp.schedule?.length > 0 && (
                      <div style={styles.detailSection}>
                        <h5 style={styles.detailHeading}>Suggested schedule</h5>
                        <div style={styles.scheduleGrid}>
                          {dp.schedule.map((item, index) => (
                            <div key={`${item.time}-${index}`} style={styles.scheduleRow}>
                              <span style={styles.scheduleTime}>{item.time}</span>
                              <div>
                                <strong style={styles.scheduleActivity}>{item.activity}</strong>
                                <span style={styles.scheduleMeta}>{item.location} · {item.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dp.meals && (
                      <div style={styles.detailSection}>
                        <h5 style={styles.detailHeading}>Meals</h5>
                        <div style={styles.mealGrid}>
                          {['breakfast', 'lunch', 'dinner'].map((meal) => (
                            <div key={meal}>
                              <span style={styles.mealLabel}>{meal}</span>
                              <p style={styles.detailText}>{dp.meals[meal] || 'Plan a local meal nearby.'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={styles.detailSection}>
                      <h5 style={styles.detailHeading}>Logistics</h5>
                      <p style={styles.detailText}><strong>Getting around:</strong> {dp.transport || 'Use a pre-booked local cab between activities.'}</p>
                      <p style={styles.detailText}><strong>Where to stay:</strong> {dp.stay || `Stay close to the main attractions in ${destination}.`}</p>
                    </div>

                    {dp.highlights?.length > 0 && (
                      <div style={styles.detailSection}>
                        <h5 style={styles.detailHeading}>Day highlights</h5>
                        <ul style={styles.detailList}>{dp.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
                      </div>
                    )}

                    {dp.tips?.length > 0 && (
                      <div style={styles.detailSection}>
                        <h5 style={styles.detailHeading}>Practical tips</h5>
                        <ul style={styles.detailList}>{dp.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Action Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {savedItineraryId ? '✓ Plan is saved to your profile' : 'Finished reviewing? Save this itinerary to your profile:'}
                </span>
                <div>
                  {!savedItineraryId ? (
                    <button
                      type="button"
                      onClick={handleSaveItinerary}
                      disabled={saving}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
                    >
                      <Bookmark size={15} /> {saving ? 'Saving...' : 'Save Itinerary'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to="/tourist/bookings"
                        state={{ defaultTab: 'itineraries' }}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                      >
                        <Route size={14} /> My Itineraries
                      </Link>
                      <button
                        type="button"
                        onClick={handleDeleteItinerary}
                        disabled={deleting}
                        className="btn btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.82rem',
                          padding: '0.5rem 1rem',
                          color: '#ef4444',
                          borderColor: 'rgba(239, 68, 68, 0.4)'
                        }}
                      >
                        <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete Itinerary'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <Sparkles size={40} color="var(--color-primary)" style={{ margin: '0 auto 1rem auto' }} />
              <h3>Your AI Itinerary Will Appear Here</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Fill out the trip parameters on the left and click "Generate Smart Itinerary".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  plannerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.3fr',
    gap: '2rem'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'block',
    marginBottom: '0.35rem'
  },
  input: {
    width: '100%',
    padding: '0.7rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    fontSize: '0.85rem',
    outline: 'none',
    background: '#ffffff'
  },
  expenseBox: {
    background: '#18232d',
    padding: '0.85rem 1.25rem',
    borderRadius: '0.5rem',
    border: '1px solid #3b4b58'
  },
  dayCard: {
    border: '1px solid #3b4b58',
    borderRadius: '0.5rem',
    padding: '1.25rem',
    background: '#17212b',
    color: '#f3f6f8'
  },
  dayHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.85rem'
  },
  timelineBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem'
  },
  timelineSlot: {
    background: '#202d39',
    padding: '0.6rem 0.85rem',
    borderRadius: '4px',
    border: '1px solid #3b4b58'
  },
  slotTag: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    display: 'block',
    marginBottom: '0.2rem'
  },
  slotText: {
    fontSize: '0.85rem',
    color: '#f3f6f8',
    lineHeight: '1.4'
  },
  detailSection: {
    marginTop: '1rem',
    paddingTop: '0.9rem',
    borderTop: '1px solid var(--border-color)'
  },
  detailHeading: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#f1d578',
    marginBottom: '0.6rem'
  },
  scheduleGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem'
  },
  scheduleRow: {
    display: 'grid',
    gridTemplateColumns: '58px 1fr',
    gap: '0.65rem',
    alignItems: 'start',
    fontSize: '0.8rem'
  },
  scheduleTime: {
    fontWeight: 700,
    color: '#f1d578'
  },
  scheduleActivity: {
    display: 'block',
    color: '#f3f6f8'
  },
  scheduleMeta: {
    display: 'block',
    color: '#c0cbd4',
    marginTop: '0.15rem'
  },
  mealGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem'
  },
  mealLabel: {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'capitalize',
    color: '#c0cbd4',
    marginBottom: '0.2rem'
  },
  detailText: {
    fontSize: '0.82rem',
    lineHeight: '1.45',
    color: '#e2e8ee',
    margin: '0 0 0.45rem'
  },
  detailList: {
    margin: 0,
    paddingLeft: '1.1rem',
    color: '#e2e8ee',
    fontSize: '0.82rem',
    lineHeight: '1.5'
  }
};

export default AITripPlanner;
