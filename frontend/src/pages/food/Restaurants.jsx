import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { restaurantService } from '../../services/restaurantService';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import SignUpPrompt from '../../components/common/SignUpPrompt';
import BackButton from '../../components/common/BackButton';
import BookingDetailsModal from '../../components/booking/BookingDetailsModal';
import BookingConfirmationModal from '../../components/booking/BookingConfirmationModal';
import {
  Utensils,
  Star,
  MapPin,
  Search,
  Clock,
  Phone,
  Sparkles,
  Award,
  Heart,
  X,
  Send,
  Coffee,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import {
  getMostLovedDish,
  getCuratedMenu,
  getAmbianceDetails,
  getInitialReviews
} from './restaurantDataHelper';

// Helper to convert any price tier (legacy $ or modern ₹) into clean Indian price display
export const formatIndianPriceTier = (priceRange, avgPrice = null) => {
  if (!priceRange && !avgPrice) return '₹₹ (₹1,000–₹2,500 for two)';
  if (priceRange) {
    const p = String(priceRange).trim();
    if (p === '$') return '₹ (Under ₹1,000 for two)';
    if (p === '$$') return '₹₹ (₹1,000–₹2,500 for two)';
    if (p === '$$$') return '₹₹₹ (₹2,501–₹4,500 for two)';
    if (p === '$$$$') return '₹₹₹₹ (Over ₹4,500 for two)';
    if (p.includes('₹')) return p;
  }
  if (avgPrice) {
    const num = Number(avgPrice);
    if (num < 1000) return '₹ (Under ₹1,000 for two)';
    if (num <= 2500) return '₹₹ (₹1,000–₹2,500 for two)';
    if (num <= 4500) return '₹₹₹ (₹2,501–₹4,500 for two)';
    return '₹₹₹₹ (Over ₹4,500 for two)';
  }
  return '₹₹ (₹1,000–₹2,500 for two)';
};

const Restaurants = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  // Selected Restaurant for Rich Details Modal
  const [viewingRestaurant, setViewingRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'mostLoved' | 'menu' | 'reviews'

  // Booking Flow States
  const [bookingRestaurant, setBookingRestaurant] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [emailConfirmationInfo, setEmailConfirmationInfo] = useState(null);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  // Reviews for Selected Restaurant
  const [restaurantReviews, setRestaurantReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, [priceFilter]);

  // When viewing a restaurant, load its real reviews
  useEffect(() => {
    if (viewingRestaurant) {
      loadReviews(viewingRestaurant._id);
      setActiveTab('about');
    } else {
      setRestaurantReviews([]);
    }
  }, [viewingRestaurant]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (priceFilter) params.priceRange = priceFilter;
      const res = await restaurantService.getRestaurants(params);
      const list = res.data || [];
      setRestaurants(list);

      const openRestaurantId = new URLSearchParams(location.search).get('open');
      if (openRestaurantId) {
        const match = list.find((r) => r._id === openRestaurantId);
        if (match) setViewingRestaurant(match);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load restaurant directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (targetId) => {
    setLoadingReviews(true);
    try {
      const res = await reviewService.getReviewsByTarget(targetId);
      const fetched = res.data || [];
      if (fetched.length > 0) {
        setRestaurantReviews(fetched);
      } else {
        setRestaurantReviews(getInitialReviews(viewingRestaurant));
      }
    } catch {
      setRestaurantReviews(getInitialReviews(viewingRestaurant));
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
        targetType: 'Restaurant',
        targetId: viewingRestaurant._id,
        rating: Number(newRating),
        comment: newComment.trim()
      });
      showNotification('Review submitted! Thank you for sharing your dining experience.', 'success');
      setNewComment('');
      // Reload reviews
      loadReviews(viewingRestaurant._id);
    } catch (err) {
      showNotification(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleOpenBooking = (rest) => {
    if (!user) {
      setShowSignUpPrompt(true);
      return;
    }
    setBookingRestaurant(rest);
  };

  const handleBookingSuccess = (bookingData, emailInfo) => {
    setConfirmedBooking(bookingData);
    setEmailConfirmationInfo(emailInfo);
  };

  // Rich data helpers for current viewing restaurant
  const mostLoved = viewingRestaurant ? getMostLovedDish(viewingRestaurant) : null;
  const curatedMenu = viewingRestaurant ? getCuratedMenu(viewingRestaurant) : [];
  const ambianceDetails = viewingRestaurant ? getAmbianceDetails(viewingRestaurant) : [];

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '80vh' }}>
      <BackButton />

      {/* Header Banner */}
      <div style={styles.banner}>
        <div>
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Utensils size={14} /> Culinary & Fine Dining Directory
          </span>
          <h1 style={styles.mainTitle}>Gourmet Dining & Michelin Excellence</h1>
          <p style={styles.subTitle}>
            From authentic Awadhi royal banquets and coastal Goan seafood to candlelit lakeside Mewari feasts. All rates in Indian Rupees (₹).
          </p>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleSearch} style={styles.filterBar}>
          <div style={styles.searchField}>
            <Search size={16} color="#d4af37" />
            <input
              type="text"
              placeholder="Search by restaurant name or cuisine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
          </div>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            style={styles.select}
          >
            <option value="">All pricing (INR)</option>
            <option value="1000">Under ₹1,000 for two</option>
            <option value="2500">₹1,000–₹2,500 for two</option>
            <option value="4500">₹2,501–₹4,500 for two</option>
            <option value="5000">Over ₹4,500 for two</option>
          </select>
          <button type="submit" className="btn btn-gold" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
            Filter
          </button>
        </form>
      </div>

      {loading ? (
        <Loader text="Curating culinary dining tables..." />
      ) : restaurants.length === 0 ? (
        <div style={styles.empty}>
          <p>No gourmet restaurants found matching your criteria.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {restaurants.map((rest) => {
            const signature = getMostLovedDish(rest);

            return (
              <div key={rest._id} className="luxury-card" style={styles.card}>
                <button
                  type="button"
                  onClick={() => setViewingRestaurant(rest)}
                  style={styles.imgButton}
                  aria-label={`View details of ${rest.name}`}
                >
                  <img
                    src={rest.images && rest.images.length > 0 ? rest.images[0] : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'}
                    alt={rest.name}
                    style={styles.img}
                  />
                  <span style={styles.priceBadge}>₹{Number(rest.averagePriceForTwo || 1800).toLocaleString()} for two</span>
                  <span style={styles.viewBadge}>✦ Click for Menu & Reviews</span>
                </button>

                <div style={styles.cardBody}>
                  <div style={styles.metaRow}>
                    <span style={styles.cuisineTag}>{rest.cuisine}</span>
                    <div style={styles.ratingBadge}>
                      <Star size={13} fill="#d4af37" color="#d4af37" />
                      <span>{Number(rest.rating || 4.9).toFixed(1)}</span>
                      <span style={{ color: '#8e9aaf', fontSize: '0.74rem' }}>({rest.reviewCount || 120}+)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingRestaurant(rest)}
                    style={styles.nameButton}
                  >
                    <h3 style={styles.name}>{rest.name}</h3>
                  </button>

                  <p style={styles.desc}>
                    {rest.description.length > 120 ? rest.description.substring(0, 120) + '...' : rest.description}
                  </p>

                  {/* Most Loved Highlight Pill */}
                  <div
                    onClick={() => {
                      setViewingRestaurant(rest);
                      setActiveTab('mostLoved');
                    }}
                    style={styles.mostLovedSnippet}
                  >
                    <Award size={14} color="#d4af37" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: '#f7e7be', fontWeight: 600 }}>
                      Most Loved: <span style={{ color: '#ffffff' }}>{signature.name.split('&')[0]}</span> (₹{signature.price})
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <MapPin size={13} color="#d4af37" />
                    <span>{rest.address}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <Clock size={13} color="#d4af37" />
                    <span>{rest.openingHours}</span>
                  </div>

                  <div style={styles.cardFooter}>
                    <div>
                      <span style={styles.priceLabel}>Avg for two</span>
                      <div style={styles.priceVal}>₹{Number(rest.averagePriceForTwo || 1800).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setViewingRestaurant(rest)}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(rest)}
                        className="btn btn-gold"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                      >
                        Reserve Table
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RICH RESTAURANT DETAILS MODAL */}
      {viewingRestaurant && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewingRestaurant(null);
          }}
        >
          <div role="dialog" aria-modal="true" style={styles.richModal} className="luxury-card">
            {/* Modal Top Header Bar */}
            <div style={styles.modalTopBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                  {viewingRestaurant.cuisine} · {viewingRestaurant.city}
                </span>
                <span style={styles.verifiedHeaderBadge}>
                  <ShieldCheck size={13} color="#d4af37" /> Concierge Verified
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingRestaurant(null)}
                style={styles.closeBtn}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Hero Banner */}
            <div style={styles.modalHero}>
              <img
                src={viewingRestaurant.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'}
                alt={viewingRestaurant.name}
                style={styles.modalHeroImg}
              />
              <div style={styles.modalHeroOverlay}>
                <h2 style={styles.modalHeroTitle}>{viewingRestaurant.name}</h2>
                <div style={styles.modalHeroMeta}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#d4af37' }}>
                    <Star size={15} fill="#d4af37" color="#d4af37" />
                    <span style={{ fontWeight: 700 }}>{Number(viewingRestaurant.rating || 4.9).toFixed(1)}</span>
                    <span style={{ color: '#e2d5e6', fontSize: '0.85rem' }}>({restaurantReviews.length} Verified Reviews)</span>
                  </div>
                  <span style={{ color: '#d4af37' }}>•</span>
                  <span style={{ color: '#f7e7be', fontWeight: 600 }}>
                    ₹{Number(viewingRestaurant.averagePriceForTwo || 1800).toLocaleString()} for two
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Tabs */}
            <div style={styles.tabBar}>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                style={{ ...styles.tabBtn, ...(activeTab === 'about' ? styles.tabBtnActive : {}) }}
              >
                📖 About & Ambiance
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mostLoved')}
                style={{ ...styles.tabBtn, ...(activeTab === 'mostLoved' ? styles.tabBtnActive : {}) }}
              >
                🏆 Most Loved Dish
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                style={{ ...styles.tabBtn, ...(activeTab === 'menu' ? styles.tabBtnActive : {}) }}
              >
                📜 Curated Menu (₹)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                style={{ ...styles.tabBtn, ...(activeTab === 'reviews' ? styles.tabBtnActive : {}) }}
              >
                ⭐ Reviews ({restaurantReviews.length})
              </button>
            </div>

            {/* TAB CONTENT */}
            <div style={styles.tabContent}>
              {/* TAB 1: ABOUT & AMBIANCE */}
              {activeTab === 'about' && (
                <div>
                  <h3 style={styles.sectionHeading}>About {viewingRestaurant.name}</h3>
                  <p style={styles.bodyCopy}>{viewingRestaurant.description}</p>
                  <p style={styles.bodyCopy}>
                    Rooted in timeless gastronomic tradition, {viewingRestaurant.name} brings together heritage royal recipes, authentic clay tandoors, and an evocative candlelight setting. Each dish is curated by seasoned master chefs using hand-ground spices and organic, sustainably sourced ingredients.
                  </p>

                  <h4 style={{ ...styles.subHeading, marginTop: '1.5rem' }}>Ambiance & Hospitality Privileges</h4>
                  <div style={styles.ambianceGrid}>
                    {ambianceDetails.map((amb, idx) => (
                      <div key={idx} style={styles.ambianceCard}>
                        <div style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                          ✦ {amb.title}
                        </div>
                        <div style={{ color: '#bda3c4', fontSize: '0.8rem', lineHeight: 1.4 }}>{amb.desc}</div>
                      </div>
                    ))}
                  </div>

                  <h4 style={{ ...styles.subHeading, marginTop: '1.5rem' }}>Dining Location & Schedule</h4>
                  <div style={styles.infoBoxGrid}>
                    <div style={styles.infoBox}>
                      <MapPin size={16} color="#d4af37" />
                      <div>
                        <div style={styles.infoBoxLabel}>ADDRESS</div>
                        <div style={styles.infoBoxVal}>{viewingRestaurant.address}, {viewingRestaurant.city}</div>
                      </div>
                    </div>
                    <div style={styles.infoBox}>
                      <Clock size={16} color="#d4af37" />
                      <div>
                        <div style={styles.infoBoxLabel}>OPERATING HOURS</div>
                        <div style={styles.infoBoxVal}>{viewingRestaurant.openingHours}</div>
                      </div>
                    </div>
                    {viewingRestaurant.contactPhone && (
                      <div style={styles.infoBox}>
                        <Phone size={16} color="#d4af37" />
                        <div>
                          <div style={styles.infoBoxLabel}>TABLE CONCIERGE PHONE</div>
                          <div style={styles.infoBoxVal}>{viewingRestaurant.contactPhone}</div>
                        </div>
                      </div>
                    )}
                    <div style={styles.infoBox}>
                      <Utensils size={16} color="#d4af37" />
                      <div>
                        <div style={styles.infoBoxLabel}>ESTIMATED AVERAGE FOR TWO</div>
                        <div style={{ ...styles.infoBoxVal, color: '#f7e7be', fontWeight: 700 }}>
                          ₹{Number(viewingRestaurant.averagePriceForTwo || 1800).toLocaleString()} (Inclusive of taxes)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MOST LOVED FOOD ITEM */}
              {activeTab === 'mostLoved' && mostLoved && (
                <div>
                  <div style={styles.mostLovedHeroCard}>
                    <div style={styles.mostLovedBadgeBar}>
                      <span style={styles.crownBadge}>
                        <Sparkles size={14} /> {mostLoved.badge}
                      </span>
                      <span style={styles.chefTag}>{mostLoved.tag}</span>
                    </div>

                    <div style={styles.mostLovedLayout}>
                      <img src={mostLoved.image} alt={mostLoved.name} style={styles.mostLovedImg} />
                      <div style={styles.mostLovedInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={mostLoved.isVeg ? styles.vegBadge : styles.nonVegBadge}>
                            {mostLoved.isVeg ? '🟢 Pure Vegetarian' : '🔴 Gourmet Non-Veg'}
                          </span>
                        </div>
                        <h3 style={styles.mostLovedTitle}>{mostLoved.name}</h3>
                        <p style={styles.mostLovedDesc}>{mostLoved.description}</p>
                        
                        <div style={styles.mostLovedPriceRow}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#bda3c4' }}>Price per portion:</span>
                            <div style={styles.mostLovedPrice}>₹{mostLoved.price.toLocaleString()}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const r = viewingRestaurant;
                              setViewingRestaurant(null);
                              handleOpenBooking(r);
                            }}
                            className="btn btn-gold"
                            style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
                          >
                            Reserve Table & Taste
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.culinaryPhilosophyBox}>
                    <h4 style={{ color: '#d4af37', fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                      Why Diners Fall in Love With This Dish
                    </h4>
                    <p style={{ color: '#bda3c4', fontSize: '0.82rem', lineHeight: 1.5 }}>
                      Prepared strictly according to time-honored slow-cooking methods. Our master chefs source organic spices and slow-simmer the preparation in earthenware handis, creating unmatched aromatic depth and a buttery, melt-in-the-mouth texture.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: CURATED MENU WITH PRICES IN RUPEES */}
              {activeTab === 'menu' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={styles.sectionHeading}>Curated Gourmet Menu</h3>
                      <p style={{ color: '#bda3c4', fontSize: '0.82rem' }}>
                        All prices are in Indian Rupees (₹) and include all culinary service charges.
                      </p>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                      Currency: INR (₹)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {curatedMenu.map((cat, cIdx) => (
                      <div key={cIdx} style={styles.menuCatCard}>
                        <h4 style={styles.menuCatTitle}>✦ {cat.category}</h4>
                        <div style={{ display: 'grid', gap: '0.85rem' }}>
                          {cat.items.map((item, iIdx) => (
                            <div key={iIdx} style={styles.menuItemRow}>
                              <div style={{ flex: 1, paddingRight: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <span style={{ fontSize: '0.7rem' }}>{item.isVeg ? '🟢' : '🔴'}</span>
                                  <span style={styles.menuItemName}>{item.name}</span>
                                </div>
                                <div style={styles.menuItemDesc}>{item.desc}</div>
                              </div>
                              <div style={styles.menuItemPrice}>₹{item.price.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: REVIEWS & REVIEW SUBMISSION */}
              {activeTab === 'reviews' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={styles.sectionHeading}>Verified Guest Experiences</h3>
                      <p style={{ color: '#bda3c4', fontSize: '0.82rem' }}>
                        Ratings and authentic testimonials from luxury culinary travelers.
                      </p>
                    </div>
                    <div style={styles.overallRatingBadge}>
                      <Star size={18} fill="#d4af37" color="#d4af37" />
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f7e7be' }}>
                        {Number(viewingRestaurant.rating || 4.9).toFixed(1)}
                      </span>
                      <span style={{ color: '#8e9aaf', fontSize: '0.75rem' }}>/ 5.0</span>
                    </div>
                  </div>

                  {/* Review Submission Form */}
                  <form onSubmit={handleReviewSubmit} style={styles.reviewFormBox}>
                    <h4 style={{ color: '#f7e7be', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Share Your Dining Experience
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
                      placeholder="Describe the flavors, ambiance, signature dishes, and hospitality..."
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
                        <Send size={13} /> {submittingReview ? 'Submitting...' : 'Submit Verified Dining Review'}
                      </button>
                    </div>
                  </form>

                  {/* Reviews List */}
                  {loadingReviews ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#bda3c4' }}>
                      Loading verified reviews...
                    </div>
                  ) : restaurantReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#bda3c4' }}>
                      No reviews submitted yet. Be the first to share your culinary review!
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
                      {restaurantReviews.map((rev) => (
                        <div key={rev._id} style={styles.reviewCard}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={styles.reviewAvatar}>
                                {(rev.user?.name || 'G')[0].toUpperCase()}
                              </div>
                              <div>
                                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem' }}>
                                  {rev.user?.name || 'Verified Gourmet Traveler'}
                                </div>
                                <div style={{ color: '#d4af37', fontSize: '0.72rem' }}>
                                  ✦ {rev.user?.role || 'Verified Table Guest'}
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

            {/* Modal Bottom Action Bar */}
            <div style={styles.modalBottomBar}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#bda3c4' }}>Table Guarantee:</span>
                <div style={{ fontSize: '0.9rem', color: '#f7e7be', fontWeight: 700 }}>
                  Immediate Priority Table Confirmation
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setViewingRestaurant(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const r = viewingRestaurant;
                    setViewingRestaurant(null);
                    handleOpenBooking(r);
                  }}
                  className="btn btn-gold"
                  style={{ padding: '0.6rem 1.6rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Utensils size={15} /> Reserve Table Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS MODAL (Takes name, phone, email, date, time, guests, special requests) */}
      <BookingDetailsModal
        isOpen={Boolean(bookingRestaurant)}
        onClose={() => setBookingRestaurant(null)}
        onSuccess={handleBookingSuccess}
        item={bookingRestaurant}
        itemType="Restaurant"
        title={bookingRestaurant ? `Table Reservation: ${bookingRestaurant.name}` : ''}
        subtitle={bookingRestaurant ? `${bookingRestaurant.cuisine} • ${bookingRestaurant.city}` : ''}
        price={bookingRestaurant?.averagePriceForTwo || 1800}
        maxGuests={20}
      />

      {/* BOOKING CONFIRMATION POPUP MODAL (with registered email notification) */}
      <BookingConfirmationModal
        isOpen={Boolean(confirmedBooking)}
        onClose={() => setConfirmedBooking(null)}
        booking={confirmedBooking}
        emailInfo={emailConfirmationInfo}
        itemTitle={confirmedBooking?.itemRef?.name ? `Table Reservation: ${confirmedBooking.itemRef.name}` : 'Dining Reservation'}
        itemLocation={confirmedBooking?.itemRef?.city || confirmedBooking?.itemRef?.address || ''}
        onViewBookings={() => navigate('/tourist/bookings')}
      />

      {/* SIGN UP PROMPT FOR GUESTS */}
      <SignUpPrompt
        open={showSignUpPrompt}
        onClose={() => setShowSignUpPrompt(false)}
        returnTo={`${location.pathname}${location.search}`}
        title="Sign up to reserve a table"
        message="Create a free account to reserve your dining table and receive confirmation vouchers directly to your registered email."
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
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(31, 14, 34, 0.85)',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    flexWrap: 'wrap'
  },
  searchField: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    minWidth: '240px',
    background: 'rgba(21, 9, 23, 0.8)',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.2)'
  },
  input: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#f8fafc',
    fontSize: '0.9rem',
    outline: 'none'
  },
  select: {
    background: 'rgba(21, 9, 23, 0.8)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    color: '#f7e7be',
    padding: '0.55rem 1rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer'
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
  priceBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'var(--color-gold-gradient)',
    color: '#150917',
    fontSize: '0.75rem',
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
    marginBottom: '0.4rem'
  },
  cuisineTag: {
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
  nameButton: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    padding: 0,
    border: 0,
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer'
  },
  name: {
    fontSize: '1.2rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    marginBottom: '0.4rem'
  },
  desc: {
    fontSize: '0.82rem',
    color: '#bda3c4',
    lineHeight: 1.4,
    marginBottom: '0.75rem'
  },
  mostLovedSnippet: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    padding: '0.4rem 0.6rem',
    borderRadius: '4px',
    marginBottom: '0.75rem',
    cursor: 'pointer'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.78rem',
    color: '#e2d5e6',
    marginBottom: '0.35rem'
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '0.85rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)'
  },
  priceLabel: {
    fontSize: '0.7rem',
    color: '#bda3c4',
    display: 'block'
  },
  priceVal: {
    fontSize: '0.95rem',
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
  ambianceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  ambianceCard: {
    background: 'rgba(31, 14, 34, 0.65)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '0.75rem 1rem',
    borderRadius: '4px'
  },
  infoBoxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    background: 'rgba(21, 9, 23, 0.7)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    padding: '0.75rem',
    borderRadius: '4px'
  },
  infoBoxLabel: {
    fontSize: '0.68rem',
    color: '#8e9aaf',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  infoBoxVal: {
    fontSize: '0.82rem',
    color: '#e2d5e6',
    marginTop: '0.15rem'
  },

  // Most Loved Card Styles
  mostLovedHeroCard: {
    background: 'linear-gradient(135deg, rgba(31, 14, 34, 0.9) 0%, rgba(56, 26, 62, 0.6) 100%)',
    border: '1px solid rgba(212, 175, 55, 0.5)',
    borderRadius: '6px',
    padding: '1.25rem',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
  },
  mostLovedBadgeBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  crownBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'var(--color-gold-gradient)',
    color: '#150917',
    fontSize: '0.75rem',
    fontWeight: 800,
    padding: '0.25rem 0.65rem',
    borderRadius: '2px'
  },
  chefTag: {
    fontSize: '0.75rem',
    color: '#f7e7be',
    fontWeight: 600
  },
  mostLovedLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
    alignItems: 'center'
  },
  mostLovedImg: {
    width: '100%',
    height: '190px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.3)'
  },
  mostLovedInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  vegBadge: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#4ade80',
    background: 'rgba(74, 222, 128, 0.1)',
    padding: '0.15rem 0.5rem',
    borderRadius: '3px',
    border: '1px solid rgba(74, 222, 128, 0.3)'
  },
  nonVegBadge: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#f87171',
    background: 'rgba(248, 113, 113, 0.1)',
    padding: '0.15rem 0.5rem',
    borderRadius: '3px',
    border: '1px solid rgba(248, 113, 113, 0.3)'
  },
  mostLovedTitle: {
    fontSize: '1.25rem',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    marginBottom: '0.45rem'
  },
  mostLovedDesc: {
    fontSize: '0.82rem',
    color: '#c5cbd3',
    lineHeight: 1.5,
    marginBottom: '1rem'
  },
  mostLovedPriceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.2)'
  },
  mostLovedPrice: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#d4af37'
  },
  culinaryPhilosophyBox: {
    marginTop: '1.25rem',
    padding: '1rem',
    background: 'rgba(21, 9, 23, 0.6)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    borderRadius: '4px'
  },

  // Menu Styles
  menuCatCard: {
    background: 'rgba(31, 14, 34, 0.55)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '1.15rem',
    borderRadius: '4px'
  },
  menuCatTitle: {
    fontSize: '0.95rem',
    fontFamily: 'var(--font-serif)',
    color: '#f7e7be',
    marginBottom: '0.85rem',
    borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
    paddingBottom: '0.4rem'
  },
  menuItemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: '0.75rem',
    borderBottom: '1px dashed rgba(212, 175, 55, 0.1)'
  },
  menuItemName: {
    fontSize: '0.86rem',
    color: '#f8fafc',
    fontWeight: 600
  },
  menuItemDesc: {
    fontSize: '0.78rem',
    color: '#8e9aaf',
    marginTop: '0.15rem',
    lineHeight: 1.35
  },
  menuItemPrice: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#d4af37',
    whiteSpace: 'nowrap'
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

export default Restaurants;
