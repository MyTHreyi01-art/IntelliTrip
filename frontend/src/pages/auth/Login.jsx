import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LogIn, Mail, Lock, AlertCircle, Compass, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unregisteredEmail, setUnregisteredEmail] = useState('');
  const [touched, setTouched] = useState({});
  const { login, loading } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const errors = {
    email: !email ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email' : '',
    password: !password ? 'Password is required' : '',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;
    setErrorMsg('');
    setUnregisteredEmail('');

    try {
      const data = await login(email, password);
      showNotification(`Welcome back, ${data.name || 'Discerning Traveler'}!`, 'success');
      if (location.state?.returnTo && data.role === 'Tourist') {
        navigate(location.state.returnTo);
      } else if (data.role === 'Super Admin' || data.role === 'Tourism Department Admin') {
        navigate('/admin/dashboard');
      } else if (['Tour Guide', 'Hotel Owner', 'Travel Agency', 'Transport Provider', 'Local Business Owner', 'Support Executive'].includes(data.role)) {
        navigate('/vendor/dashboard');
      } else {
        navigate('/tourist/dashboard');
      }
    } catch (err) {
      if (err.userExists === false || (err.message && err.message.toLowerCase().includes('no account found'))) {
        setUnregisteredEmail(email.trim());
        setErrorMsg('We couldn’t find an account matching this email.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.orbTopLeft} />
      <div style={styles.orbBottomRight} />

      <div style={styles.card} className="animate-fade-in">
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Compass size={26} color="#150917" />
          </div>
          <h2 style={styles.title}>Sign In to IntelliTrip</h2>
          <p style={styles.subtitle}>Access your itineraries, bookings &amp; travel tools</p>
        </div>

        {unregisteredEmail ? (
          <div style={styles.suggestionBox}>
            <div style={styles.suggestionHeader}>
              <UserPlus size={18} color="#d4af37" />
              <span style={styles.suggestionTitle}>No Account Found</span>
            </div>
            <p style={styles.suggestionText}>
              There is no account registered with <strong>{unregisteredEmail}</strong>. Would you like to create one now?
            </p>
            <Link
              to="/register"
              state={{ email: unregisteredEmail, returnTo: location.state?.returnTo }}
              className="btn btn-gold"
              style={styles.suggestionBtn}
            >
              Sign Up with this Email <ArrowRight size={15} />
            </Link>
          </div>
        ) : errorMsg ? (
          <div style={styles.errorBox}>
            <AlertCircle size={16} color="#f43f5e" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={15} color="#d4af37" style={styles.inputIcon} />
              <input
                type="email" required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); setUnregisteredEmail(''); }}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                placeholder="sterling@luxury.com"
                style={{ ...styles.input, ...(touched.email && errors.email ? styles.inputError : touched.email && !errors.email ? styles.inputSuccess : {}) }}
              />
            </div>
            {touched.email && errors.email && (
              <span style={styles.fieldError}><AlertCircle size={11} /> {errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div style={styles.field}>
            <div style={styles.pwLabelRow}>
              <label style={styles.label}>Password</label>
              <button
                type="button"
                onClick={() => showNotification('Password recovery is not configured yet. Please contact IntelliTrip support.', 'info')}
                style={styles.forgotLink}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={15} color="#d4af37" style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'} required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                placeholder="Enter your password"
                style={{ ...styles.input, paddingRight: '2.8rem', ...(touched.password && errors.password ? styles.inputError : touched.password && !errors.password ? styles.inputSuccess : {}) }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} tabIndex={-1}>
                {showPassword ? <EyeOff size={15} color="#8e7894" /> : <Eye size={15} color="#8e7894" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <span style={styles.fieldError}><AlertCircle size={11} /> {errors.password}</span>
            )}
          </div>

          {/* Remember me */}
          <label style={styles.rememberRow}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.rememberText}>Remember me on this device</span>
          </label>

          <button type="submit" disabled={loading} className="btn btn-gold" style={styles.submitBtn}>
            {loading ? (
              <><span style={styles.spinner} /> Authenticating...</>
            ) : (
              <><LogIn size={16} /> Sign In</>
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>Don't have an account?</span>
          <div style={styles.dividerLine} />
        </div>

        <Link
          to="/register"
          state={{ email: email.trim() || undefined, returnTo: location.state?.returnTo }}
          className="btn btn-secondary"
          style={styles.registerBtn}
        >
          Sign Up for Free
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '3rem 1rem', background: '#0f0712', position: 'relative', overflow: 'hidden',
  },
  orbTopLeft: {
    position: 'fixed', top: '-10rem', left: '-10rem', width: '38rem', height: '38rem',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,20,63,0.45) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  orbBottomRight: {
    position: 'fixed', bottom: '-12rem', right: '-8rem', width: '36rem', height: '36rem',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(92,24,59,0.35) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  card: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px',
    padding: '2.5rem 2.25rem', background: 'rgba(21, 9, 23, 0.97)',
    border: '1px solid rgba(212, 175, 55, 0.38)', borderRadius: '10px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(212,175,55,0.1)',
    backdropFilter: 'blur(20px)',
  },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  iconCircle: {
    width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-gold-gradient)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem auto', boxShadow: '0 4px 20px rgba(212,175,55,0.45)',
  },
  title: {
    fontSize: '1.7rem', fontWeight: '700', fontFamily: 'var(--font-serif)',
    color: 'var(--color-gold-light)', marginBottom: '0.3rem', lineHeight: 1.2,
  },
  subtitle: { fontSize: '0.82rem', color: '#bda3c4', lineHeight: 1.5 },
  errorBox: {
    background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.28)',
    padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.83rem',
    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem',
  },
  suggestionBox: {
    background: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    borderRadius: '8px',
    padding: '1.1rem 1.15rem',
    marginBottom: '1.35rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  suggestionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  suggestionTitle: {
    color: '#f7e7be',
    fontWeight: '700',
    fontSize: '0.92rem',
    letterSpacing: '0.3px',
  },
  suggestionText: {
    color: '#d6c7db',
    fontSize: '0.83rem',
    lineHeight: 1.5,
    margin: 0,
  },
  suggestionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1rem',
    fontSize: '0.84rem',
    fontWeight: '700',
    marginTop: '0.3rem',
    borderRadius: '4px',
    textDecoration: 'none',
    boxShadow: '0 3px 12px rgba(212, 175, 55, 0.35)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.15rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.7rem', fontWeight: '700', color: '#d4af37', letterSpacing: '0.5px', textTransform: 'uppercase' },
  pwLabelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  forgotLink: {
    background: 'none', border: 'none', color: '#8e7894', fontSize: '0.72rem',
    cursor: 'pointer', padding: 0, transition: 'color 0.2s ease',
  },
  inputIcon: { position: 'absolute', left: '13px', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 1 },
  input: {
    width: '100%', padding: '0.72rem 0.75rem 0.72rem 2.5rem', borderRadius: '6px',
    border: '1px solid rgba(212,175,55,0.18)', background: 'rgba(15, 7, 18, 0.75)',
    color: '#f8fafc', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  inputError: { borderColor: 'rgba(244,63,94,0.55)', boxShadow: '0 0 0 2px rgba(244,63,94,0.1)' },
  inputSuccess: { borderColor: 'rgba(16,185,129,0.45)', boxShadow: '0 0 0 2px rgba(16,185,129,0.07)' },
  eyeBtn: { position: 'absolute', right: '12px', background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', zIndex: 2 },
  fieldError: { display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: '#f43f5e', marginTop: '0.1rem' },
  rememberRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '-0.25rem' },
  checkbox: { accentColor: '#d4af37', width: '14px', height: '14px', cursor: 'pointer' },
  rememberText: { fontSize: '0.8rem', color: '#8e7894' },
  submitBtn: {
    width: '100%', padding: '0.85rem', marginTop: '0.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  },
  spinner: { display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(21,9,23,0.3)', borderTopColor: '#150917', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  divider: { display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0 1rem' },
  dividerLine: { flex: 1, height: '1px', background: 'rgba(212,175,55,0.12)' },
  dividerText: { fontSize: '0.75rem', color: '#8e7894', whiteSpace: 'nowrap' },
  registerBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', padding: '0.8rem', textDecoration: 'none',
    fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px',
  },
};

export default Login;
