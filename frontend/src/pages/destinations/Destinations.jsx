import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { destinationService } from '../../services/destinationService';
import { wishlistService } from '../../services/wishlistService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import SignUpPrompt from '../../components/common/SignUpPrompt';
import BackButton from '../../components/common/BackButton';
import { Search, MapPin, Star, Heart, Compass, ArrowRight, Sparkles } from 'lucide-react';

const CATEGORIES = ['All', 'Mountain', 'Beach', 'Historical', 'Cultural', 'Adventure', 'Nature', 'Urban', 'Wildlife', 'Desert', 'Religous'];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

const Destinations = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [wishlistIds, setWishlistIds] = useState([]);
  const [signUpReturnTo, setSignUpReturnTo] = useState('');

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [location.search]);

  useEffect(() => {
    fetchDestinations();
    if (user) {
      fetchWishlist();
    }
  }, [selectedCategory, user, location.search]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await destinationService.getDestinations(params);
      setDestinations(res.data || []);
    } catch (err) {
      showNotification(err.message || 'Failed to load destinations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await wishlistService.getWishlist();
      if (res.data && res.data.destinations) {
        setWishlistIds(res.data.destinations.map(d => d._id || d));
      }
    } catch (e) {
      // Non-blocking
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDestinations();
  };

  const handleToggleWishlist = async (e, destId) => {
    e.preventDefault();
    if (!user) {
      showNotification('Please log in to save journeys to your wishlist', 'info');
      return;
    }

    try {
      const res = await wishlistService.toggleWishlist('Destination', destId);
      if (res.isWishlisted) {
        setWishlistIds([...wishlistIds, destId]);
        showNotification('Saved to your bespoke wishlist!', 'success');
      } else {
        setWishlistIds(wishlistIds.filter(id => id !== destId));
        showNotification('Removed from wishlist', 'info');
      }
    } catch (err) {
      showNotification(err.message || 'Could not update wishlist', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '85vh' }}>
      <BackButton />
      {/* Header Banner */}
      <div style={styles.banner}>
        <div>
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Compass size={14} /> Bespoke Journey Directory
          </span>
          <h1 style={styles.mainTitle}>Explore Iconic Indian Destinations</h1>
          <p style={styles.subTitle}>
            From high-altitude Himalayan summits and royal Rajput palaces to tropical backwaters and secluded coral islands.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <div style={styles.searchField}>
            <Search size={16} color="#d4af37" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, palace, or keyword..."
              style={styles.searchInput}
            />
          </div>
          <button type="submit" className="btn btn-gold" style={{ padding: '0.65rem 1.4rem', fontSize: '0.85rem' }}>
            Search
          </button>
        </form>
      </div>

      {/* Category Filter Pills (Fixed High-Contrast Colors) */}
      <div style={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.catBtn,
                background: isActive ? 'var(--color-gold-gradient)' : 'rgba(31, 14, 34, 0.85)',
                color: isActive ? '#150917' : '#f7e7be',
                borderColor: isActive ? '#f7e7be' : 'rgba(212, 175, 55, 0.35)',
                fontWeight: isActive ? '800' : '600'
              }}
            >
              {cat === 'All' && '✦ All Destinations'}
              {cat === 'Mountain' && '🏔️ Mountains & Snow'}
              {cat === 'Beach' && '🏖️ Beaches & Islands'}
              {cat === 'Historical' && '🕌 Royal Heritage'}
              {cat === 'Cultural' && '🎨 Cultural Hubs'}
              {cat === 'Adventure' && '⚡ High Adventure'}
              {cat === 'Nature' && '🌴 Nature & Backwaters'}
              {cat === 'Urban' && '🏙️ Luxury Metropolis'}
              {cat === 'Wildlife' && '🐅 Safari Reserves'}
              {cat === 'Desert' && '🐪 Golden Deserts'}
              {cat === 'Religous' && '🕉️ Sacred Temples'}
            </button>
          );
        })}
      </div>

      {/* Destination Grid */}
      {loading ? (
        <Loader text="Curating bespoke destinations..." />
      ) : destinations.length === 0 ? (
        <div style={styles.emptyBox} className="luxury-card">
          <Compass size={40} color="#d4af37" />
          <h3 style={{ color: '#f7e7be', fontFamily: 'var(--font-serif)', marginTop: '0.5rem' }}>No Destinations Found</h3>
          <p style={{ color: '#bda3c4', fontSize: '0.9rem' }}>Try refining your search keyword or selecting a different category filter.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {destinations.map((dest) => {
            const isSaved = wishlistIds.includes(dest._id);
            const cardImg = (dest.images && dest.images.length > 0 && dest.images[0]) ? dest.images[0] : FALLBACK_IMAGE;

            return (
              <Link
                key={dest._id}
                to={`/destinations/${dest._id}`}
                onClick={(event) => {
                  if (!user) {
                    event.preventDefault();
                    setSignUpReturnTo(`/destinations/${dest._id}`);
                  }
                }}
                className="luxury-card"
                style={styles.card}
              >
                <div style={styles.imgWrapper}>
                  <img
                    src={cardImg}
                    alt={dest.name}
                    style={styles.img}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                  <div style={styles.categoryTag}>{dest.category}</div>
                  <button
                    onClick={(e) => handleToggleWishlist(e, dest._id)}
                    style={styles.wishlistBtn}
                    title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart size={18} fill={isSaved ? '#f43f5e' : 'none'} color={isSaved ? '#f43f5e' : '#ffffff'} />
                  </button>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.title}>{dest.name}</h3>
                    <div style={styles.ratingBadge}>
                      <Star size={13} fill="#d4af37" color="#d4af37" />
                      <span>{Number(dest.rating || 4.8).toFixed(1)}</span>
                    </div>
                  </div>

                  <p style={styles.location}>
                    <MapPin size={13} color="#d4af37" />
                    {dest.city}, {dest.state ? `${dest.state}, ` : ''}{dest.country}
                  </p>

                  <p style={styles.desc}>
                    {dest.description.length > 115 ? dest.description.substring(0, 115) + '...' : dest.description}
                  </p>

                  <div style={styles.cardFooter}>
                    <div>
                      <span style={styles.costLabel}>Avg Cost / Day</span>
                      <p style={styles.costValue}>₹{Number(dest.averageCostPerDay || 0).toLocaleString()}</p>
                    </div>

                    <div style={styles.detailsBtn}>
                      View Journey <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <SignUpPrompt
        open={Boolean(signUpReturnTo)}
        onClose={() => setSignUpReturnTo('')}
        returnTo={signUpReturnTo}
        title="Sign up to explore this destination"
        message="Create a free account to open the full destination guide. You can also keep browsing and decide later."
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
  categoryRow: {
    display: 'flex',
    gap: '0.65rem',
    overflowX: 'auto',
    paddingBottom: '0.75rem',
    marginBottom: '2.5rem'
  },
  catBtn: {
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
    flexDirection: 'column',
    textDecoration: 'none'
  },
  imgWrapper: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden'
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  categoryTag: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'rgba(21, 9, 23, 0.85)',
    backdropFilter: 'blur(4px)',
    color: '#d4af37',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    padding: '0.2rem 0.6rem',
    borderRadius: '2px',
    fontSize: '0.72rem',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  wishlistBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(21, 9, 23, 0.75)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  cardBody: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '0.65rem'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem'
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    lineHeight: 1.3
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#d4af37',
    fontSize: '0.85rem',
    fontWeight: '700'
  },
  location: {
    fontSize: '0.82rem',
    color: '#d4af37',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontWeight: '600'
  },
  desc: {
    fontSize: '0.85rem',
    color: '#bda3c4',
    lineHeight: 1.5
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  costLabel: {
    fontSize: '0.7rem',
    color: '#8e7894',
    display: 'block'
  },
  costValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#d4af37',
    fontFamily: 'var(--font-serif)'
  },
  detailsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#f7e7be',
    fontWeight: '700',
    fontSize: '0.82rem',
    letterSpacing: '0.5px'
  },
  emptyBox: {
    textAlign: 'center',
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem'
  }
};

export default Destinations;
