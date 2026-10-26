import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loyaltyService } from '../../services/loyaltyService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import { Award, Gift, Star, CheckCircle, Zap, Shield, Crown, Sparkles, Percent, ArrowRight } from 'lucide-react';

const LoyaltyRewards = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const exclusiveOffers = [
    {
      code: 'OPULENCE30',
      discount: '30% PRIVILEGE DISCOUNT',
      title: 'Royal Palace & Private Villa Suites',
      desc: 'Applicable on 5-star heritage properties across Udaipur, Jaipur, and Goa.',
      tier: 'All Travelers'
    },
    {
      code: 'ROYALGOLD',
      discount: 'COMPLIMENTARY UPGRADE',
      title: 'Complimentary Suite Upgrade & Butler',
      desc: 'Automatic room upgrade to presidential suites upon availability.',
      tier: 'Gold & Above'
    },
    {
      code: 'ELITECHAUFFEUR',
      discount: 'FREE LUXURY TRANSFER',
      title: 'Chauffeured Mercedes Airport Transfer',
      desc: 'Complimentary round-trip VIP airport transfer with every 3-night stay.',
      tier: 'Platinum & VIP'
    },
    {
      code: 'AICONCIERGE',
      discount: '100% COMPLIMENTARY',
      title: 'Bespoke AI Concierge Itinerary Pack',
      desc: 'Free high-touch personalized day-by-day vacation planning.',
      tier: 'All Members'
    }
  ];

  const rewardVouchers = [
    { title: '₹5,000 Palace Dining Credit', points: 300, category: 'Michelin Dining' },
    { title: 'Private Shikara Sunset Cruise Pass', points: 250, category: 'Signature Experience' },
    { title: 'Chauffeured Luxury Car Upgrade', points: 200, category: 'Private Aviation & Cabs' },
    { title: 'Full-Day Ayurvedic Spa Package', points: 350, category: 'Wellness & Spa' }
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await loyaltyService.getProfile();
      setProfile(res.data);
    } catch (err) {
      // Non-blocking for guests
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (!user) {
      showNotification('Please sign in to redeem your reward points', 'info');
      return;
    }
    if (!profile || profile.points < reward.points) {
      showNotification('Insufficient points to redeem this reward voucher', 'warning');
      return;
    }

    try {
      await loyaltyService.redeemPoints(reward.points, reward.title);
      showNotification(`Successfully redeemed: ${reward.title}`, 'success');
      fetchProfile();
    } catch (err) {
      showNotification(err.message || 'Failed to redeem points', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', minHeight: '80vh' }}>
      {/* HEADER BANNER */}
      <div style={styles.header}>
        <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Crown size={14} /> IntelliTrip Elite Circle & Rewards
        </span>
        <h1 style={styles.mainTitle}>Exclusive Offers & Member Privileges</h1>
        <p style={styles.subTitle}>
          Curated luxury perks, private suite discounts, and reward redemption for our distinguished travelers.
        </p>
      </div>

      {/* USER POINTS STATUS CARD (IF LOGGED IN) */}
      {user ? (
        <div style={styles.pointsStatusCard} className="luxury-card">
          <div style={styles.pointsLeft}>
            <div style={styles.tierCrown}>
              <Crown size={28} color="#d4af37" />
            </div>
            <div>
              <span style={styles.welcomeMember}>Welcome, {user.name}</span>
              <h3 style={styles.tierName}>{profile?.tier || 'Gold Elite Member'}</h3>
              <p style={styles.tierDesc}>Earn 10 points for every ₹1,000 spent on bespoke bookings.</p>
            </div>
          </div>

          <div style={styles.pointsRight}>
            <span style={styles.pointsLabel}>AVAILABLE POINTS</span>
            <div style={styles.pointsCount}>{profile?.points || 450} <span style={{ fontSize: '1rem', color: '#bda3c4' }}>PTS</span></div>
          </div>
        </div>
      ) : (
        <div style={styles.guestBanner} className="gold-frame">
          <div style={styles.guestBannerContent}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#f7e7be', fontFamily: 'var(--font-serif)', marginBottom: '0.25rem' }}>
                Join the Private IntelliTrip Elite Circle
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#bda3c4' }}>
                Sign in to track points, earn cashback on luxury stays, and unlock secret palace member rates.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-gold" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Join Elite
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* PROMO CODES & SPECIAL OFFERS */}
      <div style={{ marginTop: '3.5rem' }}>
        <h2 style={styles.sectionHeading}>Exclusive Seasonal Promotional Codes</h2>
        <div style={styles.offersGrid}>
          {exclusiveOffers.map((offer, idx) => (
            <div key={idx} className="luxury-card" style={styles.offerCard}>
              <div style={styles.offerHeader}>
                <span style={styles.discountBadge}>{offer.discount}</span>
                <span style={styles.tierBadge}>{offer.tier}</span>
              </div>
              <h3 style={styles.offerTitle}>{offer.title}</h3>
              <p style={styles.offerDesc}>{offer.desc}</p>
              <div style={styles.codeRow}>
                <span style={styles.codeText}>PROMO CODE: <strong>{offer.code}</strong></span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(offer.code);
                    showNotification(`Copied code ${offer.code} to clipboard!`, 'success');
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
                >
                  Copy Code
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REWARD VOUCHERS CATALOGUE */}
      <div style={{ marginTop: '4rem' }}>
        <h2 style={styles.sectionHeading}>Redeem Elite Points for Vouchers</h2>
        <div style={styles.vouchersGrid}>
          {rewardVouchers.map((v, idx) => (
            <div key={idx} className="luxury-card" style={styles.voucherCard}>
              <span style={styles.voucherCat}>{v.category}</span>
              <h3 style={styles.voucherTitle}>{v.title}</h3>
              <div style={styles.voucherFooter}>
                <span style={styles.voucherPoints}>{v.points} Points</span>
                <button
                  onClick={() => handleRedeem(v)}
                  className="btn btn-gold"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                >
                  {user ? 'Redeem Voucher' : 'Sign In to Redeem'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '2.5rem'
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
    fontSize: '1.05rem',
    color: '#bda3c4',
    maxWidth: '700px'
  },
  pointsStatusCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '2rem',
    background: '#241028',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    flexWrap: 'wrap',
    gap: '1.5rem'
  },
  pointsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  tierCrown: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(212, 175, 55, 0.15)',
    border: '1px solid #d4af37',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  welcomeMember: {
    fontSize: '0.8rem',
    color: '#d4af37',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  tierName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#f7e7be',
    fontFamily: 'var(--font-serif)',
    margin: '0.2rem 0'
  },
  tierDesc: {
    fontSize: '0.82rem',
    color: '#bda3c4'
  },
  pointsRight: {
    textAlign: 'right'
  },
  pointsLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#d4af37',
    letterSpacing: '1px'
  },
  pointsCount: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#f7e7be',
    fontFamily: 'var(--font-serif)'
  },
  guestBanner: {
    padding: '1.5rem',
    background: '#1b0c1e'
  },
  guestBannerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  sectionHeading: {
    fontSize: '1.75rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: 'var(--color-gold-light)',
    marginBottom: '1.5rem'
  },
  offersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  offerCard: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '220px'
  },
  offerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem'
  },
  discountBadge: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#150917',
    background: 'var(--color-gold-gradient)',
    padding: '0.2rem 0.6rem',
    borderRadius: '2px'
  },
  tierBadge: {
    fontSize: '0.7rem',
    color: '#d4af37',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    padding: '0.15rem 0.45rem',
    borderRadius: '2px'
  },
  offerTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    marginBottom: '0.5rem'
  },
  offerDesc: {
    fontSize: '0.85rem',
    color: '#bda3c4',
    lineHeight: 1.4,
    marginBottom: '1rem'
  },
  codeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)'
  },
  codeText: {
    fontSize: '0.78rem',
    color: '#f7e7be'
  },
  vouchersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5rem'
  },
  voucherCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column'
  },
  voucherCat: {
    fontSize: '0.72rem',
    color: '#d4af37',
    fontWeight: '700',
    letterSpacing: '0.5px',
    marginBottom: '0.35rem'
  },
  voucherTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    fontFamily: 'var(--font-serif)',
    color: '#f8fafc',
    marginBottom: '1.25rem'
  },
  voucherFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)'
  },
  voucherPoints: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#d4af37'
  }
};

export default LoyaltyRewards;
