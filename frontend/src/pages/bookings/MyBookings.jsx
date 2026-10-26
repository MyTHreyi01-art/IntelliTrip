import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { aiService } from '../../services/aiService';
import { weatherService } from '../../services/weatherService';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';
import {
  Calendar,
  Building,
  Car,
  Sparkles,
  CloudSun,
  Users,
  Play,
  RefreshCw,
  Route,
  Utensils,
  Compass,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';

const MyBookings = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'bookings'); // 'bookings' | 'itineraries'
  const [bookings, setBookings] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  // Live condition tracking for active trip
  const [activeJourneyId, setActiveJourneyId] = useState(null);
  const [journeyReports, setJourneyReports] = useState({});
  const [refreshJourney, setRefreshJourney] = useState(0);

  const { showNotification } = useNotification();
  const lastSyncRef = useRef(Date.now());

  const fetchAllData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsSyncing(true);

    try {
      const [bookingsRes, itinerariesRes] = await Promise.allSettled([
        bookingService.getMyBookings(),
        aiService.getUserItineraries()
      ]);

      if (bookingsRes.status === 'fulfilled') {
        const rawBookings = bookingsRes.value.data || [];
        // Strictly filter out any cancelled bookings so cancelled trips are removed from view
        setBookings(rawBookings.filter((b) => b.status !== 'Cancelled'));
      }
      if (itinerariesRes.status === 'fulfilled') {
        setItineraries(itinerariesRes.value.data || []);
      }
      lastSyncRef.current = Date.now();
    } catch {
      // Silent catch for background ticks
    } finally {
      if (isInitial) setLoading(false);
      else setIsSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Initial Load
    fetchAllData(true);

    // 2. Real-Time Auto-Polling (every 3.5 seconds)
    const pollInterval = setInterval(() => {
      fetchAllData(false);
    }, 3500);

    // 3. Instant Event-Driven Updates
    const handleSyncEvent = () => {
      fetchAllData(false);
    };

    const handleWindowFocus = () => {
      fetchAllData(false);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAllData(false);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'intellitrip_last_booking_sync' || e.key === 'intellitrip_last_itinerary_sync') {
        fetchAllData(false);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('intellitrip:booking_updated', handleSyncEvent);
    window.addEventListener('intellitrip:itinerary_updated', handleSyncEvent);
    window.addEventListener('booking_updated', handleSyncEvent);
    window.addEventListener('itinerary_updated', handleSyncEvent);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('intellitrip:booking_updated', handleSyncEvent);
      window.removeEventListener('intellitrip:itinerary_updated', handleSyncEvent);
      window.removeEventListener('booking_updated', handleSyncEvent);
      window.removeEventListener('itinerary_updated', handleSyncEvent);
    };
  }, []);

  // Live journey weather & crowd tracking
  useEffect(() => {
    const booking = bookings.find((entry) => entry._id === activeJourneyId);
    if (!booking) return undefined;

    const place = booking.itemRef?.destination?.city || booking.itemRef?.city || booking.itemRef?.name;
    let cancelled = false;

    const updateJourney = async () => {
      setJourneyReports((current) => ({ ...current, [booking._id]: { ...current[booking._id], loading: true } }));
      const now = new Date();
      const month = now.toLocaleString('en-US', { month: 'long' });
      const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });

      const [weatherResult, crowdResult] = await Promise.allSettled([
        weatherService.getCurrentWeather(place),
        aiService.predictCrowd(place, month, dayOfWeek)
      ]);

      if (cancelled) return;

      setJourneyReports((current) => ({
        ...current,
        [booking._id]: {
          weather: weatherResult.status === 'fulfilled' ? weatherResult.value : null,
          crowd: crowdResult.status === 'fulfilled' ? crowdResult.value.data : null,
          error: weatherResult.status === 'rejected' && crowdResult.status === 'rejected'
            ? 'Live conditions are temporarily unavailable.'
            : '',
          updatedAt: new Date(),
          loading: false
        }
      }));
    };

    updateJourney();
    const intervalId = window.setInterval(updateJourney, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeJourneyId, bookings, refreshJourney]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The trip data will be permanently removed.')) return;

    try {
      await bookingService.cancelBooking(bookingId);
      // Immediately remove from UI state
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      showNotification('Reservation cancelled and trip data removed.', 'info');

      // Trigger instant cross-app sync
      window.dispatchEvent(new CustomEvent('intellitrip:booking_updated', { detail: { bookingId, status: 'Cancelled', deleted: true } }));
      window.dispatchEvent(new Event('booking_updated'));
      try {
        localStorage.setItem('intellitrip_last_booking_sync', Date.now().toString());
      } catch {}

      fetchAllData(false);
    } catch (err) {
      showNotification(err.message || 'Cancellation failed', 'error');
    }
  };

  const handleDeleteItinerary = async (itineraryId) => {
    if (!window.confirm('Are you sure you want to delete this AI itinerary? This action cannot be undone.')) return;

    try {
      await aiService.deleteItinerary(itineraryId);
      setItineraries((prev) => prev.filter((i) => i._id !== itineraryId));
      if (selectedItinerary?._id === itineraryId) {
        setSelectedItinerary(null);
      }
      showNotification('AI Itinerary deleted successfully.', 'info');

      // Trigger instant cross-app sync
      window.dispatchEvent(new CustomEvent('intellitrip:itinerary_updated', { detail: { _id: itineraryId, deleted: true } }));
      window.dispatchEvent(new Event('itinerary_updated'));
      try {
        localStorage.setItem('intellitrip_last_itinerary_sync', Date.now().toString());
      } catch {}

      fetchAllData(false);
    } catch (err) {
      showNotification(err.message || 'Failed to delete itinerary', 'error');
    }
  };

  const getItemIcon = (type) => {
    if (type === 'Hotel') return <Building size={18} color="#d4af37" />;
    if (type === 'Transport') return <Car size={18} color="#d4af37" />;
    if (type === 'Restaurant') return <Utensils size={18} color="#d4af37" />;
    if (type === 'Destination') return <Compass size={18} color="#d4af37" />;
    return <Sparkles size={18} color="#d4af37" />;
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem', minHeight: '85vh' }}>
      <BackButton to="/tourist/dashboard" />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <span className="badge badge-primary">Unified Traveler Manager</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.35rem' }}>
            My Itineraries & Bookings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage all your luxury stays, fleet charters, restaurant tables, and AI trip itineraries.
          </p>
        </div>

        <div>
          <Link
            to="/ai-planner"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none', fontSize: '0.85rem' }}
          >
            <Sparkles size={15} /> Plan With AI
          </Link>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={styles.tabContainer}>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          style={{ ...styles.tabBtn, ...(activeTab === 'bookings' ? styles.tabBtnActive : {}) }}
        >
          <Calendar size={15} /> Active Reservations & Fleet ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('itineraries')}
          style={{ ...styles.tabBtn, ...(activeTab === 'itineraries' ? styles.tabBtnActive : {}) }}
        >
          <Route size={15} /> Saved AI Itineraries ({itineraries.length})
        </button>
      </div>

      {loading ? (
        <Loader message="Fetching your real-time itineraries..." />
      ) : activeTab === 'bookings' ? (
        /* TAB 1: RESERVATIONS & BOOKINGS */
        bookings.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
            <Calendar size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h3>No Active Bookings Found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Explore luxury stays, vehicle rentals, tours, or gourmet dining to make your first reservation.
            </p>
            <Link to="/destinations" className="btn btn-primary">
              Explore Journeys
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.map((b) => (
              <div key={b._id} className="glass-card" style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={styles.iconCircle}>{getItemIcon(b.itemType)}</div>
                    <div>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{b.itemType} Booking</span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.2rem', color: '#f8fafc' }}>
                        {b.itemRef?.name || b.itemRef?.title || b.itemRef?.vehicleModel || 'Tourism Service'}
                      </h3>
                      {b.itemLocation && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {b.itemLocation}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      className={`badge ${b.status === 'Confirmed' ? 'badge-success' : b.status === 'Cancelled' ? 'badge-warning' : 'badge-primary'}`}
                    >
                      {b.status}
                    </span>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                      ₹{(b.currency === 'USD' ? Number(b.totalPrice) * 80 : Number(b.totalPrice)).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.infoCol}>
                    <span style={styles.infoLabel}>Booking Reference</span>
                    <p style={styles.infoVal}>#{b._id.substring(b._id.length - 8).toUpperCase()}</p>
                  </div>

                  <div style={styles.infoCol}>
                    <span style={styles.infoLabel}>Scheduled Date</span>
                    <p style={styles.infoVal}>
                      {new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {b.reservationTime ? ` · ${b.reservationTime}` : ''}
                      {b.endDate && b.endDate !== b.startDate
                        ? ` - ${new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : ''}
                    </p>
                  </div>

                  <div style={styles.infoCol}>
                    <span style={styles.infoLabel}>Guests / Units</span>
                    <p style={styles.infoVal}>{b.guests} Guest(s)</p>
                  </div>

                  <div style={styles.infoCol}>
                    <span style={styles.infoLabel}>Payment Status</span>
                    <p style={{ ...styles.infoVal, color: b.paymentStatus === 'Paid' ? '#10b981' : 'var(--text-muted)' }}>
                      {b.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Highlights for Destination */}
                {b.status === 'Confirmed' && b.itemRef?.destination?.attractions?.length > 0 && (
                  <section style={styles.highlightsPanel}>
                    <h4 style={styles.journeyTitle}>Don't miss in {b.itemRef.destination.city}</h4>
                    <p style={styles.journeyMeta}>Famous nearby spots selected for your booked destination.</p>
                    <div style={styles.highlightsGrid}>
                      {b.itemRef.destination.attractions.slice(0, 3).map((attraction) => (
                        <article key={attraction.name} style={styles.highlightItem}>
                          {attraction.image && <img src={attraction.image} alt={attraction.name} style={styles.highlightImage} />}
                          <div>
                            <strong>{attraction.name}</strong>
                            <p style={styles.highlightDescription}>{attraction.whyNotMiss || attraction.description}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {/* Live Journey Conditions */}
                {b.status === 'Confirmed' && (activeJourneyId === b._id ? (
                  <section style={styles.journeyPanel} aria-label="Journey conditions">
                    <div style={styles.journeyHeader}>
                      <div>
                        <h4 style={styles.journeyTitle}>
                          Journey conditions · {b.itemRef?.destination?.city || b.itemRef?.city || 'Your destination'}
                        </h4>
                        <p style={styles.journeyMeta}>
                          {journeyReports[b._id]?.updatedAt
                            ? `Updated ${new Date(journeyReports[b._id].updatedAt).toLocaleTimeString()}`
                            : 'Checking current conditions...'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRefreshJourney((v) => v + 1)}
                        className="btn btn-secondary"
                        style={styles.refreshButton}
                      >
                        <RefreshCw size={13} /> Refresh Conditions
                      </button>
                    </div>

                    <div style={styles.conditionGrid}>
                      <div style={styles.conditionItem}>
                        <CloudSun size={18} color="#d4af37" />
                        <div>
                          <strong>Live Weather</strong>
                          <p>
                            {journeyReports[b._id]?.weather
                              ? `${journeyReports[b._id].weather.condition}, ${journeyReports[b._id].weather.temperature}°C`
                              : 'Unavailable'}
                          </p>
                        </div>
                      </div>
                      <div style={styles.conditionItem}>
                        <Users size={18} color="#d4af37" />
                        <div>
                          <strong>Estimated Crowd Density</strong>
                          <p>
                            {journeyReports[b._id]?.crowd
                              ? `${journeyReports[b._id].crowd.crowdLevel} (${journeyReports[b._id].crowd.densityScore}/100)`
                              : 'Unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : (
                  <div style={styles.cardFooter}>
                    <button
                      type="button"
                      onClick={() => setActiveJourneyId(b._id)}
                      className="btn btn-primary"
                      style={styles.startButton}
                    >
                      <Play size={14} /> Live Journey Conditions
                    </button>
                    <button
                      onClick={() => handleCancel(b._id)}
                      className="btn btn-secondary"
                      style={{
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                        fontSize: '0.8rem',
                        padding: '0.45rem 0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Trash2 size={13} /> Cancel & Remove Reservation
                    </button>
                  </div>
                ))}

                {b.status === 'Pending' && (
                  <div style={styles.cardFooter}>
                    <span style={styles.journeyMeta}>Reservation awaiting payment confirmation.</span>
                    <button
                      onClick={() => handleCancel(b._id)}
                      className="btn btn-secondary"
                      style={{
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                        fontSize: '0.8rem',
                        padding: '0.45rem 0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Trash2 size={13} /> Cancel & Remove Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* TAB 2: SAVED AI ITINERARIES */
        itineraries.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
            <Route size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h3>No Saved AI Itineraries</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Generate an intelligent, day-by-day travel itinerary with Google Gemini AI.
            </p>
            <Link to="/ai-planner" className="btn btn-primary">
              <Sparkles size={15} /> Plan New Itinerary
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {itineraries.map((itinerary) => (
              <div key={itinerary._id} className="glass-card" style={styles.itineraryCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">{itinerary.durationDays} Days Duration</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                    ₹{Number(itinerary.totalBudget || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                  {itinerary.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
                  <MapPin size={13} color="#d4af37" /> {itinerary.destinationName} · {itinerary.travelers || 2} Travelers
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Saved on {new Date(itinerary.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedItinerary(itinerary)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                    >
                      View Day Plans
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItinerary(itinerary._id)}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.65rem',
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      title="Delete Itinerary"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Itinerary Day Plans Modal */}
      {selectedItinerary && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedItinerary(null);
          }}
        >
          <div role="dialog" aria-modal="true" style={styles.itineraryModal} className="glass-card">
            <button
              type="button"
              onClick={() => setSelectedItinerary(null)}
              className="btn btn-secondary"
              style={styles.closeModal}
            >
              <X size={16} />
            </button>
            <span className="badge badge-primary">
              {selectedItinerary.durationDays} Days · {selectedItinerary.travelers || 2} Travelers
            </span>
            <h2 style={styles.modalTitle}>{selectedItinerary.title}</h2>
            <p style={styles.modalSubtitle}>
              {selectedItinerary.destinationName} · Total Budget: <strong style={{ color: '#10b981' }}>₹{Number(selectedItinerary.totalBudget || 0).toLocaleString('en-IN')}</strong>
            </p>

            <div style={{ marginTop: '1.25rem', display: 'grid', gap: '1rem' }}>
              {(selectedItinerary.dayPlans || []).map((day) => (
                <div key={day.dayNumber} style={styles.dayPlanCard}>
                  <h4 style={{ color: '#d4af37', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    ✦ Day {day.dayNumber}: {day.theme || 'Exploration Day'}
                  </h4>
                  <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.84rem', color: '#e2d5e6' }}>
                    <p style={{ margin: 0 }}><strong>🌅 Morning:</strong> {day.morning}</p>
                    <p style={{ margin: 0 }}><strong>☀️ Afternoon:</strong> {day.afternoon}</p>
                    <p style={{ margin: 0 }}><strong>🌙 Evening:</strong> {day.evening}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer with Delete Itinerary Option */}
            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Saved Itinerary ID: #{selectedItinerary._id?.slice(-8).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteItinerary(selectedItinerary._id)}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#ef4444',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  fontSize: '0.82rem',
                  padding: '0.45rem 0.95rem'
                }}
              >
                <Trash2 size={14} /> Delete This Itinerary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    color: '#34d399',
    fontSize: '0.72rem',
    fontWeight: 700,
    padding: '0.2rem 0.55rem',
    borderRadius: '9999px'
  },
  liveDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981'
  },
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.75rem',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    paddingBottom: '0.25rem'
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.65rem 1.25rem',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#bda3c4',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  tabBtnActive: {
    color: '#f7e7be',
    borderBottomColor: '#d4af37',
    background: 'rgba(212, 175, 55, 0.1)',
    borderRadius: '4px 4px 0 0'
  },
  card: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardBody: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },
  infoLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: 600
  },
  infoVal: {
    fontSize: '0.88rem',
    fontWeight: 600,
    color: '#f8fafc'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '0.75rem',
    paddingTop: '0.5rem'
  },
  startButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    padding: '0.45rem 0.85rem'
  },
  highlightsPanel: {
    padding: '1rem',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '6px',
    background: 'rgba(21, 9, 23, 0.5)'
  },
  highlightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.75rem'
  },
  highlightItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    fontSize: '0.82rem'
  },
  highlightImage: {
    width: '60px',
    height: '45px',
    objectFit: 'cover',
    borderRadius: '4px',
    flexShrink: 0
  },
  highlightDescription: {
    color: 'var(--text-muted)',
    marginTop: '0.2rem'
  },
  journeyPanel: {
    padding: '1.2rem',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    borderRadius: '6px',
    background: 'rgba(21, 9, 23, 0.7)'
  },
  journeyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  journeyTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#f8fafc'
  },
  journeyMeta: {
    color: 'var(--text-muted)',
    fontSize: '0.78rem',
    marginTop: '0.2rem'
  },
  refreshButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.65rem',
    fontSize: '0.78rem'
  },
  conditionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.85rem'
  },
  conditionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    padding: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.02)'
  },
  itineraryCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1300,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(6px)'
  },
  itineraryModal: {
    position: 'relative',
    width: '100%',
    maxWidth: '740px',
    maxHeight: '88vh',
    overflowY: 'auto',
    padding: '1.5rem',
    background: '#150917',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: '8px'
  },
  closeModal: {
    float: 'right',
    padding: '0.3rem 0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    marginTop: '0.65rem',
    fontSize: '1.35rem',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc'
  },
  modalSubtitle: {
    color: 'var(--text-muted)',
    margin: '0.3rem 0 1rem',
    fontSize: '0.86rem'
  },
  dayPlanCard: {
    padding: '0.85rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.15)'
  }
};

export default MyBookings;
