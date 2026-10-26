import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { hotelService } from '../../services/hotelService';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import SignUpPrompt from '../../components/common/SignUpPrompt';
import BackButton from '../../components/common/BackButton';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, Star, Building2, Wifi, Coffee, Car, ArrowRight, Crown } from 'lucide-react';

const FALLBACK_HOTEL = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

const Hotels = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || queryParams.get('city') || '';

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [signUpReturnTo, setSignUpReturnTo] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [location.search]);

  useEffect(() => {
    fetchHotels();
  }, [location.search]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await hotelService.getHotels(params);
      setHotels(res.data || []);
    } catch (err) {
      showNotification(err.message || 'Failed to load luxury hotels', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '85vh' }}>
      <BackButton />
      {/* Banner */}
      <div style={styles.banner}>
        <div>
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Crown size={14} /> 5-Star Accommodations & Palaces
          </span>
          <h1 style={styles.mainTitle}>Royal Palaces, Stately Haveli & Luxury Resorts</h1>
          <p style={styles.subTitle}>
            Discover premier royal suites, private plunge pool villas, and mountain chalets across India.
          </p>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleSearchSubmit} style={styles.filterBar}>
          <div style={styles.searchField}>
            <Search size={16} color="#d4af37" />
            <input
              type="text"
              placeholder="Search by hotel name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.filterInput}
            />
          </div>
          <div style={styles.searchField}>
            <MapPin size={16} color="#d4af37" />
            <input
              type="text"
              placeholder="City (e.g. Udaipur, Goa)..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={styles.filterInput}
            />
          </div>
          <button type="submit" className="btn btn-gold" style={{ padding: '0.65rem 1.4rem', fontSize: '0.85rem' }}>
            Filter Stays
          </button>
        </form>
      </div>

      {/* Hotel Cards Grid */}
      {loading ? (
        <Loader text="Curating 5-star palace suites..." />
      ) : hotels.length === 0 ? (
        <div className="luxury-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Building2 size={40} color="#d4af37" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: '#f7e7be', fontFamily: 'var(--font-serif)' }}>No Luxury Stays Found</h3>
          <p style={{ color: '#bda3c4', fontSize: '0.9rem' }}>Try clearing filters or search for another royal city.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {hotels.map((h) => {
            const hotelImg = (h.images && h.images.length > 0 && h.images[0]) ? h.images[0] : FALLBACK_HOTEL;

            return (
              <Link
                key={h._id}
                to={`/hotels/${h._id}`}
                state={{
                  booking: {
                    startDate: queryParams.get('checkIn'),
                    endDate: queryParams.get('checkOut'),
                    guests: Number(queryParams.get('guests')) || 2
                  }
                }}
                onClick={(event) => {
                  if (!user) {
                    event.preventDefault();
                    setSignUpReturnTo(`/hotels/${h._id}`);
                  }
                }}
                className="luxury-card"
                style={styles.card}
              >
                <div style={styles.imgWrapper}>
                  <img
                    src={hotelImg}
                    alt={h.name}
                    style={styles.img}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_HOTEL;
                    }}
                  />
                  <span style={styles.starBadge}>
                    <Star size={12} fill="#150917" color="#150917" /> {Number(h.rating || 4.9).toFixed(1)}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <p style={styles.location}>
                    <MapPin size={13} color="#d4af37" />
                    {h.city}, India
                  </p>

                  <h3 style={styles.title}>{h.name}</h3>

                  <p style={styles.desc}>
                    {h.description.length > 100 ? h.description.substring(0, 100) + '...' : h.description}
                  </p>

                  {/* Amenities */}
                  <div style={styles.amenities}>
                    {h.amenities && h.amenities.slice(0, 3).map((am, i) => (
                      <span key={i} style={styles.amenityTag}>
                        ✦ {am}
                      </span>
                    ))}
                  </div>

                  <div style={styles.cardFooter}>
                    <div>
                      <span style={styles.pricePrefix}>Starting Rate</span>
                      <p style={styles.priceText}>
                        ₹{Number(h.startingPrice || 0).toLocaleString()} <span style={styles.perNight}>/ night</span>
                      </p>
                    </div>

                    <div style={styles.bookBtn}>
                      Reserve <ArrowRight size={14} />
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
        title="Sign up to view this stay"
        message="Create a free account to see the full property details and room options. You can keep browsing without signing up."
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
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: 'rgba(31, 14, 34, 0.9)',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.35)',
    flexWrap: 'wrap'
  },
  searchField: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(21, 9, 23, 0.85)',
    padding: '0.45rem 0.75rem',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.2)'
  },
  filterInput: {
    background: 'none',
    border: 'none',
    color: '#f8fafc',
    fontSize: '0.85rem',
    outline: 'none',
    minWidth: '160px'
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
  starBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'var(--color-gold-gradient)',
    color: '#150917',
    fontSize: '0.75rem',
    fontWeight: '800',
    padding: '0.2rem 0.55rem',
    borderRadius: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  cardBody: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '0.6rem'
  },
  location: {
    fontSize: '0.78rem',
    color: '#d4af37',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontWeight: '600'
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    lineHeight: 1.3
  },
  desc: {
    fontSize: '0.85rem',
    color: '#bda3c4',
    lineHeight: 1.4
  },
  amenities: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    margin: '0.35rem 0'
  },
  amenityTag: {
    fontSize: '0.72rem',
    color: '#bda3c4',
    background: 'rgba(56, 20, 63, 0.45)',
    padding: '0.15rem 0.5rem',
    borderRadius: '2px',
    border: '1px solid rgba(212, 175, 55, 0.15)'
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
  priceText: {
    fontWeight: '700',
    color: '#d4af37',
    fontSize: '1.3rem',
    fontFamily: 'var(--font-serif)'
  },
  perNight: {
    fontSize: '0.75rem',
    color: '#bda3c4',
    fontWeight: '400'
  },
  bookBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#f7e7be',
    fontWeight: '700',
    fontSize: '0.82rem',
    letterSpacing: '0.5px'
  }
};

export default Hotels;
