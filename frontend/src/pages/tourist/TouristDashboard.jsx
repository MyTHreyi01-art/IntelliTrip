import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { aiService } from '../../services/aiService';
import { bookingService } from '../../services/bookingService';
import { wishlistService } from '../../services/wishlistService';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';
import {
  Compass,
  Wallet,
  Bookmark,
  Sparkles,
  MapPin,
  Clock,
  Dna,
  RefreshCw,
  Activity,
  Calendar,
  CheckCircle2,
  Trash2,
  ArrowRight
} from 'lucide-react';

const TouristDashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [dashboard, setDashboard] = useState({ bookings: [], itineraries: [], wishlist: null, dna: null });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const lastSyncTimeRef = useRef(Date.now());

  const fetchDashboardData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsSyncing(true);

    try {
      const [bookings, itineraries, wishlist, dna] = await Promise.allSettled([
        bookingService.getMyBookings(),
        aiService.getUserItineraries(),
        wishlistService.getWishlist(),
        aiService.getTravelDNA()
      ]);

      setDashboard({
        bookings: bookings.status === 'fulfilled' ? bookings.value.data || [] : [],
        itineraries: itineraries.status === 'fulfilled' ? itineraries.value.data || [] : [],
        wishlist: wishlist.status === 'fulfilled' ? wishlist.value.data || null : null,
        dna: dna.status === 'fulfilled' ? dna.value.data || null : null
      });

      lastSyncTimeRef.current = Date.now();
    } catch {
      // Silent catch for real-time background ticks
    } finally {
      if (isInitial) setLoading(false);
      else setIsSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Initial Load
    fetchDashboardData(true);

    // 2. Real-Time Auto-Polling (every 3.5 seconds)
    const pollInterval = setInterval(() => {
      fetchDashboardData(false);
    }, 3500);

    // 3. Instant Event-Driven Updates
    const handleSyncEvent = () => {
      fetchDashboardData(false);
    };

    const handleWindowFocus = () => {
      fetchDashboardData(false);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData(false);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'intellitrip_last_booking_sync' || e.key === 'intellitrip_last_itinerary_sync') {
        fetchDashboardData(false);
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

  const handleDeleteItinerary = async (itineraryId) => {
    if (!window.confirm('Are you sure you want to delete this AI itinerary? This action cannot be undone.')) return;

    try {
      await aiService.deleteItinerary(itineraryId);
      setDashboard((prev) => ({
        ...prev,
        itineraries: prev.itineraries.filter((i) => i._id !== itineraryId)
      }));
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

      fetchDashboardData(false);
    } catch (err) {
      showNotification(err.message || 'Failed to delete itinerary', 'error');
    }
  };

  if (loading) return <Loader fullScreen message="Loading your real-time travel workspace..." />;

  // Confirmed and active bookings sorted newest first
  const upcomingBookings = [...dashboard.bookings]
    .filter((booking) => !['Cancelled'].includes(booking.status))
    .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));

  const wishlistCount = ['destinations', 'hotels', 'experiences', 'restaurants']
    .reduce((total, key) => total + (dashboard.wishlist?.[key]?.length || 0), 0);

  const activeBudgetInr = upcomingBookings.reduce((total, booking) => {
    const price = Number(booking.totalPrice || 0);
    return total + (booking.currency === 'USD' ? price * 80 : price);
  }, 0);

  const scores = dashboard.dna?.scores || {};
  const primaryStyle = dashboard.dna?.primaryStyle || 'Bespoke Explorer';
  const scoreColor = (value) => (value >= 80 ? '#10b981' : value >= 60 ? '#d4af37' : value >= 40 ? '#f59e0b' : '#ef4444');

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      <BackButton />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <span className="badge badge-primary">Tourist Workspace</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem' }}>
            Welcome back, {user?.name || 'Explorer'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Centralized tracker for your reservations, AI itineraries, Travel DNA, and fleet charters.
          </p>
        </div>

        <div>
          <Link
            to="/ai-planner"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} /> Plan New AI Trip
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={styles.statsGrid}>
        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, background: '#e0f2fe' }}>
            <Compass size={22} color="#0284c7" />
          </div>
          <div>
            <p style={styles.statLabel}>Active Trips & Fleet</p>
            <h3 style={styles.statVal}>{upcomingBookings.length} bookings</h3>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, background: '#fef3c7' }}>
            <Sparkles size={22} color="#d97706" />
          </div>
          <div>
            <p style={styles.statLabel}>Travel DNA Persona</p>
            <h3 style={styles.statVal}>{primaryStyle}</h3>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, background: '#dcfce7' }}>
            <Wallet size={22} color="#16a34a" />
          </div>
          <div>
            <p style={styles.statLabel}>Active Budget (INR)</p>
            <h3 style={{ ...styles.statVal, color: '#10b981' }}>₹{activeBudgetInr.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, background: '#fae8ff' }}>
            <Bookmark size={22} color="#c026d3" />
          </div>
          <div>
            <p style={styles.statLabel}>Saved Wishlist</p>
            <h3 style={styles.statVal}>{wishlistCount} items</h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.contentGrid}>
        {/* Left Column: Upcoming Bookings & Saved AI Itineraries */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upcoming & Active Bookings</h3>
            <Link to="/tourist/bookings" style={styles.textLink}>
              Manage all bookings <ArrowRight size={12} style={{ display: 'inline' }} />
            </Link>
          </div>

          {upcomingBookings.length ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {upcomingBookings.slice(0, 4).map((booking) => (
                <div key={booking._id} style={styles.tripCard}>
                  <div style={styles.tripBadge}>
                    <Clock size={13} />
                    <span>
                      {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {booking.reservationTime && <span>· {booking.reservationTime}</span>}
                  </div>
                  <h4 style={styles.tripTitle}>
                    {booking.itemRef?.name || booking.itemRef?.title || booking.itemRef?.vehicleModel || `${booking.itemType} reservation`}
                  </h4>
                  <p style={styles.tripLocation}>
                    <MapPin size={13} color="#d4af37" />
                    {booking.itemRef?.city || booking.itemRef?.destination?.city || 'Bespoke Experience'}
                  </p>
                  <div style={styles.tripFooter}>
                    <span className={`badge ${booking.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>
                      {booking.status}
                    </span>
                    <span style={styles.tripPrice}>
                      ₹{(booking.currency === 'USD' ? Number(booking.totalPrice || 0) * 80 : Number(booking.totalPrice || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>No active bookings. Browse Luxury Stays, Transport, or Gourmet Dining to reserve.</p>
          )}

          {/* Saved AI Itineraries Section */}
          <div style={styles.itineraryHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Saved AI Itineraries</h3>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{dashboard.itineraries.length} Saved</span>
            </div>
            <Link to="/tourist/bookings" state={{ defaultTab: 'itineraries' }} style={styles.textLink}>
              View all <ArrowRight size={12} style={{ display: 'inline' }} />
            </Link>
          </div>

          {dashboard.itineraries.length ? (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {dashboard.itineraries.slice(0, 4).map((itinerary) => (
                <button
                  key={itinerary._id}
                  type="button"
                  onClick={() => setSelectedItinerary(itinerary)}
                  style={styles.itineraryRow}
                >
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.88rem', color: '#f8fafc', display: 'block' }}>{itinerary.title}</strong>
                    <small style={{ color: '#bda3c4', fontSize: '0.76rem' }}>
                      {itinerary.destinationName} · {itinerary.durationDays} Days · {itinerary.travelers || 2} Guests
                    </small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      {itinerary.status || 'Active'}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, marginTop: '0.2rem' }}>
                      ₹{Number(itinerary.totalBudget || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>You haven’t saved an AI itinerary yet. Click "Plan New AI Trip" to generate one.</p>
          )}
        </div>

        {/* Right Column: Travel DNA Profile */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={styles.dnaHeader}>
            <Dna size={19} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Travel DNA Profile</h3>
          </div>
          <strong style={styles.persona}>{primaryStyle}</strong>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(scores).length ? (
              Object.entries(scores).map(([category, value]) => (
                <div key={category}>
                  <div style={styles.dnaLabel}>
                    <span>{category}</span>
                    <span>{value}%</span>
                  </div>
                  <div style={styles.progressBar} role="progressbar" aria-label={`${category} score`}>
                    <div style={{ ...styles.progressFill, width: `${value}%`, background: scoreColor(Number(value)) }} />
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>Your Travel DNA profile has not been customized.</p>
            )}
          </div>
          <Link to="/travel-dna" className="btn btn-secondary" style={styles.dnaButton}>
            Update Travel DNA
          </Link>
          <Link to="/recommendations" className="btn btn-primary" style={styles.dnaButton}>
            Refresh recommendations
          </Link>
        </div>
      </div>

      {/* Saved Itinerary Modal Preview */}
      {selectedItinerary && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedItinerary(null);
          }}
        >
          <section role="dialog" aria-modal="true" style={styles.itineraryModal} className="glass-card">
            <button
              type="button"
              onClick={() => setSelectedItinerary(null)}
              className="btn btn-secondary"
              style={styles.closeModal}
            >
              Close
            </button>
            <span className="badge badge-primary">{selectedItinerary.durationDays} Days · {selectedItinerary.status || 'Active'}</span>
            <h2 style={styles.modalTitle}>{selectedItinerary.title}</h2>
            <p style={styles.modalSubtitle}>
              {selectedItinerary.destinationName} · {selectedItinerary.travelers || 2} Travelers · Budget: ₹{Number(selectedItinerary.totalBudget || 0).toLocaleString('en-IN')}
            </p>

            <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
              {(selectedItinerary.dayPlans || []).map((day) => (
                <article key={day.dayNumber} style={styles.savedDay}>
                  <h4 style={{ color: '#d4af37', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
                    Day {day.dayNumber}: {day.theme || 'Exploration Day'}
                  </h4>
                  <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#f8fafc' }}>
                    <strong>Morning:</strong> {day.morning}
                  </p>
                  <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#f8fafc' }}>
                    <strong>Afternoon:</strong> {day.afternoon}
                  </p>
                  <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#f8fafc' }}>
                    <strong>Evening:</strong> {day.evening}
                  </p>
                </article>
              ))}
            </div>

            {/* Modal Footer with Delete Itinerary Option */}
            <div style={{
              marginTop: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.9rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.9rem'
                }}
              >
                <Trash2 size={13} /> Delete This Itinerary
              </button>
            </div>
          </section>
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2rem'
  },
  statCard: {
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  statVal: {
    fontSize: '1.15rem',
    fontWeight: '700',
    marginTop: '0.15rem'
  },
  textLink: {
    color: 'var(--color-primary)',
    fontSize: '0.82rem',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    textDecoration: 'none'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem'
  },
  tripCard: {
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)'
  },
  tripBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: 'var(--color-primary)',
    fontWeight: '600'
  },
  tripTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '0.4rem',
    color: '#f8fafc'
  },
  tripLocation: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.25rem'
  },
  tripFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  },
  tripPrice: {
    fontSize: '0.92rem',
    fontWeight: 700,
    color: '#10b981'
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.88rem',
    padding: '0.75rem 0'
  },
  itineraryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '1.75rem 0 0.85rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  },
  itineraryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
    textAlign: 'left',
    cursor: 'pointer'
  },
  dnaHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  persona: {
    color: 'var(--color-primary)',
    fontSize: '1rem'
  },
  dnaLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
    textTransform: 'capitalize'
  },
  progressBar: {
    width: '100%',
    height: '7px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '9999px'
  },
  dnaButton: {
    width: '100%',
    marginTop: '0.25rem',
    textAlign: 'center'
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
    maxWidth: '760px',
    maxHeight: '88vh',
    overflowY: 'auto',
    padding: '1.5rem',
    background: '#150917',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: '8px'
  },
  closeModal: {
    float: 'right',
    padding: '0.35rem 0.65rem',
    fontSize: '0.78rem'
  },
  modalTitle: {
    marginTop: '0.75rem',
    fontSize: '1.4rem',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc'
  },
  modalSubtitle: {
    color: 'var(--text-muted)',
    margin: '0.35rem 0 1rem',
    fontSize: '0.88rem'
  },
  savedDay: {
    padding: '0.9rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.15)'
  }
};

export default TouristDashboard;
