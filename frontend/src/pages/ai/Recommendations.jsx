import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';

const Recommendations = () => {
  const location = useLocation();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ destinations: [], hotels: [], experiences: [] });

  useEffect(() => {
    fetchRecommendations();
  }, [location.search]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await aiService.getRecommendations();
      setData(res.data || { destinations: [], hotels: [], experiences: [] });
    } catch (err) {
      showNotification(err.message || 'Failed to fetch recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <BackButton to="/travel-dna" />
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={14} color="var(--color-accent)" /> Explainable AI Engine
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem' }}>
          Personalized Travel Recommendations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Real destinations, luxury stays, and guided activities matched against your unique Travel DNA profile.
        </p>
      </div>

      {loading ? (
        <Loader message="Matching catalog items with your Travel DNA..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Top Destination Matches */}
          {data.destinations?.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Recommended Destinations
              </h2>
              <div style={styles.grid}>
                {data.destinations.slice(0, 3).map((dest) => (
                  <Link key={dest._id} to={`/destinations/${dest._id}`} className="glass-card" style={styles.card}>
                    <div style={styles.imgWrapper}>
                      <img src={dest.images && dest.images[0] ? dest.images[0] : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'} alt={dest.name} style={styles.img} />
                      <div style={styles.matchScoreBadge}>{dest.matchScore}% Match</div>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{dest.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>{dest.matchReason}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{dest.city}, {dest.country}</p>
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>${dest.averageCostPerDay}/day</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>View Details <ArrowRight size={14} /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Top Hotel Matches */}
          {data.hotels?.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Recommended Accommodations
              </h2>
              <div style={styles.grid}>
                {data.hotels.slice(0, 3).map((h) => (
                  <Link key={h._id} to={`/hotels/${h._id}`} className="glass-card" style={styles.card}>
                    <div style={styles.imgWrapper}>
                      <img src={h.images && h.images[0] ? h.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'} alt={h.name} style={styles.img} />
                      <div style={styles.matchScoreBadge}>{h.matchScore}% Match</div>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{h.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>{h.matchReason}</p>
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>${h.startingPrice}/night</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>Reserve Room <ArrowRight size={14} /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {data.experiences?.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Recommended Experiences
              </h2>
              <div style={styles.grid}>
                {data.experiences.slice(0, 3).map((experience) => (
                  <Link
                    key={experience._id}
                    to={`/experiences?open=${experience._id}`}
                    className="glass-card"
                    style={styles.card}
                  >
                    <div style={styles.imgWrapper}>
                      <img src={experience.images?.[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'} alt={experience.title} style={styles.img} />
                      <div style={styles.matchScoreBadge}>{experience.matchScore}% Match</div>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{experience.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>{experience.matchReason}</p>
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{Number(experience.pricePerPerson || 0).toLocaleString()}/guest</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>View Experience <ArrowRight size={14} /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!data.destinations?.length && !data.hotels?.length && !data.experiences?.length && (
            <div className="glass-card" style={styles.emptyState}>
              <Compass size={36} color="var(--color-primary)" />
              <h2>No matches yet</h2>
              <p>Save your Travel DNA preferences or browse the destination catalog to get recommendations tailored to you.</p>
              <div style={styles.emptyActions}>
                <Link to="/travel-dna" className="btn btn-primary">Update Travel DNA</Link>
                <Link to="/destinations" className="btn btn-secondary">Browse destinations</Link>
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.75rem'
  },
  card: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    textDecoration: 'none'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '3rem 1.5rem',
    textAlign: 'center'
  },
  emptyActions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  imgWrapper: {
    position: 'relative',
    height: '180px'
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  matchScoreBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: '#fff',
    padding: '0.35rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: 800
  }
};

export default Recommendations;
