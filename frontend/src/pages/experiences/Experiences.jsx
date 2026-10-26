import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { experienceService } from '../../services/experienceService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import SignUpPrompt from '../../components/common/SignUpPrompt';
import BackButton from '../../components/common/BackButton';
import BookingDetailsModal from '../../components/booking/BookingDetailsModal';
import BookingConfirmationModal from '../../components/booking/BookingConfirmationModal';
import { Sparkles, Star, Users, Clock, CheckCircle2, ArrowRight, Search, Ticket } from 'lucide-react';

const CATEGORIES = ['All', 'Heritage Tour', 'Cultural Walk', 'Water Sports', 'Adventure', 'Paragliding', 'Food Tour', 'Safari', 'Camping', 'Trekking'];

const FALLBACK_EXP = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80';

const Experiences = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState(initialSearch);

  // Booking modal state
  const [viewingExp, setViewingExp] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [emailConfirmationInfo, setEmailConfirmationInfo] = useState(null);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  useEffect(() => {
    fetchExperiences();
  }, [category, location.search]);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      const res = await experienceService.getExperiences(params);
      setExperiences(res.data || []);
      const openExperienceId = new URLSearchParams(location.search).get('open');
      if (openExperienceId) {
        const matchingExperience = (res.data || []).find((experience) => experience._id === openExperienceId);
        if (matchingExperience) {
          setViewingExp(matchingExperience);
        }
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load experiences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookExperienceClick = (experience) => {
    if (!user) {
      setShowSignUpPrompt(true);
      return;
    }
    setSelectedExp(experience);
  };

  const handleBookingSuccess = (bookingData, emailInfo) => {
    setConfirmedBooking(bookingData);
    setEmailConfirmationInfo(emailInfo);
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '85vh' }}>
      <BackButton />
      {/* Banner */}
      <div style={styles.banner}>
        <div>
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Ticket size={14} /> Signature Private Tours & Masterclasses
          </span>
          <h1 style={styles.mainTitle}>Curated VIP & Bespoke Experiences</h1>
          <p style={styles.subTitle}>
            VIP Taj Mahal photography, Grand Island private catamarans, royal desert glamping, and Himalayan tandem paragliding.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={(e) => { e.preventDefault(); fetchExperiences(); }} style={styles.searchForm}>
          <div style={styles.searchField}>
            <Search size={16} color="#d4af37" />
            <input
              type="text"
              placeholder="Search by title, activity, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button type="submit" className="btn btn-gold" style={{ padding: '0.65rem 1.4rem', fontSize: '0.85rem' }}>
            Search
          </button>
        </form>
      </div>

      {/* Category Tabs (Fixed High-Contrast Colors) */}
      <div style={styles.tabRow}>
        {CATEGORIES.map((cat) => {
          const isActive = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                ...styles.tabBtn,
                background: isActive ? 'var(--color-gold-gradient)' : 'rgba(31, 14, 34, 0.85)',
                color: isActive ? '#150917' : '#f7e7be',
                borderColor: isActive ? '#f7e7be' : 'rgba(212, 175, 55, 0.35)',
                fontWeight: isActive ? '800' : '600'
              }}
            >
              {cat === 'All' ? '✦ All Experiences' : cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <Loader text="Curating signature private experiences..." />
      ) : experiences.length === 0 ? (
        <div className="luxury-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Ticket size={40} color="#d4af37" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: '#f7e7be', fontFamily: 'var(--font-serif)' }}>No Experiences Found</h3>
          <p style={{ color: '#bda3c4', fontSize: '0.9rem' }}>Try clearing filters or search for another destination.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {experiences.map((exp) => {
            const expImg = (exp.images && exp.images.length > 0 && exp.images[0]) ? exp.images[0] : FALLBACK_EXP;

            return (
              <div key={exp._id} className="luxury-card" style={styles.card}>
                <button type="button" onClick={() => setViewingExp(exp)} style={styles.imgWrapper} aria-label={`View ${exp.title} details`}>
                  <img
                    src={expImg}
                    alt={exp.title}
                    style={styles.img}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_EXP;
                    }}
                  />
                  <span style={styles.catBadge}>{exp.category}</span>
                  <span style={styles.durationBadge}>
                    <Clock size={11} style={{ marginRight: 3 }} /> {exp.duration}
                  </span>
                </button>

                <div style={styles.cardBody}>
                  <button type="button" onClick={() => setViewingExp(exp)} style={styles.titleButton}>
                    <h3 style={styles.title}>{exp.title}</h3>
                  </button>
                  <p style={styles.desc}>
                    {exp.description.length > 110 ? exp.description.substring(0, 110) + '...' : exp.description}
                  </p>

                  <div style={styles.metaRow}>
                    <div style={styles.ratingBadge}>
                      <Star size={12} fill="#d4af37" color="#d4af37" />
                      <span>{Number(exp.rating || 4.9).toFixed(1)}</span>
                    </div>
                    <div style={styles.groupSize}>
                      <Users size={12} color="#d4af37" />
                      <span>Max {exp.maxGroupSize || 8} Guests</span>
                    </div>
                  </div>

                  {exp.includedServices && exp.includedServices.length > 0 && (
                    <div style={styles.included}>
                      <span style={{ fontSize: '0.72rem', color: '#d4af37', fontWeight: '700' }}>INCLUSIONS:</span>
                      <ul style={styles.includedList}>
                        {exp.includedServices.slice(0, 2).map((inc, i) => (
                          <li key={i} style={styles.includedItem}>
                            ✦ {inc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={styles.cardFooter}>
                    <div>
                      <span style={styles.pricePrefix}>Private Tour Rate</span>
                      <p style={styles.price}>
                        ₹{Number(exp.pricePerPerson || 0).toLocaleString()} <span style={styles.perPerson}>/ guest</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleBookExperienceClick(exp)}
                      className="btn btn-gold"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                    >
                      Book Tour
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewingExp && (
        <div style={styles.modalOverlay} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setViewingExp(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="experience-details-title" className="luxury-card" style={styles.modalCard}>
            <button type="button" onClick={() => setViewingExp(null)} className="btn btn-secondary" style={styles.detailClose}>Close</button>
            <img src={viewingExp.images?.[0] || FALLBACK_EXP} alt={viewingExp.title} style={styles.detailImage} />
            <p style={styles.modalSub}>{viewingExp.category} · {viewingExp.duration} · {viewingExp.cityName || viewingExp.destination?.city}</p>
            <h2 id="experience-details-title" style={styles.modalTitle}>{viewingExp.title}</h2>
            <p style={styles.modalDescription}>{viewingExp.description}</p>
            <p style={styles.modalDescription}>Up to {viewingExp.maxGroupSize || 10} guests · {viewingExp.rating || 'New'} rating</p>
            {viewingExp.includedServices?.length > 0 && <p style={styles.modalDescription}>Included: {viewingExp.includedServices.join(', ')}</p>}
            <p style={styles.detailPrice}>₹{Number(viewingExp.pricePerPerson || 0).toLocaleString()} per guest</p>
            <button type="button" className="btn btn-gold" onClick={() => {
              const experience = viewingExp;
              setViewingExp(null);
              handleBookExperienceClick(experience);
            }}>Book Tour</button>
          </section>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedExp && (
        <BookingDetailsModal
          isOpen={Boolean(selectedExp)}
          onClose={() => setSelectedExp(null)}
          onSuccess={handleBookingSuccess}
          item={selectedExp}
          itemType="Experience"
          title={`Book Tour: ${selectedExp.title}`}
          subtitle={`${selectedExp.category} • ${selectedExp.duration}${selectedExp.destination?.city ? ` • ${selectedExp.destination.city}` : ''}`}
          price={selectedExp.pricePerPerson}
          maxGuests={selectedExp.maxGroupSize || 10}
        />
      )}

      {/* Booking Confirmation Popup Modal */}
      <BookingConfirmationModal
        isOpen={Boolean(confirmedBooking)}
        onClose={() => setConfirmedBooking(null)}
        booking={confirmedBooking}
        emailInfo={emailConfirmationInfo}
        itemTitle={selectedExp?.title || 'Signature Experience Tour'}
        itemLocation={selectedExp?.destination?.city || 'Signature Destination'}
        onViewBookings={() => navigate('/tourist/bookings')}
      />
      <SignUpPrompt
        open={showSignUpPrompt}
        onClose={() => setShowSignUpPrompt(false)}
        returnTo={`${location.pathname}${location.search}`}
        title="Sign up to book this experience"
        message="Create a free account to reserve your place. Not ready yet? Close this message and keep exploring."
      />
    </div>
  );
};

const styles = {
  banner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '1.5rem',
    marginBottom: '2.5rem'
  },
  mainTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: 'var(--color-gold-light)',
    marginTop: '0.4rem',
    marginBottom: '0.4rem'
  },
  subTitle: {
    fontSize: '1rem',
    color: '#bda3c4',
    maxWidth: '750px'
  },
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(31, 14, 34, 0.9)',
    padding: '0.4rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    width: '100%',
    maxWidth: '440px'
  },
  searchField: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    padding: '0 0.5rem'
  },
  searchInput: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#f8fafc',
    fontSize: '0.9rem',
    outline: 'none'
  },
  tabRow: {
    display: 'flex',
    gap: '0.65rem',
    overflowX: 'auto',
    paddingBottom: '0.75rem',
    marginBottom: '2.5rem'
  },
  tabBtn: {
    padding: '0.55rem 1.15rem',
    borderRadius: '4px',
    border: '1px solid',
    fontSize: '0.82rem',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '0.5px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem'
  },
  card: {
    display: 'flex',
    flexDirection: 'column'
  },
  imgWrapper: {
    position: 'relative',
    height: '210px',
    overflow: 'hidden',
    display: 'block',
    width: '100%',
    padding: 0,
    border: 0,
    background: 'transparent',
    textAlign: 'left'
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  catBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'var(--color-gold-gradient)',
    color: '#150917',
    fontSize: '0.72rem',
    fontWeight: '800',
    padding: '0.2rem 0.6rem',
    borderRadius: '2px',
    letterSpacing: '0.5px'
  },
  durationBadge: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    background: 'rgba(21, 9, 23, 0.85)',
    color: '#f7e7be',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '2px',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    display: 'flex',
    alignItems: 'center'
  },
  cardBody: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '0.6rem'
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    lineHeight: 1.3
  },
  titleButton: {
    width: 'fit-content',
    maxWidth: '100%',
    padding: 0,
    border: 0,
    background: 'transparent',
    textAlign: 'left'
  },
  desc: {
    fontSize: '0.85rem',
    color: '#bda3c4',
    lineHeight: 1.4
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.4rem 0',
    borderTop: '1px solid rgba(212, 175, 55, 0.1)',
    borderBottom: '1px solid rgba(212, 175, 55, 0.1)'
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    color: '#d4af37',
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  groupSize: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.78rem',
    color: '#bda3c4'
  },
  included: {
    marginTop: '0.25rem'
  },
  includedList: {
    listStyle: 'none',
    padding: 0,
    marginTop: '0.2rem'
  },
  includedItem: {
    fontSize: '0.75rem',
    color: '#e2d5e6',
    lineHeight: 1.4
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pricePrefix: {
    fontSize: '0.7rem',
    color: '#8e7894',
    display: 'block'
  },
  price: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#d4af37',
    fontFamily: 'var(--font-serif)'
  },
  perPerson: {
    fontSize: '0.75rem',
    color: '#bda3c4',
    fontWeight: '400'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1300,
    padding: '1.5rem'
  },
  modalCard: {
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '2rem',
    background: '#1f0e22',
    border: '1px solid rgba(212, 175, 55, 0.45)'
  },
  modalTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: 'var(--color-gold-light)',
    marginBottom: '0.25rem'
  },
  modalSub: {
    fontSize: '0.85rem',
    color: '#bda3c4',
    marginBottom: '1.5rem'
  },
  modalDescription: {
    color: '#e2d5e6',
    fontSize: '0.88rem',
    lineHeight: 1.55,
    marginTop: '-0.75rem',
    marginBottom: '1rem'
  },
  detailImage: { width: '100%', height: '210px', objectFit: 'cover', marginBottom: '1rem' },
  detailClose: { float: 'right', padding: '0.4rem 0.65rem', fontSize: '0.78rem' },
  detailPrice: { color: '#d4af37', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  modalLabel: {
    fontSize: '0.72rem',
    color: '#d4af37',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  modalInput: {
    background: 'rgba(21, 9, 23, 0.9)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    color: '#f8fafc',
    padding: '0.65rem 0.85rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    outline: 'none'
  },
  modalPriceSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)',
    borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
    fontSize: '0.9rem'
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem'
  }
};

export default Experiences;
