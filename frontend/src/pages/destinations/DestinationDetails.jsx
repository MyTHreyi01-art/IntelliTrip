import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { destinationService } from '../../services/destinationService';
import { hotelService } from '../../services/hotelService';
import { experienceService } from '../../services/experienceService';
import { reviewService } from '../../services/reviewService';
import { aiService } from '../../services/aiService';
import { weatherService } from '../../services/weatherService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import SignUpPrompt from '../../components/common/SignUpPrompt';
import BackButton from '../../components/common/BackButton';
import BookingDetailsModal from '../../components/booking/BookingDetailsModal';
import BookingConfirmationModal from '../../components/booking/BookingConfirmationModal';
import {
  MapPin,
  Star,
  Calendar,
  Building,
  Sparkles,
  Send,
  MessageSquare,
  Compass,
  ArrowRight,
  Crown,
  ShieldCheck,
  CheckCircle2,
  CloudSun,
  Users,
  RefreshCw
} from 'lucide-react';

const FALLBACK_DEST_IMG = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
const FALLBACK_ATTRACTION_IMG = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80';

const DestinationDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conditions, setConditions] = useState(null);
  const [conditionsLoading, setConditionsLoading] = useState(false);
  const [conditionsRefresh, setConditionsRefresh] = useState(0);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [emailConfirmationInfo, setEmailConfirmationInfo] = useState(null);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchDestinationData();
  }, [id]);

  useEffect(() => {
    if (!destination) return undefined;
    let cancelled = false;
    const loadConditions = async () => {
      setConditionsLoading(true);
      const now = new Date();
      const [weatherResult, crowdResult] = await Promise.allSettled([
        weatherService.getCurrentWeather(destination.city),
        aiService.predictCrowd(
          destination.name,
          now.toLocaleString('en-US', { month: 'long' }),
          now.toLocaleString('en-US', { weekday: 'long' })
        )
      ]);
      if (cancelled) return;
      setConditions({
        weather: weatherResult.status === 'fulfilled' ? weatherResult.value : null,
        crowd: crowdResult.status === 'fulfilled' ? crowdResult.value.data : null,
        updatedAt: new Date()
      });
      setConditionsLoading(false);
    };
    loadConditions();
    return () => { cancelled = true; };
  }, [destination, conditionsRefresh]);

  const fetchDestinationData = async () => {
    setLoading(true);
    try {
      const destRes = await destinationService.getDestinationById(id);
      setDestination(destRes.data);

      const [hotelRes, expRes, reviewRes] = await Promise.all([
        hotelService.getHotels({ destinationId: id }),
        experienceService.getExperiences({ destinationId: id }),
        reviewService.getReviewsByTarget(id)
      ]);

      setHotels(hotelRes.data || []);
      setExperiences(expRes.data || []);
      setReviews(reviewRes.data || []);
    } catch (err) {
      showNotification(err.message || 'Failed to load destination details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification('Please log in to submit a review', 'info');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        targetType: 'Destination',
        targetId: id,
        rating: newRating,
        comment: newComment
      });

      showNotification('Review submitted successfully!', 'success');
      setNewComment('');
      // Refresh reviews
      const updated = await reviewService.getReviewsByTarget(id);
      setReviews(updated.data || []);
    } catch (err) {
      showNotification(err.message || 'Could not submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      setShowSignUpPrompt(true);
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (bookingData, emailInfo) => {
    setConfirmedBooking(bookingData);
    setEmailConfirmationInfo(emailInfo);
  };

  if (loading) return <Loader fullScreen message="Curating bespoke destination details..." />;
  if (!destination) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: '#f7e7be', fontFamily: 'var(--font-serif)' }}>Destination Not Found</h2>
        <Link to="/destinations" className="btn btn-gold" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          Back to Bespoke Journeys
        </Link>
      </div>
    );
  }

  const heroImg = (destination.images && destination.images[0]) ? destination.images[0] : FALLBACK_DEST_IMG;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', minHeight: '90vh' }}>
      <BackButton to="/destinations" />
      {/* Opulent Hero Banner */}
      <div style={styles.heroWrapper} className="gold-frame">
        <img
          src={heroImg}
          alt={destination.name}
          style={styles.heroImg}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_DEST_IMG;
          }}
        />
        <div style={styles.heroOverlay}>
          <div style={styles.badgeRow}>
            <span className="badge badge-gold">✦ {destination.category}</span>
            <span style={styles.heroRatingBadge}>
              <Star size={13} fill="#d4af37" color="#d4af37" /> {Number(destination.rating || 4.9).toFixed(1)} ({destination.reviewCount || reviews.length} Reviews)
            </span>
          </div>
          <h1 style={styles.heroTitle}>{destination.name}</h1>
          <p style={styles.heroSub}>
            <MapPin size={16} color="#d4af37" /> {destination.city}, {destination.state ? `${destination.state}, ` : ''}{destination.country}
          </p>
        </div>
      </div>

      <section style={styles.bookingBanner} aria-label={`Book a trip to ${destination.name}`}>
        <div>

          <section style={styles.conditionsPanel} aria-label={`Current weather and crowd estimate for ${destination.name}`}>
            <div style={styles.conditionsHeader}>
              <div>
                <h2 style={styles.sectionHeading}>Weather &amp; crowd outlook</h2>
                <p style={styles.conditionsMeta}>
                  {conditions?.updatedAt ? `Updated ${conditions.updatedAt.toLocaleTimeString()}` : 'Checking current conditions'}
                  {' · '}Crowd level is a model estimate, not a live count.
                </p>
              </div>
              <button type="button" onClick={() => setConditionsRefresh((value) => value + 1)} className="btn btn-secondary" style={styles.conditionsRefresh}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
            <div style={styles.conditionsGrid}>
              <div style={styles.conditionCard}>
                <CloudSun size={19} color="#d4af37" />
                <div>
                  <strong>Current weather</strong>
                  <p>{conditionsLoading && !conditions?.weather ? 'Loading...' : conditions?.weather
                    ? `${conditions.weather.condition}, ${conditions.weather.temperature}°C · Wind ${conditions.weather.windSpeed} km/h`
                    : 'Currently unavailable'}</p>
                </div>
              </div>
              <div style={styles.conditionCard}>
                <Users size={19} color="#d4af37" />
                <div>
                  <strong>Estimated crowd</strong>
                  <p>{conditionsLoading && !conditions?.crowd ? 'Loading...' : conditions?.crowd
                    ? `${conditions.crowd.crowdLevel} (${conditions.crowd.densityScore}/100) · ${conditions.crowd.recommendedVisitTime}`
                    : 'Currently unavailable'}</p>
                </div>
              </div>
            </div>
          </section>
          <span style={styles.metaLabel}>START PLANNING YOUR STAY</span>
          <p style={styles.bookingCopy}>Find available stays and experiences near {destination.city}.</p>
        </div>
        <button type="button" className="btn btn-gold" onClick={handleBookNow} style={styles.bookButton}>
          <Calendar size={16} /> Book Now
        </button>
      </section>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* Left Column: Description, Attractions, Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Overview Card */}
          <div className="luxury-card" style={{ padding: '2rem' }}>
            <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Compass size={13} /> Destination Overview
            </span>
            <h2 style={styles.sectionHeading}>About this Bespoke Haven</h2>
            <p style={styles.descText}>
              {destination.description}
            </p>

            {(destination.historicalBackground || destination.knownFor) && (
              <div style={styles.placeFacts}>
                {destination.historicalBackground && (
                  <div>
                    <h3 style={styles.factHeading}>A little history</h3>
                    <p style={styles.descText}>{destination.historicalBackground}</p>
                  </div>
                )}
                {destination.knownFor && (
                  <div>
                    <h3 style={styles.factHeading}>Known for</h3>
                    <p style={styles.descText}>{destination.knownFor}</p>
                  </div>
                )}
              </div>
            )}

            <div style={styles.metaBoxGroup}>
              <div style={styles.metaBox}>
                <Calendar size={20} color="#d4af37" />
                <div>
                  <span style={styles.metaLabel}>BEST TIME TO VISIT</span>
                  <p style={styles.metaVal}>{destination.bestTimeToVisit || 'October to March'}</p>
                </div>
              </div>

              <div style={styles.metaBox}>
                <Crown size={20} color="#d4af37" />
                <div>
                  <span style={styles.metaLabel}>EST. DAILY LUXURY EXPENSE</span>
                  <p style={styles.metaVal}>₹{Number(destination.averageCostPerDay || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#bda3c4', fontWeight: 400 }}>/ day</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Attractions with Images */}
          {destination.attractions && destination.attractions.length > 0 && (
            <div className="luxury-card" style={{ padding: '2rem' }}>
              <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <Sparkles size={13} /> Highlights
              </span>
              <h2 style={styles.sectionHeading}>Iconic Landmarks & Heritage Attractions</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
                {destination.attractions.map((att, idx) => {
                  const attImg = att.image || FALLBACK_ATTRACTION_IMG;
                  return (
                    <div key={idx} style={styles.attractionCard}>
                      <div style={styles.attractionImgWrap}>
                        <img
                          src={attImg}
                          alt={att.name}
                          style={styles.attractionImg}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_ATTRACTION_IMG;
                          }}
                        />
                        <div style={styles.attractionNumber}>{idx + 1}</div>
                      </div>
                      <div style={styles.attractionBody}>
                        <h4 style={styles.attractionName}>{att.name}</h4>
                        <p style={styles.attractionDesc}>{att.description}</p>
                        <p style={styles.attractionWhy}><strong>Why not miss it:</strong> {att.whyNotMiss || att.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="luxury-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-gold">✦ Guest Experiences</span>
                <h2 style={styles.sectionHeading}>Elite Voyager Reviews</h2>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>{reviews.length} Verified Reviews</span>
            </div>

            {/* Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f7e7be' }}>YOUR RATING:</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    style={styles.ratingSelect}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3 - Pleasant)</option>
                    <option value={2}>⭐⭐ (2 - Moderate)</option>
                    <option value={1}>⭐ (1 - Needs Refinement)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your personal review and memories of this destination..."
                    style={styles.reviewInput}
                  />
                  <button type="submit" disabled={submittingReview} className="btn btn-gold" style={{ padding: '0.65rem 1.4rem' }}>
                    <Send size={15} /> Submit Review
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.loginPrompt}>
                <p style={{ color: '#e2d5e6', fontSize: '0.9rem' }}>Join or sign in to IntelliTrip Elite to submit a verified destination review.</p>
                <Link to="/login" className="btn btn-gold" style={{ padding: '0.45rem 1.2rem', fontSize: '0.82rem' }}>
                  Sign In
                </Link>
              </div>
            )}

            {/* Review List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {reviews.length === 0 ? (
                <p style={{ color: '#bda3c4', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  No reviews recorded yet. Be the first distinguished voyager to share your experience!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} style={styles.reviewCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f7e7be' }}>
                        {rev.user?.name || 'Distinguished Voyager'}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#d4af37', fontWeight: 700 }}>
                        {'⭐'.repeat(rev.rating)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#ebdceb', marginTop: '0.4rem', lineHeight: '1.5' }}>
                      "{rev.comment}"
                    </p>
                    <span style={{ fontSize: '0.72rem', color: '#9d84a5', marginTop: '0.5rem', display: 'block' }}>
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Nearby Hotels & Experiences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Nearby Hotels Card */}
          <div className="luxury-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Building size={18} color="#d4af37" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: '#f7e7be' }}>
                Luxury Stays in {destination.city}
              </h3>
            </div>

            {hotels.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#bda3c4' }}>Explore our complete hotel directory.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {hotels.slice(0, 4).map((h) => (
                  <Link key={h._id} to={`/hotels/${h._id}`} style={styles.sideCard}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f7e7be' }}>{h.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#d4af37', marginTop: '4px' }}>
                      Starting from ₹{Number(h.startingPrice || 0).toLocaleString()} <span style={{ color: '#bda3c4', fontSize: '0.72rem' }}>/ night</span>
                    </p>
                  </Link>
                ))}
              </div>
            )}

            <Link to={`/hotels?search=${encodeURIComponent(destination.city)}`} style={styles.viewMoreLink}>
              View All Hotels in {destination.city} <ArrowRight size={14} />
            </Link>
          </div>

          {/* Local Experiences Card */}
          <div className="luxury-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sparkles size={18} color="#d4af37" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: '#f7e7be' }}>
                Signature Experiences
              </h3>
            </div>

            {experiences.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#bda3c4' }}>Discover curated moments in our catalog.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {experiences.slice(0, 4).map((exp) => (
                  <Link key={exp._id} to="/experiences" style={styles.sideCard}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f7e7be' }}>{exp.title}</h4>
                    <span style={styles.miniTag}>{exp.category}</span>
                    <p style={{ fontSize: '0.8rem', color: '#d4af37', marginTop: '4px' }}>
                      ₹{Number(exp.pricePerPerson || 0).toLocaleString()} <span style={{ color: '#bda3c4', fontSize: '0.72rem' }}>/ guest</span>
                    </p>
                  </Link>
                ))}
              </div>
            )}

            <Link to="/experiences" style={styles.viewMoreLink}>
              Explore All Experiences <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
      <SignUpPrompt
        open={showSignUpPrompt}
        onClose={() => setShowSignUpPrompt(false)}
        returnTo={`/destinations/${id}`}
        title="Sign up to book this tour"
        message={`Create a free account to book your bespoke trip to ${destination.name}. Confirmation details will be emailed to your registered address.`}
      />

      <BookingDetailsModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={handleBookingSuccess}
        item={destination}
        itemType="Destination"
        title={`${destination.name} Bespoke Tour`}
        subtitle={`${destination.city}, ${destination.state ? `${destination.state}, ` : ''}${destination.country}`}
        price={destination.averageCostPerDay || 50}
        maxGuests={16}
      />

      <BookingConfirmationModal
        isOpen={Boolean(confirmedBooking)}
        onClose={() => setConfirmedBooking(null)}
        booking={confirmedBooking}
        emailInfo={emailConfirmationInfo}
        itemTitle={`${destination.name} Bespoke Tour`}
        itemLocation={`${destination.city}, ${destination.country}`}
        onViewBookings={() => navigate('/tourist/bookings')}
      />
    </div>
  );
};

const styles = {
  conditionsPanel: { padding: '1.25rem 1.5rem', marginBottom: '2rem', background: 'rgba(31, 14, 34, 0.82)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '6px' },
  conditionsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' },
  conditionsMeta: { color: '#bda3c4', fontSize: '0.78rem', marginTop: '-0.6rem' },
  conditionsRefresh: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.7rem', fontSize: '0.8rem' },
  conditionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.85rem' },
  conditionCard: { display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.85rem', background: 'rgba(15, 7, 18, 0.55)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '6px', color: '#f7e7be' },
  placeFacts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginTop: '1.25rem',
    padding: '1.1rem',
    background: 'rgba(31, 14, 34, 0.55)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '6px'
  },
  factHeading: { fontSize: '0.9rem', fontWeight: 700, color: '#d4af37', marginBottom: '0.25rem' },
  attractionWhy: { fontSize: '0.82rem', color: '#f7e7be', marginTop: '0.45rem', lineHeight: '1.45' },
  bookingBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
    padding: '1.25rem 1.5rem',
    marginBottom: '2rem',
    background: 'rgba(31, 14, 34, 0.82)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    borderRadius: '6px'
  },
  bookingCopy: { color: '#ebdceb', marginTop: '0.3rem' },
  bookButton: { display: 'inline-flex', alignItems: 'center', gap: '0.45rem' },
  heroWrapper: {
    position: 'relative',
    height: '380px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '2.5rem',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    boxShadow: '0 10px 35px rgba(0, 0, 0, 0.8)'
  },
  heroImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '2.5rem',
    background: 'linear-gradient(0deg, rgba(18, 7, 21, 0.95) 0%, rgba(18, 7, 21, 0.6) 60%, transparent 100%)',
    color: '#fff'
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.6rem'
  },
  heroRatingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'rgba(31, 14, 34, 0.85)',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    padding: '0.25rem 0.65rem',
    borderRadius: '4px',
    fontSize: '0.78rem',
    color: '#f7e7be',
    fontWeight: '700'
  },
  heroTitle: {
    fontSize: '2.6rem',
    fontWeight: 800,
    fontFamily: 'var(--font-serif)',
    color: '#f7e7be',
    lineHeight: '1.15',
    textShadow: '0 2px 10px rgba(0,0,0,0.7)'
  },
  heroSub: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '1rem',
    color: '#e2d5e6',
    marginTop: '0.5rem',
    fontWeight: '500'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2.25rem'
  },
  sectionHeading: {
    fontSize: '1.4rem',
    fontWeight: 700,
    fontFamily: 'var(--font-serif)',
    color: '#f7e7be',
    marginTop: '0.25rem',
    marginBottom: '1rem'
  },
  descText: {
    color: '#ebdceb',
    lineHeight: '1.8',
    fontSize: '0.98rem'
  },
  metaBoxGroup: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '1.75rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.25)',
    flexWrap: 'wrap'
  },
  metaBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
    background: 'rgba(31, 14, 34, 0.7)',
    padding: '0.9rem 1.4rem',
    borderRadius: '6px',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    flex: 1,
    minWidth: '220px'
  },
  metaLabel: {
    fontSize: '0.68rem',
    letterSpacing: '1px',
    color: '#d4af37',
    display: 'block',
    fontWeight: '700'
  },
  metaVal: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#f7e7be',
    marginTop: '2px'
  },
  attractionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    background: 'rgba(31, 14, 34, 0.75)',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    transition: 'all 0.2s ease'
  },
  attractionImgWrap: {
    position: 'relative',
    width: '110px',
    height: '80px',
    borderRadius: '4px',
    overflow: 'hidden',
    flexShrink: 0,
    border: '1px solid rgba(212, 175, 55, 0.3)'
  },
  attractionImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  attractionNumber: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f7e7be 0%, #d4af37 100%)',
    color: '#150917',
    fontWeight: '800',
    fontSize: '0.72rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  attractionBody: {
    flex: 1
  },
  attractionName: {
    fontSize: '1.05rem',
    fontWeight: 700,
    fontFamily: 'var(--font-serif)',
    color: '#f7e7be'
  },
  attractionDesc: {
    fontSize: '0.85rem',
    color: '#bda3c4',
    marginTop: '4px',
    lineHeight: '1.5'
  },
  reviewForm: {
    background: 'rgba(31, 14, 34, 0.75)',
    padding: '1.25rem',
    borderRadius: '6px',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  ratingSelect: {
    padding: '0.45rem 0.8rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    background: '#150917',
    color: '#f7e7be',
    fontSize: '0.85rem',
    outline: 'none'
  },
  reviewInput: {
    flex: 1,
    padding: '0.7rem 1rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    background: '#150917',
    color: '#f8fafc',
    fontSize: '0.88rem',
    outline: 'none',
    minWidth: '220px'
  },
  loginPrompt: {
    background: 'rgba(31, 14, 34, 0.6)',
    padding: '1.25rem',
    borderRadius: '6px',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  reviewCard: {
    padding: '1rem 1.25rem',
    borderRadius: '6px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    background: 'rgba(31, 14, 34, 0.6)'
  },
  sideCard: {
    display: 'block',
    padding: '1rem',
    borderRadius: '6px',
    background: 'rgba(31, 14, 34, 0.8)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    textDecoration: 'none',
    transition: 'all 0.2s ease'
  },
  miniTag: {
    display: 'inline-block',
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#f7e7be',
    background: 'rgba(212, 175, 55, 0.2)',
    padding: '0.15rem 0.5rem',
    borderRadius: '3px',
    marginTop: '4px'
  },
  viewMoreLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#d4af37',
    fontWeight: '700',
    fontSize: '0.85rem',
    marginTop: '1.25rem',
    textDecoration: 'none'
  }
};

export default DestinationDetails;
