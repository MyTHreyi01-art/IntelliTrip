import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { hotelService } from '../../services/hotelService';
import { reviewService } from '../../services/reviewService';
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
  Building,
  Calendar,
  Users,
  Crown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Coffee,
  Wifi,
  Car,
  Tv,
  Utensils
} from 'lucide-react';

const FALLBACK_HOTEL_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

const CURATED_FACILITIES = [
  { icon: '🏊‍♂️', name: 'Infinity Pool & Cabanas', desc: 'Temperature-controlled rooftop pool with panoramic skyline views.' },
  { icon: '💆', name: 'Royal Ayurvedic Spa', desc: 'Holistic wellness treatments, herbal steam, and aroma hydrotherapy.' },
  { icon: '🍽️', name: 'Michelin-Inspired Dining', desc: 'Three signature restaurants and a 24-hour private royal room dining service.' },
  { icon: '🚗', name: 'Valet & Chauffeur Limousine', desc: 'Complimentary valet parking and airport private limousine transfers.' },
  { icon: '📶', name: 'High-Speed Fiber WiFi', desc: 'Ultra-fast encrypted connectivity throughout all suites and gardens.' },
  { icon: '🏋️', name: '24/7 Wellness Fitness Studio', desc: 'State-of-the-art TechnoGym equipment and personal yoga trainers.' },
  { icon: '🍸', name: 'Saffron Lounge & Bar', desc: 'Artisanal cocktails, vintage wines, and live classical evening music.' },
  { icon: '🛎️', name: '24/7 Dedicated Butler Concierge', desc: 'Personalized itinerary planning, garment care, and bespoke arrangements.' }
];

const HotelDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [emailConfirmationInfo, setEmailConfirmationInfo] = useState(null);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const [hotelRes, reviewsRes] = await Promise.allSettled([
        hotelService.getHotelById(id),
        reviewService.getReviewsByTarget(id)
      ]);

      if (hotelRes.status === 'fulfilled') {
        setHotel(hotelRes.value.data);
      } else {
        throw new Error('Could not load hotel profile');
      }

      if (reviewsRes.status === 'fulfilled') {
        setReviews(reviewsRes.value.data || []);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load hotel profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowSignUpPrompt(true);
      return;
    }
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        targetType: 'Hotel',
        targetId: id,
        rating: Number(rating),
        comment: comment.trim()
      });
      showNotification('Review submitted successfully! Thank you for sharing your experience.', 'success');
      setComment('');
      // Refresh reviews
      const updated = await reviewService.getReviewsByTarget(id);
      setReviews(updated.data || []);
    } catch (err) {
      showNotification(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOpenBooking = (room = null) => {
    if (!user) {
      setShowSignUpPrompt(true);
      return;
    }
    setBookingRoom(room);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (bookingData, emailInfo) => {
    setConfirmedBooking(bookingData);
    setEmailConfirmationInfo(emailInfo);
  };

  if (loading) return <Loader fullScreen message="Fetching bespoke hotel inventory..." />;
  if (!hotel) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: '#f7e7be', fontFamily: 'var(--font-serif)' }}>Hotel Not Found</h2>
        <Link to="/hotels" className="btn btn-gold" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          Back to Luxury Stays
        </Link>
      </div>
    );
  }

  const hotelImg = (hotel.images && hotel.images.length > 0 && hotel.images[0]) ? hotel.images[0] : FALLBACK_HOTEL_IMG;
  const startingRateInr = Number(hotel.startingPrice || 0);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', minHeight: '90vh' }}>
      <BackButton to="/hotels" />

      {/* Hotel Title & Overview Header */}
      <div style={styles.header}>
        <div>
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Crown size={13} /> {hotel.city} Heritage Destination Stay
          </span>
          <h1 style={styles.hotelTitle}>{hotel.name}</h1>
          <p style={styles.hotelAddress}>
            <MapPin size={16} color="#d4af37" /> {hotel.address}, {hotel.city}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={styles.ratingBox}>
            <Star size={18} fill="#d4af37" color="#d4af37" />
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f7e7be' }}>{Number(hotel.rating || 4.9).toFixed(1)}</span>
            <span style={{ fontSize: '0.75rem', color: '#bda3c4' }}>({reviews.length} reviews)</span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenBooking(null)}
            className="btn btn-gold"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontWeight: '800' }}
          >
            <Calendar size={16} style={{ marginRight: 6 }} /> Reserve Your Stay
          </button>
        </div>
      </div>

      {/* Hero Image with Gold Frame */}
      <div style={styles.imgBox} className="gold-frame">
        <img
          src={hotelImg}
          alt={hotel.name}
          style={styles.img}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_HOTEL_IMG;
          }}
        />
        <div style={styles.heroOverlay}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-gold">✦ 5-Star VIP Certified Retreat</span>
              <p style={{ color: '#ebdceb', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                Check-in: <strong>02:00 PM</strong> · Check-out: <strong>12:00 PM</strong> · 24/7 VIP Concierge
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#f7e7be', textTransform: 'uppercase', letterSpacing: '1px' }}>Starting From</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-serif)' }}>
                ₹{startingRateInr.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', color: '#bda3c4' }}>/ night</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Details Grid */}
      <div style={styles.grid}>
        {/* Left Column: Property Details, Facilities, Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Details About Stay */}
          <div className="luxury-card" style={{ padding: '2rem' }}>
            <h2 style={styles.sectionTitle}>Details About Your Stay</h2>
            <p style={styles.descText}>{hotel.description}</p>

            <div style={styles.stayPolicyGrid}>
              <div style={styles.policyCard}>
                <Clock size={18} color="#d4af37" />
                <div>
                  <strong>Check-in &amp; Check-out</strong>
                  <p>Check-in from 2:00 PM. Express contactless check-out until 12:00 PM.</p>
                </div>
              </div>

              <div style={styles.policyCard}>
                <ShieldCheck size={18} color="#d4af37" />
                <div>
                  <strong>Cancellation &amp; Refunds</strong>
                  <p>Complimentary cancellation up to 48 hours prior to arrival date.</p>
                </div>
              </div>

              <div style={styles.policyCard}>
                <Crown size={18} color="#d4af37" />
                <div>
                  <strong>VIP Privileges</strong>
                  <p>Welcome champagne, fresh fruit basket, and complimentary valet parking included.</p>
                </div>
              </div>

              <div style={styles.policyCard}>
                <Building size={18} color="#d4af37" />
                <div>
                  <strong>Architecture &amp; Atmosphere</strong>
                  <p>Palatial Rajasthani and colonial architecture with lush manicured courtyard gardens.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comprehensive Facilities Section */}
          <div className="luxury-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-gold">✦ World-Class Hospitality</span>
                <h2 style={styles.sectionTitle}>Signature Facilities &amp; Amenities</h2>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#bda3c4' }}>Included with all suite reservations</span>
            </div>

            <div style={styles.facilitiesGrid}>
              {CURATED_FACILITIES.map((facility, index) => (
                <div key={index} style={styles.facilityItem}>
                  <div style={styles.facilityIcon}>{facility.icon}</div>
                  <div>
                    <h4 style={styles.facilityTitle}>{facility.name}</h4>
                    <p style={styles.facilityDesc}>{facility.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom hotel tags */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <span style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: 700, letterSpacing: '0.5px' }}>ADDITIONAL AMENITIES:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {hotel.amenities.map((am, i) => (
                    <span key={i} style={styles.amenityBadge}>
                      ✦ {am}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Available Rooms & Suites */}
          <div className="luxury-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-gold">✦ Bespoke Accommodations</span>
                <h2 style={styles.sectionTitle}>Available Suites &amp; Royal Chambers</h2>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#bda3c4' }}>All rates in Indian Rupees (₹)</span>
            </div>

            {hotel.rooms && hotel.rooms.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {hotel.rooms.map((room) => {
                  const roomPriceInr = Number(room.pricePerNight || hotel.startingPrice || 0);
                  return (
                    <div key={room._id} style={styles.roomCard}>
                      <div style={{ flex: 1 }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>{room.roomType || 'Palace Suite'}</span>
                        <h4 style={styles.roomTitle}>{room.title || room.roomType}</h4>
                        <p style={styles.roomDesc}>{room.description || 'Elegantly furnished luxury suite with bespoke royal decor, en-suite marble bath, and panoramic vistas.'}</p>

                        <div style={styles.roomMetaRow}>
                          <span>✦ Capacity: up to {room.capacity || 2} Guests</span>
                          <span>✦ Available Suites: {room.availableRooms || 3}</span>
                          <span>✦ King Bed &amp; Balcony</span>
                        </div>
                      </div>

                      <div style={styles.roomActionCol}>
                        <div style={styles.roomPrice}>
                          ₹{roomPriceInr.toLocaleString('en-IN')}
                          <span style={styles.roomPriceSuffix}> / night</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenBooking(room)}
                          className="btn btn-gold"
                          style={{ padding: '0.65rem 1.4rem', fontSize: '0.85rem', fontWeight: '800' }}
                        >
                          Reserve Suite
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <Crown size={32} color="#d4af37" style={{ margin: '0 auto 0.75rem auto' }} />
                <p style={{ color: '#ebdceb', fontSize: '0.92rem' }}>
                  Standard luxury suites are available starting at ₹{startingRateInr.toLocaleString('en-IN')} / night.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenBooking(null)}
                  className="btn btn-gold"
                  style={{ marginTop: '1rem', padding: '0.65rem 1.5rem' }}
                >
                  Reserve Your Stay
                </button>
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="luxury-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-gold">✦ Guest Experiences</span>
                <h2 style={styles.sectionTitle}>Customer Reviews &amp; Testimonials</h2>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>{reviews.length} Verified Reviews</span>
            </div>

            {/* Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f7e7be' }}>YOUR RATING:</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    style={styles.ratingSelect}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3 - Pleasant)</option>
                    <option value={2}>⭐⭐ (2 - Needs Improvement)</option>
                    <option value={1}>⭐ (1 - Unsatisfactory)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience staying at this luxury property..."
                    style={styles.reviewInput}
                  />
                  <button type="submit" disabled={submittingReview} className="btn btn-gold" style={{ padding: '0.65rem 1.4rem' }}>
                    <Send size={15} style={{ marginRight: 4 }} /> {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.loginPrompt}>
                <p style={{ color: '#e2d5e6', fontSize: '0.9rem', margin: 0 }}>Log in to submit a verified customer review for {hotel.name}.</p>
                <Link to="/login" className="btn btn-gold" style={{ padding: '0.45rem 1.2rem', fontSize: '0.82rem' }}>
                  Sign In
                </Link>
              </div>
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#bda3c4', fontStyle: 'italic' }}>
                  No customer reviews yet. Be the first distinguished guest to share your review!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} style={styles.reviewCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f7e7be' }}>
                        {rev.user?.name || 'Verified Luxury Traveler'}
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

        {/* Right Column: Sticky Quick Reservation Summary */}
        <div>
          <div className="luxury-card" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: '#f7e7be', marginBottom: '0.5rem' }}>
              Reserve Your Stay
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#bda3c4', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Book directly to enjoy best rate guarantee, complimentary breakfast, and concierge airport transfer.
            </p>

            <div style={{ padding: '1rem', background: 'rgba(21, 9, 23, 0.75)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '6px', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#d4af37', fontWeight: 700, letterSpacing: '0.5px' }}>STARTING RATE</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-serif)', marginTop: '2px' }}>
                ₹{startingRateInr.toLocaleString('en-IN')} <span style={{ fontSize: '0.78rem', color: '#bda3c4' }}>/ night</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#ebdceb', marginTop: '0.35rem' }}>
                ✦ Includes all taxes, WiFi, and royal morning breakfast.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#e2d5e6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={14} color="#10b981" /> Free cancellation up to 48 hrs
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={14} color="#10b981" /> Instant email confirmation to your account
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={14} color="#10b981" /> Pay on arrival or online voucher
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenBooking(null)}
              className="btn btn-gold"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.92rem', fontWeight: '800' }}
            >
              Reserve Your Stay
            </button>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setBookingRoom(null);
        }}
        onSuccess={handleBookingSuccess}
        item={hotel}
        roomId={bookingRoom?._id || null}
        roomTitle={bookingRoom?.title || bookingRoom?.roomType || 'Bespoke Luxury Suite'}
        itemType="Hotel"
        title={`Reserve Stay: ${hotel.name}`}
        subtitle={`${hotel.address}, ${hotel.city}`}
        price={bookingRoom ? Number(bookingRoom.pricePerNight || startingRateInr) : startingRateInr}
        maxGuests={bookingRoom?.capacity || 4}
      />

      {/* Booking Confirmation Pop-up Message */}
      <BookingConfirmationModal
        isOpen={Boolean(confirmedBooking)}
        onClose={() => setConfirmedBooking(null)}
        booking={confirmedBooking}
        emailInfo={emailConfirmationInfo}
        itemTitle={`${hotel.name}${bookingRoom ? ` (${bookingRoom.title || bookingRoom.roomType})` : ''}`}
        itemLocation={`${hotel.address}, ${hotel.city}`}
        onViewBookings={() => navigate('/tourist/bookings')}
      />

      <SignUpPrompt
        open={showSignUpPrompt}
        onClose={() => setShowSignUpPrompt(false)}
        returnTo={`${location.pathname}${location.search}`}
        title="Sign up to reserve this suite"
        message="Create a free account to choose your dates and reserve this stay. Confirmation will be sent to your registered email."
      />
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1.5rem'
  },
  hotelTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    fontFamily: 'var(--font-serif)',
    color: '#f7e7be',
    lineHeight: '1.2',
    margin: '0.35rem 0'
  },
  hotelAddress: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#e2d5e6',
    fontSize: '0.95rem'
  },
  ratingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(31, 14, 34, 0.85)',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    padding: '0.5rem 1rem',
    borderRadius: '6px'
  },
  imgBox: {
    position: 'relative',
    height: '420px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '2.5rem',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    boxShadow: '0 10px 35px rgba(0, 0, 0, 0.8)'
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '2rem',
    background: 'linear-gradient(0deg, rgba(18, 7, 21, 0.95) 0%, rgba(18, 7, 21, 0.6) 60%, transparent 100%)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2.25rem'
  },
  sectionTitle: {
    fontSize: '1.35rem',
    fontWeight: 800,
    fontFamily: 'var(--font-serif)',
    color: '#f7e7be',
    marginTop: '0.2rem',
    marginBottom: '1rem'
  },
  descText: {
    color: '#ebdceb',
    fontSize: '0.95rem',
    lineHeight: '1.75'
  },
  stayPolicyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
    marginTop: '1.5rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.2)'
  },
  policyCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.85rem 1rem',
    background: 'rgba(21, 9, 23, 0.6)',
    borderRadius: '6px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    fontSize: '0.82rem',
    color: '#ebdceb',
    lineHeight: '1.45'
  },
  facilitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginTop: '0.5rem'
  },
  facilityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.85rem',
    background: 'rgba(21, 9, 23, 0.65)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '6px'
  },
  facilityIcon: {
    fontSize: '1.4rem',
    lineHeight: 1
  },
  facilityTitle: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#f7e7be',
    margin: '0 0 0.2rem 0'
  },
  facilityDesc: {
    fontSize: '0.78rem',
    color: '#bda3c4',
    margin: 0,
    lineHeight: '1.4'
  },
  amenityBadge: {
    fontSize: '0.75rem',
    color: '#f7e7be',
    background: 'rgba(212, 175, 55, 0.15)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    padding: '0.25rem 0.65rem',
    borderRadius: '4px',
    fontWeight: 600
  },
  roomCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.25rem',
    background: 'rgba(21, 9, 23, 0.75)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '6px',
    flexWrap: 'wrap'
  },
  roomTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    margin: '0.3rem 0'
  },
  roomDesc: {
    fontSize: '0.85rem',
    color: '#bda3c4',
    lineHeight: '1.5',
    margin: 0
  },
  roomMetaRow: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.78rem',
    color: '#d4af37',
    marginTop: '0.5rem',
    flexWrap: 'wrap',
    fontWeight: 600
  },
  roomActionCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
    minWidth: '150px'
  },
  roomPrice: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#10b981',
    fontFamily: 'var(--font-serif)'
  },
  roomPriceSuffix: {
    fontSize: '0.75rem',
    color: '#bda3c4',
    fontWeight: 400
  },
  reviewForm: {
    background: 'rgba(21, 9, 23, 0.7)',
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
    background: 'rgba(21, 9, 23, 0.6)',
    padding: '1.25rem',
    borderRadius: '6px',
    border: '1px solid rgba(212, 175, 55, 0.25)',
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
    background: 'rgba(21, 9, 23, 0.6)'
  }
};

export default HotelDetails;
