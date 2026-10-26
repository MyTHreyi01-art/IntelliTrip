import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService } from '../../services/wishlistService';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';
import { Heart, MapPin, Star, Building, Sparkles, Utensils, ArrowRight } from 'lucide-react';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistService.getWishlist();
      setWishlist(res.data);
    } catch (err) {
      showNotification(err.message || 'Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemType, itemId) => {
    try {
      await wishlistService.toggleWishlist(itemType, itemId);
      showNotification('Item removed from wishlist', 'info');
      fetchWishlist();
    } catch (err) {
      showNotification(err.message || 'Could not update wishlist', 'error');
    }
  };

  const hasItems = wishlist && (
    (wishlist.destinations && wishlist.destinations.length > 0) ||
    (wishlist.hotels && wishlist.hotels.length > 0) ||
    (wishlist.experiences && wishlist.experiences.length > 0)
  );

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <BackButton to="/tourist/dashboard" />
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-primary">Saved Bucket List</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem' }}>My Saved Travel Wishlist</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Destinations, luxury hotels, and local guided activities saved for your upcoming journeys.
        </p>
      </div>

      {loading ? (
        <Loader message="Loading your saved bucket list..." />
      ) : !hasItems ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <Heart size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>Your Wishlist is Empty</h3>
          <p style={{ color: 'var(--text-muted)' }}>Browse destinations or hotels and click the heart icon to save items here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Saved Destinations */}
          {wishlist.destinations && wishlist.destinations.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Saved Destinations</h2>
              <div style={styles.grid}>
                {wishlist.destinations.map((dest) => (
                  <div key={dest._id} className="glass-card" style={styles.card}>
                    <div style={styles.imgWrapper}>
                      <img src={dest.images && dest.images[0] ? dest.images[0] : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'} alt={dest.name} style={styles.img} />
                      <button onClick={() => handleRemove('Destination', dest._id)} style={styles.removeBtn}>✕</button>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{dest.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{dest.city}, {dest.country}</p>
                      <Link to={`/destinations/${dest._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.75rem' }}>
                        View Details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Hotels */}
          {wishlist.hotels && wishlist.hotels.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Saved Hotels</h2>
              <div style={styles.grid}>
                {wishlist.hotels.map((h) => (
                  <div key={h._id} className="glass-card" style={styles.card}>
                    <div style={styles.imgWrapper}>
                      <img src={h.images && h.images[0] ? h.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'} alt={h.name} style={styles.img} />
                      <button onClick={() => handleRemove('Hotel', h._id)} style={styles.removeBtn}>✕</button>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{h.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>${h.startingPrice}/night</p>
                      <Link to={`/hotels/${h._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.75rem' }}>
                        Reserve Room <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    overflow: 'hidden'
  },
  imgWrapper: {
    position: 'relative',
    height: '160px'
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removeBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(239,68,68,0.85)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Wishlist;
