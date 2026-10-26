import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import { User, Mail, Shield, Phone, FileText, Lock, Save, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth();
  const { showNotification } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { name, phone, bio };
      if (password.trim().length > 0) {
        payload.password = password;
      }

      const updated = await authService.updateProfile(payload);
      showNotification('Profile updated successfully!', 'success');
      setPassword('');
    } catch (error) {
      showNotification(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>User Profile Settings</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span className="badge badge-primary">{user?.role || 'Tourist'}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Registered Account
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={18} color="var(--text-muted)" style={styles.inputIcon} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email Address (Read-only)</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="var(--text-muted)" style={styles.inputIcon} />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  style={{ ...styles.input, background: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.inputWrapper}>
                <Phone size={18} color="var(--text-muted)" style={styles.inputIcon} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 019 2831"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Bio / Personal Note</label>
              <div style={styles.inputWrapper}>
                <FileText size={18} color="var(--text-muted)" style={styles.inputIcon} />
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your travel interests..."
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>New Password (leave blank to keep current)</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="var(--text-muted)" style={styles.inputIcon} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem' }}>
              <Save size={18} />
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-main)'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px'
  },
  input: {
    width: '100%',
    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    fontSize: '0.9rem',
    outline: 'none'
  }
};

export default Profile;
