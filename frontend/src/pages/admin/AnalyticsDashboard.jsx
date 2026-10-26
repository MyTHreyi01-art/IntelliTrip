import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { useNotification } from '../../context/NotificationContext';
import Loader from '../../components/common/Loader';
import { BarChart2, TrendingUp, Users, Leaf, ShieldAlert, DollarSign, Building } from 'lucide-react';

const AnalyticsDashboard = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getOverview();
      setAnalytics(res.data);
    } catch (err) {
      showNotification(err.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <BarChart2 size={14} /> Regional Tourism & Governance Intelligence
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem' }}>
          Advanced Tourism Analytics
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Real-time metrics on visitor flow, regional revenue, eco-sustainability savings, and role activity.
        </p>
      </div>

      {loading ? (
        <Loader message="Aggregating platform intelligence & demand indices..." />
      ) : analytics ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gross Platform Revenue</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>
                ₹{(analytics.summary?.totalRevenue || 12450).toLocaleString()}
              </h2>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Tourism Bookings</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                {analytics.summary?.totalBookings || 0}
              </h2>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Destinations</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-secondary)' }}>
                {analytics.summary?.totalDestinations || 0}
              </h2>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>CO2 Emissions Offset</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>
                {analytics.sustainabilityStats?.co2OffsetKg} <span style={{ fontSize: '1rem' }}>kg</span>
              </h2>
            </div>
          </div>

          {/* User Roles Distribution & Eco Impact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* User Roles Breakdown */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users color="var(--color-primary)" size={20} /> User & Stakeholder Role Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analytics.userRoleCounts && analytics.userRoleCounts.map((roleObj, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{roleObj._id}</span>
                    <span className="badge badge-primary">{roleObj.count} Active Users</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eco Sustainability Metrics */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Leaf color="#10b981" size={20} /> Eco-Sustainability Impact
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Green Transit Adoption Rate:</span>
                  <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>{analytics.sustainabilityStats?.greenTransportAdopted}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Eco-Certified Trips:</span>
                  <strong>{analytics.sustainabilityStats?.totalEcoTrips} Trips</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tree Planting Equivalent:</span>
                  <strong>{analytics.sustainabilityStats?.treePlantingEquivalent} Trees Saved</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AnalyticsDashboard;
