import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import BackButton from '../../components/common/BackButton';
import { Dna, Save, Sparkles, Award, Sliders, CheckCircle } from 'lucide-react';

const TravelDNA = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState({
    adventure: 75,
    nature: 80,
    culture: 60,
    food: 85,
    relaxation: 65,
    luxury: 50,
    budget: 70,
    photography: 80
  });
  const [primaryStyle, setPrimaryStyle] = useState('Adventure & Nature Seeker');

  useEffect(() => {
    fetchTravelDNA();
  }, []);

  const fetchTravelDNA = async () => {
    setLoading(true);
    try {
      const res = await aiService.getTravelDNA();
      if (res.data && res.data.scores) {
        setScores(res.data.scores);
        setPrimaryStyle(res.data.primaryStyle || computePersona(res.data.scores));
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load Travel DNA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const computePersona = (currentScores) => {
    if (currentScores.adventure > 80) return 'Thrill & High Adventure Seeker';
    if (currentScores.nature > 80) return 'Wild Alpine & Nature Explorer';
    if (currentScores.culture > 80) return 'Heritage & Culture Enthusiast';
    if (currentScores.food > 80) return 'Culinary & Street Food Connoisseur';
    if (currentScores.luxury > 80) return 'Luxury & Elite Resort Connoisseur';
    return 'Balanced Cultural Explorer';
  };

  const handleSliderChange = (category, value) => {
    const updated = { ...scores, [category]: Number(value) };
    setScores(updated);
    setPrimaryStyle(computePersona(updated));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await aiService.updateTravelDNA(scores, primaryStyle);
      showNotification('Travel DNA profile saved successfully!', 'success');
      const nextPath = new URLSearchParams(location.search).get('next');
      navigate(nextPath || `/recommendations?updated=${Date.now()}`, { replace: true });
    } catch (err) {
      showNotification(err.message || 'Failed to save Travel DNA', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen message="Computing your Travel DNA profile..." />;

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <BackButton to="/tourist/dashboard" />
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Dna size={14} color="var(--color-primary)" /> Behavioral Profiling Engine
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem' }}>
          Your Travel DNA Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Visual preference breakdown across 8 key dimensions used by Gemini AI to personalize recommendations and itineraries.
        </p>
      </div>

      <div style={styles.grid}>
        {/* Left Column: Visual DNA Card */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={styles.personaIcon}>
              <Award size={28} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Primary Travel Persona</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>{primaryStyle}</h2>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Your DNA score reflects a strong affinity for high-altitude trekking, authentic local dining, and scenic photography.
          </p>

          <div style={styles.dnaList}>
            {Object.entries(scores).map(([cat, val]) => (
              <div key={cat} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                  <span>{cat}</span>
                  <span>{val}%</span>
                </div>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${val}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem' }}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Travel DNA'}
          </button>
        </div>

        {/* Right Column: Interactive Sliders */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sliders size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Fine-Tune Preferences</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Object.entries(scores).map(([cat, val]) => (
              <div key={cat} style={styles.sliderGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  <span>{cat} Priority</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{val}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  onChange={(e) => handleSliderChange(cat, e.target.value)}
                  style={styles.slider}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem'
  },
  personaIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)'
  },
  dnaList: {
    background: '#f8fafc',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    border: '1px solid var(--border-color)'
  },
  barTrack: {
    width: '100%',
    height: '8px',
    background: '#e2e8f0',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
    borderRadius: '9999px',
    transition: 'width 0.3s ease'
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  slider: {
    width: '100%',
    cursor: 'pointer'
  }
};

export default TravelDNA;
