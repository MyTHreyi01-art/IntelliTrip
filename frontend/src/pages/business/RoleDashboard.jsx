import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { analyticsService } from '../../services/analyticsService';
import { emergencyService } from '../../services/emergencyService';
import Loader from '../../components/common/Loader';
import {
  LayoutDashboard,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  ShieldAlert,
  BarChart2,
  CheckCircle,
  PlusCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RoleDashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getOverview();
      setAnalytics(res.data);

      if (
        user &&
        (user.role === 'Support Executive' ||
          user.role === 'Tourism Department Admin' ||
          user.role === 'Super Admin')
      ) {
        const sosRes = await emergencyService.getEmergencyAlerts();
        setEmergencyAlerts(sosRes.data || []);
      }
    } catch (err) {
      showNotification(err.message || 'Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlertStatus = async (id, status) => {
    try {
      await emergencyService.updateAlertStatus(id, { status });
      showNotification(`SOS alert status updated to ${status}`, 'success');
      fetchDashboardData();
    } catch (err) {
      showNotification(err.message || 'Failed to update alert', 'error');
    }
  };

  if (!user) return null;

  const role = user.role || 'Vendor';

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <LayoutDashboard size={14} /> Enterprise Role Portal
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.25rem' }}>
            {role} Workspace
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Dedicated operational hub for {role} management, booking controls, and analytics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/business/listings" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={16} /> Manage Service Listings
          </Link>
          <Link to="/ai-advanced" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="var(--color-accent)" /> Python ML Analytics
          </Link>
        </div>
      </div>

      {loading ? (
        <Loader message={`Initializing ${role} operational analytics...`} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Key Metric Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Platform Bookings</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {analytics?.summary?.totalBookings || 0}
              </h2>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Gross Revenue</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
                ₹{(analytics?.summary?.totalRevenue || 12450).toLocaleString()}
              </h2>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Destinations</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                {analytics?.summary?.totalDestinations || 0}
              </h2>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered Users & Partners</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                {analytics?.summary?.totalUsers || 0}
              </h2>
            </div>
          </div>

          {/* Role Specific Section */}

          {/* 1. TOURISM DEPARTMENT ADMIN & SUPPORT EXECUTIVE: EMERGENCY SOS MONITOR */}
          {(role === 'Tourism Department Admin' || role === 'Support Executive' || role === 'Super Admin') && (
            <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={22} /> Active Tourist Emergency SOS Dispatch Board
              </h3>

              {emergencyAlerts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No active emergency SOS alerts reported.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {emergencyAlerts.map((alert) => (
                    <div key={alert._id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#ef4444' }}>[{alert.type}] {alert.userName}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>
                          Location: {alert.location} • Phone: {alert.userPhone} • Date: {new Date(alert.createdAt).toLocaleString()}
                        </span>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{alert.notes}</p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${alert.status === 'Resolved' ? 'badge-success' : 'badge-danger'}`}>
                          {alert.status}
                        </span>
                        {alert.status !== 'Resolved' && (
                          <button onClick={() => handleUpdateAlertStatus(alert._id, 'Resolved')} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. HOTEL OWNER / TRAVEL AGENCY / TRANSPORT / GUIDES SPECIFIC OPERATIONS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
                {role} Operational Schedule & Active Bookings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Upcoming Confirmed Tourist Reservation</strong>
                    <span className="badge badge-success">Confirmed</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Service: {role === 'Hotel Owner' ? 'Luxury Heritage Room' : role === 'Tour Guide' ? 'Historical Palace Tour' : 'Airport Transport'}
                  </p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: Tomorrow, 10:00 AM • Guests: 2 Adults</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Group Tour Allocation</strong>
                    <span className="badge badge-primary">In Progress</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Location: Mysore & Coorg Circuit • Capacity: 8/10 Slots Filled
                  </p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Managed by: {user.name}</span>
                </div>
              </div>
            </div>

            {/* 3. MONTHLY DEMAND & REVENUE ANALYTICS */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 color="var(--color-primary)" size={20} /> Demand Trend Analytics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analytics?.monthlyTrends && analytics.monthlyTrends.map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>{t.month} Peak Demand</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${t.demandIndex}%`, height: '100%', background: 'var(--color-primary)' }} />
                      </div>
                      <strong>{t.demandIndex}% Index</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleDashboard;
