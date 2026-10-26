import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { transportService } from '../../services/transportService';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import SignUpPrompt from '../../components/common/SignUpPrompt';
import BackButton from '../../components/common/BackButton';
import BookingDetailsModal from '../../components/booking/BookingDetailsModal';
import BookingConfirmationModal from '../../components/booking/BookingConfirmationModal';
import {
  Car,
  Bike,
  Bus,
  Shield,
  Calendar,
  Users,
  Star,
  Crown,
  CheckCircle2,
  Sparkles,
  Clock,
  MapPin,
  X,
  Send,
  Phone,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  getVehicleSpecs,
  getVehicleFeatures,
  getDurationPricing,
  getInitialTransportReviews
} from './transportDataHelper';

const TYPES = ['All', 'Car Rental', 'Taxi', 'Bike Rental', 'Private Shuttle', 'Bus'];

const Transport = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  // Selected Vehicle for Rich Details Modal
  const [viewingItem, setViewingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'features' | 'pricing' | 'reviews'

  // Booking Modal States
  const [bookingItem, setBookingItem] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [emailConfirmationInfo, setEmailConfirmationInfo] = useState(null);

  // Reviews for Selected Vehicle
  const [vehicleReviews, setVehicleReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchTransports();
  }, [selectedType]);

  // When viewing a vehicle, load real reviews
  useEffect(() => {
    if (viewingItem) {
      loadVehicleReviews(viewingItem._id);
      setActiveTab('overview');
    } else {
      setVehicleReviews([]);
    }
  }, [viewingItem]);

  const fetchTransports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType !== 'All') params.type = selectedType;
      const cityQuery = new URLSearchParams(location.search).get('city');
      if (cityQuery) params.city = cityQuery;

      const res = await transportService.getTransports(params);
      const list = res.data || [];
      setTransports(list);

      const openTransportId = new URLSearchParams(location.search).get('open');
      if (openTransportId) {
        const match = list.find((t) => t._id === openTransportId);
        if (match) setViewingItem(match);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load transport fleet', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleReviews = async (targetId) => {
    setLoadingReviews(true);
    try {
      const res = await reviewService.getReviewsByTarget(targetId);
      const fetched = res.data || [];
      if (fetched.length > 0) {
        setVehicleReviews(fetched);
      } else {
        setVehicleReviews(getInitialTransportReviews(viewingItem));
      }
    } catch {
      setVehicleReviews(getInitialTransportReviews(viewingItem));
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowSignUpPrompt(true);
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        targetType: 'Transport',
        targetId: viewingItem._id,
        rating: Number(newRating),
        comment: newComment.trim()
      });
      showNotification('Review submitted! Thank you for reviewing our fleet.', 'success');
      setNewComment('');
      loadVehicleReviews(viewingItem._id);
    } catch (err) {
      showNotification(err.message || 'Failed to submit fleet review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOpenBooking = (item) => {
    if (!user) {
      setShowSignUpPrompt(true);
      return;
    }
    setBookingItem(item);
  };

  const handleBookingSuccess = (bookingData, emailInfo) => {
    setConfirmedBooking(bookingData);
    setEmailConfirmationInfo(emailInfo);
  };

  // Calculations for current vehicle
  const pricePerDayInr = viewingItem ? Number(viewingItem.pricePerDay || 0) : 0;

  const vehicleSpecs = viewingItem ? getVehicleSpecs(viewingItem) : [];
  const vehicleFeatures = viewingItem ? getVehicleFeatures(viewingItem) : [];
  const durationPricing = viewingItem ? getDurationPricing(pricePerDayInr) : [];

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '80vh' }}>
      <BackButton />

      {/* Header Banner */}
      <div style={styles.banner}>
        <div>
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Car size={14} /> Private Aviation, Chauffeur & Fleet
          </span>
          <h1 style={styles.mainTitle}>Chauffeured Luxury & Private Transit</h1>
          <p style={styles.subTitle}>
            Mercedes-Benz S-Class, vintage Rolls-Royce charters, Royal Enfield Himalayan cruisers, and high-speed island speedboats. All prices strictly in Indian Rupees (₹).
          </p>
        </div>

        {/* Fleet Category Switcher */}
        <div style={styles.typeSwitcher}>
          {TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                ...styles.typeBtn,
                ...(selectedType === type ? styles.typeBtnActive : {})
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader text="Loading luxury transport fleet..." />
      ) : transports.length === 0 ? (
        <div style={styles.empty}>
          <p>No vehicles found for the selected category.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {transports.map((item) => {
            const cardPriceInr = Number(item.pricePerDay || 0);

            return (
              <div key={item._id} className="luxury-card" style={styles.card}>
                <button
                  type="button"
                  onClick={() => setViewingItem(item)}
                  style={styles.imgButton}
                  aria-label={`View details of ${item.title}`}
                >
                  <img
                    src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
                    alt={item.title}
                    style={styles.img}
                  />
                  <span style={styles.typeBadge}>{item.type}</span>
                  <span style={styles.viewBadge}>✦ Click for Features & Pricing</span>
                </button>

                <div style={styles.cardBody}>
                  <div style={styles.metaRow}>
                    <span style={styles.cityText}>{item.city}</span>
                    <div style={styles.ratingBadge}>
                      <Star size={13} fill="#d4af37" color="#d4af37" />
                      <span>{Number(item.rating || 4.9).toFixed(1)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingItem(item)}
                    style={styles.titleButton}
                  >
                    <h3 style={styles.title}>{item.title}</h3>
                  </button>
                  <p style={styles.model}>{item.vehicleModel}</p>

                  <div style={styles.capacityRow}>
                    <Users size={13} color="#d4af37" />
                    <span>Up to {item.capacity} Guests · Chauffeur Included</span>
                  </div>

                  <div style={styles.featuresList}>
                    {item.features && item.features.slice(0, 3).map((feat, idx) => (
                      <span key={idx} style={styles.featPill}>
                        ✦ {feat}
                      </span>
                    ))}
                  </div>

                  <div style={styles.cardFooter}>
                    <div>
                      <span style={styles.pricePrefix}>Daily Charter Rate</span>
                      <div style={styles.price}>₹{cardPriceInr.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#bda3c4', fontWeight: 'normal' }}>/ day</span></div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setViewingItem(item)}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(item)}
                        className="btn btn-gold"
                        style={{ padding: '0.45rem 1.15rem', fontSize: '0.8rem' }}
                      >
                        Reserve Fleet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RICH VEHICLE DETAILS MODAL */}
      {viewingItem && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewingItem(null);
          }}
        >
          <div role="dialog" aria-modal="true" style={styles.richModal} className="luxury-card">
            {/* Top Bar */}
            <div style={styles.modalTopBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                  {viewingItem.type} · {viewingItem.city} Hub
                </span>
                <span style={styles.verifiedHeaderBadge}>
                  <ShieldCheck size={13} color="#d4af37" /> 100% Insured Fleet
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                style={styles.closeBtn}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Hero Image Banner */}
            <div style={styles.modalHero}>
              <img
                src={viewingItem.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'}
                alt={viewingItem.title}
                style={styles.modalHeroImg}
              />
              <div style={styles.modalHeroOverlay}>
                <h2 style={styles.modalHeroTitle}>{viewingItem.title}</h2>
                <div style={styles.modalHeroMeta}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#d4af37' }}>
                    <Star size={15} fill="#d4af37" color="#d4af37" />
                    <span style={{ fontWeight: 700 }}>{Number(viewingItem.rating || 4.9).toFixed(1)}</span>
                    <span style={{ color: '#e2d5e6', fontSize: '0.85rem' }}>({vehicleReviews.length} Verified Reviews)</span>
                  </div>
                  <span style={{ color: '#d4af37' }}>•</span>
                  <span style={{ color: '#f7e7be', fontWeight: 600 }}>
                    ₹{pricePerDayInr.toLocaleString()} / day
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabBar}>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                style={{ ...styles.tabBtn, ...(activeTab === 'overview' ? styles.tabBtnActive : {}) }}
              >
                🚘 Overview & Specs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('features')}
                style={{ ...styles.tabBtn, ...(activeTab === 'features' ? styles.tabBtnActive : {}) }}
              >
                ✨ Vehicle Features
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                style={{ ...styles.tabBtn, ...(activeTab === 'pricing' ? styles.tabBtnActive : {}) }}
              >
                ⏱️ Duration Pricing (₹)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                style={{ ...styles.tabBtn, ...(activeTab === 'reviews' ? styles.tabBtnActive : {}) }}
              >
                ⭐ Guest Reviews ({vehicleReviews.length})
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div style={styles.tabContent}>
              {/* TAB 1: OVERVIEW & SPECS */}
              {activeTab === 'overview' && (
                <div>
                  <h3 style={styles.sectionHeading}>About This Vehicle</h3>
                  <p style={styles.bodyCopy}>
                    The {viewingItem.title} ({viewingItem.vehicleModel}) represents pinnacle luxury travel in {viewingItem.city}. Crafted with ergonomic acoustic privacy, smooth all-terrain performance, and white-glove chauffeur assistance, this fleet charter ensures uncompromised comfort on both short urban hops and long intercity journeys.
                  </p>

                  <h4 style={{ ...styles.subHeading, marginTop: '1.5rem' }}>Technical & Cabin Specifications</h4>
                  <div style={styles.specsGrid}>
                    {vehicleSpecs.map((spec, sIdx) => (
                      <div key={sIdx} style={styles.specBox}>
                        <div style={styles.specLabel}>{spec.label}</div>
                        <div style={styles.specVal}>{spec.value}</div>
                      </div>
                    ))}
                  </div>

                  <h4 style={{ ...styles.subHeading, marginTop: '1.5rem' }}>Concierge Chauffeur Inclusions</h4>
                  <div style={styles.inclusionsCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d4af37', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <CheckCircle2 size={16} /> Certified White-Glove Chauffeur Included
                    </div>
                    <p style={{ color: '#bda3c4', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                      Every charter comes accompanied by a vetted, background-verified chauffeur in formal uniform, proficient in English and local languages. Includes complimentary airport meet-and-greet, luggage handling, and flexible on-demand wait times.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: LUXURY FEATURES OF THAT VEHICLE */}
              {activeTab === 'features' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={styles.sectionHeading}>Features of {viewingItem.title}</h3>
                      <p style={{ color: '#bda3c4', fontSize: '0.82rem' }}>
                        Curated executive amenities and in-cabin luxury standards.
                      </p>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                      VIP Fleet Standard
                    </span>
                  </div>

                  <div style={styles.featuresGrid}>
                    {vehicleFeatures.map((feat, fIdx) => (
                      <div key={fIdx} style={styles.featureItemCard}>
                        <div style={styles.featureIcon}>{feat.icon}</div>
                        <div>
                          <div style={styles.featureTitle}>{feat.title}</div>
                          <div style={styles.featureDesc}>{feat.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {viewingItem.features && viewingItem.features.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 style={styles.subHeading}>Additional Model-Specific Perks</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {viewingItem.features.map((f, i) => (
                          <span key={i} style={styles.customPill}>
                            ✦ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DURATION PRICING IN RUPEES */}
              {activeTab === 'pricing' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={styles.sectionHeading}>Transparent Duration Pricing</h3>
                      <p style={{ color: '#bda3c4', fontSize: '0.82rem' }}>
                        All pricing is strictly in Indian Rupees (₹) with fuel, chauffeur, and toll permits included.
                      </p>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                      Currency: INR (₹)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {durationPricing.map((pkg, pIdx) => (
                      <div
                        key={pIdx}
                        style={{
                          ...styles.pricingCard,
                          ...(pkg.popular ? styles.pricingCardPopular : {})
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={pkg.popular ? styles.popularBadge : styles.normalBadge}>
                              {pkg.badge}
                            </span>
                            <h4 style={styles.pkgTitle}>{pkg.durationTitle}</h4>
                            <span style={styles.pkgSubtitle}>{pkg.durationSubtitle}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={styles.pkgPrice}>₹{pkg.priceInr.toLocaleString()}</div>
                            <span style={{ fontSize: '0.72rem', color: '#bda3c4' }}>All-inclusive rate</span>
                          </div>
                        </div>

                        <div style={styles.pkgDetailsList}>
                          {pkg.details.map((detail, dIdx) => (
                            <div key={dIdx} style={styles.pkgDetailItem}>
                              <CheckCircle2 size={13} color="#d4af37" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={styles.pricingNoteBox}>
                    <Info size={16} color="#d4af37" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '0.78rem', color: '#bda3c4', margin: 0 }}>
                      <strong style={{ color: '#f7e7be' }}>No Hidden Surcharges:</strong> In-city tolls, airport entry, and passenger transit insurance are included. Fuel costs are covered within the designated KM limit. Overtime hours are billed at a flat rate in Rupees (₹) upon trip completion.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: REVIEWS & REVIEW SUBMISSION */}
              {activeTab === 'reviews' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={styles.sectionHeading}>Verified Fleet Testimonials</h3>
                      <p style={{ color: '#bda3c4', fontSize: '0.82rem' }}>
                        Ratings and authentic experiences from past chartered passengers.
                      </p>
                    </div>
                    <div style={styles.overallRatingBadge}>
                      <Star size={18} fill="#d4af37" color="#d4af37" />
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f7e7be' }}>
                        {Number(viewingItem.rating || 4.9).toFixed(1)}
                      </span>
                      <span style={{ color: '#8e9aaf', fontSize: '0.75rem' }}>/ 5.0</span>
                    </div>
                  </div>

                  {/* Review Submission Form */}
                  <form onSubmit={handleReviewSubmit} style={styles.reviewFormBox}>
                    <h4 style={{ color: '#f7e7be', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Share Your Fleet Journey Experience
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#bda3c4', fontSize: '0.8rem' }}>Your Rating:</span>
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setNewRating(starVal)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.15rem'
                          }}
                        >
                          <Star
                            size={18}
                            fill={starVal <= newRating ? '#d4af37' : 'none'}
                            color={starVal <= newRating ? '#d4af37' : '#52616e'}
                          />
                        </button>
                      ))}
                      <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.85rem', marginLeft: '0.3rem' }}>
                        {newRating} / 5
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Comment on vehicle condition, chauffeur punctuality, driving comfort, and cleanliness..."
                      style={styles.reviewTextarea}
                      required
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.6rem' }}>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="btn btn-gold"
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Send size={13} /> {submittingReview ? 'Submitting...' : 'Submit Fleet Review'}
                      </button>
                    </div>
                  </form>

                  {/* Reviews List */}
                  {loadingReviews ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#bda3c4' }}>
                      Loading verified reviews...
                    </div>
                  ) : vehicleReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#bda3c4' }}>
                      No reviews submitted yet. Be the first to share your experience with this vehicle!
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
                      {vehicleReviews.map((rev) => (
                        <div key={rev._id} style={styles.reviewCard}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={styles.reviewAvatar}>
                                {(rev.user?.name || 'T')[0].toUpperCase()}
                              </div>
                              <div>
                                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem' }}>
                                  {rev.user?.name || 'Verified Transit Passenger'}
                                </div>
                                <div style={{ color: '#d4af37', fontSize: '0.72rem' }}>
                                  ✦ {rev.user?.role || 'Verified Passenger'}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  fill={i < rev.rating ? '#d4af37' : 'none'}
                                  color={i < rev.rating ? '#d4af37' : '#52616e'}
                                />
                              ))}
                            </div>
                          </div>
                          <p style={{ color: '#c5cbd3', fontSize: '0.82rem', lineHeight: 1.45, margin: 0 }}>
                            {rev.comment}
                          </p>
                          <div style={{ color: '#6c757d', fontSize: '0.72rem', marginTop: '0.4rem' }}>
                            {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div style={styles.modalBottomBar}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#bda3c4' }}>Base Charter Rate:</span>
                <div style={{ fontSize: '1.1rem', color: '#f7e7be', fontWeight: 800 }}>
                  ₹{pricePerDayInr.toLocaleString()} <span style={{ fontSize: '0.78rem', color: '#bda3c4', fontWeight: 'normal' }}>/ day</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = viewingItem;
                    setViewingItem(null);
                    handleOpenBooking(item);
                  }}
                  className="btn btn-gold"
                  style={{ padding: '0.6rem 1.6rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Car size={15} /> Reserve Fleet Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS MODAL (Takes name, phone, email, start date, end date, guests, special requests) */}
      <BookingDetailsModal
        isOpen={Boolean(bookingItem)}
        onClose={() => setBookingItem(null)}
        onSuccess={handleBookingSuccess}
        item={bookingItem}
        itemType="Transport"
        title={bookingItem ? `Charter: ${bookingItem.title || bookingItem.vehicleModel}` : ''}
        subtitle={bookingItem ? `${bookingItem.type} • ${bookingItem.city}` : ''}
        price={pricePerDayInr}
        maxGuests={bookingItem?.capacity || 12}
      />

      {/* BOOKING CONFIRMATION POPUP MODAL (with registered email notification) */}
      <BookingConfirmationModal
        isOpen={Boolean(confirmedBooking)}
        onClose={() => setConfirmedBooking(null)}
        booking={confirmedBooking}
        emailInfo={emailConfirmationInfo}
        itemTitle={confirmedBooking?.itemRef?.title ? `Charter: ${confirmedBooking.itemRef.title}` : 'Private Transit Charter'}
        itemLocation={confirmedBooking?.itemRef?.city || 'Departure Hub'}
        onViewBookings={() => navigate('/tourist/bookings')}
      />

      {/* SIGN UP PROMPT FOR GUESTS */}
      <SignUpPrompt
        open={showSignUpPrompt}
        onClose={() => setShowSignUpPrompt(false)}
        returnTo={`${location.pathname}${location.search}`}
        title="Sign up to reserve transport"
        message="Create a free account to charter private vehicles and receive your journey confirmation vouchers directly to your registered email."
      />
    </div>
  );
};

const styles = {
  banner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '3rem'
  },
  mainTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: 'var(--color-gold-light)',
    marginTop: '0.5rem',
    marginBottom: '0.5rem'
  },
  subTitle: {
    fontSize: '1rem',
    color: '#bda3c4',
    maxWidth: '750px'
  },
  typeSwitcher: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap'
  },
  typeBtn: {
    padding: '0.5rem 1.25rem',
    borderRadius: '4px',
    background: 'rgba(31, 14, 34, 0.8)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    color: '#bda3c4',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  typeBtnActive: {
    background: 'var(--color-gold-gradient)',
    color: '#150917',
    fontWeight: '700',
    borderColor: '#f7e7be'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  imgButton: {
    position: 'relative',
    display: 'block',
    width: '100%',
    height: '210px',
    padding: 0,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left'
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  typeBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'var(--color-gold-gradient)',
    color: '#150917',
    fontSize: '0.72rem',
    fontWeight: '800',
    padding: '0.2rem 0.6rem',
    borderRadius: '2px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
  },
  viewBadge: {
    position: 'absolute',
    bottom: '10px',
    left: '12px',
    background: 'rgba(21, 9, 23, 0.85)',
    color: '#d4af37',
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '0.2rem 0.5rem',
    borderRadius: '3px',
    backdropFilter: 'blur(4px)'
  },
  cardBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.35rem'
  },
  cityText: {
    fontSize: '0.75rem',
    color: '#d4af37',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#d4af37',
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  titleButton: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    padding: 0,
    border: 0,
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer'
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    marginBottom: '0.2rem'
  },
  model: {
    fontSize: '0.82rem',
    color: '#bda3c4',
    marginBottom: '0.65rem'
  },
  capacityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.78rem',
    color: '#e2d5e6',
    marginBottom: '0.65rem'
  },
  featuresList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginBottom: '1rem'
  },
  featPill: {
    fontSize: '0.7rem',
    color: '#d4af37',
    background: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '0.15rem 0.45rem',
    borderRadius: '2px'
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '0.85rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)'
  },
  pricePrefix: {
    fontSize: '0.7rem',
    color: '#bda3c4',
    display: 'block'
  },
  price: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#d4af37'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
    color: '#bda3c4'
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(6px)'
  },
  richModal: {
    width: '100%',
    maxWidth: '820px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    background: '#150917',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  modalTopBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 1.25rem',
    background: 'rgba(25, 10, 28, 0.98)',
    borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
    flexShrink: 0
  },
  verifiedHeaderBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    color: '#d4af37',
    fontSize: '0.74rem',
    fontWeight: 600
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#bda3c4',
    cursor: 'pointer',
    padding: '0.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalHero: {
    position: 'relative',
    height: '140px',
    width: '100%',
    flexShrink: 0,
    overflow: 'hidden'
  },
  modalHeroImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  modalHeroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(21, 9, 23, 0.95) 0%, rgba(21, 9, 23, 0.5) 60%, rgba(21, 9, 23, 0.2) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '0.85rem 1.25rem'
  },
  modalHeroTitle: {
    fontSize: '1.45rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    marginBottom: '0.2rem'
  },
  modalHeroMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.84rem'
  },
  tabBar: {
    display: 'flex',
    alignItems: 'stretch',
    flexShrink: 0,
    minHeight: '50px',
    height: '50px',
    background: '#1d0c20',
    borderBottom: '2px solid rgba(212, 175, 55, 0.25)',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    padding: '0 0.5rem',
    boxSizing: 'border-box',
    zIndex: 10
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    padding: '0 1.25rem',
    height: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    color: '#bda3c4',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    lineHeight: '1',
    transition: 'all 0.2s ease'
  },
  tabBtnActive: {
    color: '#f7e7be',
    borderBottom: '3px solid #d4af37',
    background: 'rgba(212, 175, 55, 0.12)',
    fontWeight: 700
  },
  tabContent: {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
    minHeight: 0
  },
  sectionHeading: {
    fontSize: '1.25rem',
    fontFamily: 'var(--font-serif)',
    color: '#f7e7be',
    marginBottom: '0.35rem'
  },
  subHeading: {
    fontSize: '0.95rem',
    fontFamily: 'var(--font-serif)',
    color: '#d4af37',
    marginBottom: '0.75rem'
  },
  bodyCopy: {
    fontSize: '0.85rem',
    color: '#c5cbd3',
    lineHeight: 1.6,
    marginBottom: '0.75rem'
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  specBox: {
    background: 'rgba(31, 14, 34, 0.65)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '0.75rem 1rem',
    borderRadius: '4px'
  },
  specLabel: {
    fontSize: '0.68rem',
    color: '#8e9aaf',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  specVal: {
    fontSize: '0.84rem',
    color: '#f8fafc',
    fontWeight: 600,
    marginTop: '0.2rem'
  },
  inclusionsCard: {
    background: 'rgba(21, 9, 23, 0.75)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '0.5rem'
  },

  // Features Grid
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '0.85rem'
  },
  featureItemCard: {
    display: 'flex',
    gap: '0.75rem',
    background: 'rgba(31, 14, 34, 0.6)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '0.85rem',
    borderRadius: '4px'
  },
  featureIcon: {
    fontSize: '1.4rem',
    flexShrink: 0
  },
  featureTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '0.25rem'
  },
  featureDesc: {
    fontSize: '0.78rem',
    color: '#bda3c4',
    lineHeight: 1.4
  },
  customPill: {
    fontSize: '0.75rem',
    color: '#d4af37',
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    padding: '0.3rem 0.7rem',
    borderRadius: '3px'
  },

  // Pricing Matrix Styles
  pricingCard: {
    background: 'rgba(31, 14, 34, 0.6)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    padding: '1.15rem',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },
  pricingCardPopular: {
    background: 'linear-gradient(135deg, rgba(31, 14, 34, 0.95) 0%, rgba(68, 30, 75, 0.6) 100%)',
    border: '1px solid rgba(212, 175, 55, 0.6)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
  },
  popularBadge: {
    display: 'inline-block',
    background: 'var(--color-gold-gradient)',
    color: '#150917',
    fontSize: '0.7rem',
    fontWeight: 800,
    padding: '0.2rem 0.5rem',
    borderRadius: '2px',
    marginBottom: '0.4rem'
  },
  normalBadge: {
    display: 'inline-block',
    background: 'rgba(212, 175, 55, 0.15)',
    color: '#f7e7be',
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.2rem 0.5rem',
    borderRadius: '2px',
    marginBottom: '0.4rem'
  },
  pkgTitle: {
    fontSize: '1rem',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    margin: '0.1rem 0'
  },
  pkgSubtitle: {
    fontSize: '0.78rem',
    color: '#bda3c4'
  },
  pkgPrice: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#d4af37'
  },
  pkgDetailsList: {
    display: 'grid',
    gap: '0.4rem',
    marginTop: '0.75rem',
    paddingTop: '0.65rem',
    borderTop: '1px dashed rgba(212, 175, 55, 0.15)'
  },
  pkgDetailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.4rem',
    fontSize: '0.78rem',
    color: '#c5cbd3'
  },
  pricingNoteBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: 'rgba(21, 9, 23, 0.65)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '0.85rem 1rem',
    borderRadius: '4px',
    marginTop: '1.25rem'
  },

  // Reviews Styles
  overallRatingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px'
  },
  reviewFormBox: {
    background: 'rgba(31, 14, 34, 0.75)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.25rem'
  },
  reviewTextarea: {
    width: '100%',
    padding: '0.65rem',
    color: '#f8fafc',
    background: 'rgba(21, 9, 23, 0.85)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '4px',
    fontSize: '0.82rem',
    resize: 'vertical',
    outline: 'none'
  },
  reviewCard: {
    background: 'rgba(21, 9, 23, 0.7)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    padding: '0.85rem 1rem',
    borderRadius: '4px'
  },
  reviewAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--color-gold-gradient)',
    color: '#150917',
    fontWeight: 800,
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Modal Bottom Bar
  modalBottomBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1.25rem',
    background: '#1d0c20',
    borderTop: '1px solid rgba(212, 175, 55, 0.25)',
    flexWrap: 'wrap',
    gap: '0.75rem',
    flexShrink: 0,
    minHeight: '60px'
  }
};

export default Transport;
