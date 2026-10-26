import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  UserPlus, Mail, Lock, User, Phone, Shield, AlertCircle,
  Compass, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight,
  ArrowLeft, Sparkles, Crown, BadgeCheck
} from 'lucide-react';

const ROLES = [
  { value: 'Tourist', label: 'Tourist', icon: '\u2708\uFE0F', desc: 'Explore & book bespoke experiences' },
  { value: 'Tour Guide', label: 'Tour Guide', icon: '\u{1F9ED}', desc: 'Lead curated cultural journeys' },
  { value: 'Hotel Owner', label: 'Hotel Owner', icon: '\u{1F3E8}', desc: 'List & manage luxury properties' },
  { value: 'Travel Agency', label: 'Travel Agency', icon: '\u{1F30D}', desc: 'Craft exclusive travel packages' },
  { value: 'Transport Provider', label: 'Transport Provider', icon: '\u{1F697}', desc: 'Offer premium fleet services' },
  { value: 'Local Business Owner', label: 'Local Business', icon: '\u{1F6CD}\uFE0F', desc: 'Showcase authentic local offerings' },
  { value: 'Tourism Department Admin', label: 'Tourism Admin', icon: '\u{1F3DB}\uFE0F', desc: 'Oversee regional tourism operations' },
  { value: 'Support Executive', label: 'Support Executive', icon: '\u{1F3A7}', desc: 'Deliver white-glove guest support' },
  { value: 'Super Admin', label: 'Super Admin', icon: '\u{1F451}', desc: 'Full platform governance & control' },
];

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '#444' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Very Weak', color: '#f43f5e' };
  if (score === 2) return { score, label: 'Weak', color: '#f97316' };
  if (score === 3) return { score, label: 'Fair', color: '#f59e0b' };
  if (score === 4) return { score, label: 'Strong', color: '#10b981' };
  return { score, label: 'Very Strong', color: '#d4af37' };
};

const FieldGroup = ({ label, icon, error, children }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={styles.inputIcon}>{icon}</span>
      {children}
    </div>
    {error && (
      <span style={styles.fieldError}>
        <AlertCircle size={11} /> {error}
      </span>
    )}
  </div>
);

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: location.state?.role || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [animating, setAnimating] = useState(false);
  const { register, loading } = useAuth();
  const { showNotification } = useNotification();

  const pwStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleBlur = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const errors = {
    role: !formData.role ? 'Please select a role to continue' : '',
    name: !formData.name.trim() ? 'Full name is required' : formData.name.trim().length < 2 ? 'At least 2 characters' : '',
    email: !formData.email ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Enter a valid email' : '',
    password: !formData.password ? 'Password is required' : formData.password.length < 6 ? 'Minimum 6 characters' : '',
    confirmPassword: !formData.confirmPassword ? 'Please confirm your password' : formData.confirmPassword !== formData.password ? 'Passwords do not match' : '',
    phone: formData.phone && !/^[\+\d\s\-()]{7,15}$/.test(formData.phone) ? 'Enter a valid phone number' : '',
  };

  const goToStep = (next) => {
    setAnimating(true);
    setTimeout(() => { setStep(next); setAnimating(false); }, 220);
  };

  const handleNext = () => {
    if (step === 1) {
      setTouched((t) => ({ ...t, role: true }));
      if (errors.role) return;
      goToStep(2);
    } else if (step === 2) {
      setTouched((t) => ({ ...t, name: true, email: true }));
      if (errors.name || errors.email) return;
      goToStep(3);
    }
  };

  const handleBack = () => goToStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true, phone: true });
    if (errors.name || errors.email || errors.password || errors.confirmPassword || errors.phone) return;
    setErrorMsg('');
    try {
      const { confirmPassword, ...payload } = formData;
      const data = await register(payload);
      showNotification(`Welcome to IntelliTrip, ${data?.name || formData.name}! 🎉`, 'success');
      if (data.role === 'Super Admin' || data.role === 'Tourism Department Admin') {
        navigate('/admin/dashboard');
      } else if (['Tour Guide', 'Hotel Owner', 'Travel Agency', 'Transport Provider', 'Local Business Owner', 'Support Executive'].includes(data.role)) {
        navigate('/vendor/dashboard');
      } else if (data.role === 'Tourist') {
        const nextPath = location.state?.returnTo || '/recommendations';
        navigate(`/travel-dna?next=${encodeURIComponent(nextPath)}`);
      } else {
        navigate('/tourist/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your inputs and try again.');
    }
  };

  const selectedRole = ROLES.find(r => r.value === formData.role);

  return (
    <div style={styles.container}>
      <div style={styles.orbTopLeft} />
      <div style={styles.orbBottomRight} />
      <div style={styles.card} className="animate-fade-in">
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Compass size={26} color="#150917" />
          </div>
          <h2 style={styles.title}>Create Your Account</h2>
          <p style={styles.subtitle}>Plan smarter trips with AI itineraries, exclusive deals &amp; seamless bookings</p>
        </div>

        <div style={styles.stepRow}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div style={{ ...styles.stepDot, ...(step >= s ? styles.stepDotActive : {}) }}>
                {step > s
                  ? <CheckCircle2 size={12} color="#150917" />
                  : <span style={styles.stepNum}>{s}</span>}
              </div>
              {s < 3 && <div style={{ ...styles.stepLine, ...(step > s ? styles.stepLineActive : {}) }} />}
            </React.Fragment>
          ))}
        </div>
        <p style={styles.stepLabel}>
          {step === 1 ? 'Choose Your Role' : step === 2 ? 'Account Basics' : 'Secure Password'}
        </p>

        {errorMsg && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} color="#f43f5e" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ ...styles.stepContent, opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)', transition: 'opacity 0.22s ease, transform 0.22s ease' }}>

            {step === 2 && (
              <div style={styles.fieldsGroup}>
                <FieldGroup label="Full Name" icon={<User size={15} color="#d4af37" />} error={touched.name ? errors.name : ''}>
                  <input
                    type="text" name="name" autoFocus required
                    value={formData.name} onChange={handleChange} onBlur={() => handleBlur('name')}
                    placeholder="Lord Julian Sterling"
                    style={{ ...styles.input, ...(touched.name && errors.name ? styles.inputError : touched.name && !errors.name ? styles.inputSuccess : {}) }}
                  />
                  {touched.name && !errors.name && <CheckCircle2 size={14} color="#10b981" style={styles.validIcon} />}
                </FieldGroup>

                <FieldGroup label="Email Address" icon={<Mail size={15} color="#d4af37" />} error={touched.email ? errors.email : ''}>
                  <input
                    type="email" name="email" required
                    value={formData.email} onChange={handleChange} onBlur={() => handleBlur('email')}
                    placeholder="sterling@luxury.com"
                    style={{ ...styles.input, ...(touched.email && errors.email ? styles.inputError : touched.email && !errors.email ? styles.inputSuccess : {}) }}
                  />
                  {touched.email && !errors.email && <CheckCircle2 size={14} color="#10b981" style={styles.validIcon} />}
                </FieldGroup>

                <FieldGroup label="Phone (Optional - VIP WhatsApp Updates)" icon={<Phone size={15} color="#d4af37" />} error={touched.phone ? errors.phone : ''}>
                  <input
                    type="text" name="phone"
                    value={formData.phone} onChange={handleChange} onBlur={() => handleBlur('phone')}
                    placeholder="+91 98765 43210"
                    style={{ ...styles.input, ...(touched.phone && errors.phone ? styles.inputError : {}) }}
                  />
                </FieldGroup>

                <button type="button" onClick={handleNext} className="btn btn-gold" style={styles.nextBtn}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step === 3 && (
              <div style={styles.fieldsGroup}>
                <FieldGroup label="Password" icon={<Lock size={15} color="#d4af37" />} error={touched.password ? errors.password : ''}>
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" autoFocus required minLength={6}
                    value={formData.password} onChange={handleChange} onBlur={() => handleBlur('password')}
                    placeholder="Minimum 6 characters"
                    style={{ ...styles.input, paddingRight: '2.8rem', ...(touched.password && errors.password ? styles.inputError : touched.password && !errors.password ? styles.inputSuccess : {}) }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} tabIndex={-1}>
                    {showPassword ? <EyeOff size={15} color="#8e7894" /> : <Eye size={15} color="#8e7894" />}
                  </button>
                </FieldGroup>

                {formData.password && (
                  <div style={styles.strengthContainer}>
                    <div style={styles.strengthBarRow}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ ...styles.strengthSegment, background: i <= pwStrength.score ? pwStrength.color : 'rgba(255,255,255,0.08)', transition: 'background 0.3s ease' }} />
                      ))}
                    </div>
                    <span style={{ ...styles.strengthLabel, color: pwStrength.color }}>{pwStrength.label}</span>
                  </div>
                )}

                <div style={styles.pwHints}>
                  {[
                    { check: formData.password.length >= 8, text: '8+ characters' },
                    { check: /[A-Z]/.test(formData.password), text: 'Uppercase letter' },
                    { check: /[0-9]/.test(formData.password), text: 'Number' },
                    { check: /[^A-Za-z0-9]/.test(formData.password), text: 'Special character' },
                  ].map(({ check, text }) => (
                    <div key={text} style={styles.pwHint}>
                      {check ? <CheckCircle2 size={11} color="#10b981" /> : <XCircle size={11} color="#38143f" />}
                      <span style={{ color: check ? '#10b981' : '#8e7894' }}>{text}</span>
                    </div>
                  ))}
                </div>

                <FieldGroup label="Confirm Password" icon={<Shield size={15} color="#d4af37" />} error={touched.confirmPassword ? errors.confirmPassword : ''}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" required
                    value={formData.confirmPassword} onChange={handleChange} onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Repeat your password"
                    style={{ ...styles.input, paddingRight: '2.8rem', ...(touched.confirmPassword && errors.confirmPassword ? styles.inputError : touched.confirmPassword && !errors.confirmPassword ? styles.inputSuccess : {}) }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn} tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff size={15} color="#8e7894" /> : <Eye size={15} color="#8e7894" />}
                  </button>
                </FieldGroup>

                <div style={styles.navRow}>
                  <button type="button" onClick={handleBack} style={styles.backBtn}>
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-gold" style={styles.nextBtnSm}>
                    {loading ? <><span style={styles.spinner} /> Creating...</> : <><UserPlus size={15} /> Create Account</>}
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={styles.fieldsGroup}>
                <p style={styles.roleHeading}>
                  <Crown size={14} color="#d4af37" style={{ marginRight: 6 }} />
                  Choose your membership profile
                </p>

                <div style={styles.roleGrid}>
                  {ROLES.map((role) => (
                    <button
                      key={role.value} type="button"
                      onClick={() => setFormData({ ...formData, role: role.value })}
                      style={{ ...styles.roleCard, ...(formData.role === role.value ? styles.roleCardActive : {}) }}
                    >
                      <span style={styles.roleEmoji}>{role.icon}</span>
                      <span style={styles.roleLabel}>{role.label}</span>
                      {formData.role === role.value && <BadgeCheck size={12} color="#d4af37" style={{ flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>

                {selectedRole && (
                  <div style={styles.roleDescBox}>
                    <Sparkles size={13} color="#d4af37" />
                    <span>{selectedRole.desc}</span>
                  </div>
                )}

                {touched.role && errors.role && <span style={styles.fieldError}><AlertCircle size={11} /> {errors.role}</span>}

                <button type="button" onClick={handleNext} className="btn btn-gold" style={styles.submitBtn}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" state={location.state} style={styles.link}>Sign In Here</Link>
          </p>
        </div>
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
    position: 'relative', zIndex: 1, width: '100%', maxWidth: '520px',
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
  stepRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '0.4rem' },
  stepDot: {
    width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(56,20,63,0.6)',
    border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'all 0.3s ease', flexShrink: 0,
  },
  stepDotActive: {
    background: 'var(--color-gold-gradient)', border: '1px solid rgba(212,175,55,0.7)',
    boxShadow: '0 0 10px rgba(212,175,55,0.4)',
  },
  stepNum: { fontSize: '0.7rem', fontWeight: '700', color: '#bda3c4' },
  stepLine: { width: '48px', height: '2px', background: 'rgba(212,175,55,0.12)', transition: 'background 0.3s ease' },
  stepLineActive: { background: 'rgba(212,175,55,0.5)' },
  stepLabel: {
    textAlign: 'center', fontSize: '0.7rem', color: '#d4af37',
    fontWeight: '700', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '1.5rem',
  },
  errorBox: {
    background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.28)',
    padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.83rem',
    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem',
  },
  stepContent: { minHeight: '200px' },
  fieldsGroup: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.7rem', fontWeight: '700', color: '#d4af37', letterSpacing: '0.5px', textTransform: 'uppercase' },
  inputIcon: { position: 'absolute', left: '13px', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 1 },
  input: {
    width: '100%', padding: '0.72rem 0.75rem 0.72rem 2.5rem', borderRadius: '6px',
    border: '1px solid rgba(212,175,55,0.18)', background: 'rgba(15, 7, 18, 0.75)',
    color: '#f8fafc', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  inputError: { borderColor: 'rgba(244,63,94,0.55)', boxShadow: '0 0 0 2px rgba(244,63,94,0.1)' },
  inputSuccess: { borderColor: 'rgba(16,185,129,0.45)', boxShadow: '0 0 0 2px rgba(16,185,129,0.07)' },
  validIcon: { position: 'absolute', right: '12px' },
  eyeBtn: { position: 'absolute', right: '12px', background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', zIndex: 2 },
  fieldError: { display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: '#f43f5e', marginTop: '0.1rem' },
  strengthContainer: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '-0.25rem' },
  strengthBarRow: { display: 'flex', gap: '4px', flex: 1 },
  strengthSegment: { flex: 1, height: '4px', borderRadius: '2px' },
  strengthLabel: { fontSize: '0.71rem', fontWeight: '700', letterSpacing: '0.3px', whiteSpace: 'nowrap', minWidth: '72px', textAlign: 'right' },
  pwHints: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 1rem' },
  pwHint: { display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem' },
  nextBtn: { width: '100%', padding: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
  nextBtnSm: { padding: '0.7rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' },
  navRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' },
  backBtn: { background: 'none', border: 'none', color: '#8e7894', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', padding: '0.4rem 0', transition: 'color 0.2s ease' },
  backBtnCentered: { background: 'none', border: 'none', color: '#8e7894', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', cursor: 'pointer', padding: '0.3rem', margin: '0 auto', transition: 'color 0.2s ease' },
  roleHeading: { display: 'flex', alignItems: 'center', fontSize: '0.76rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '-0.25rem' },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', maxHeight: '230px', overflowY: 'auto', paddingRight: '2px' },
  roleCard: {
    position: 'relative', background: 'rgba(31,14,34,0.6)', border: '1px solid rgba(212,175,55,0.15)',
    borderRadius: '6px', padding: '0.55rem 0.7rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left',
    transition: 'all 0.2s ease', color: '#bda3c4', fontSize: '0.78rem', fontWeight: '500',
  },
  roleCardActive: { background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.5)', color: '#f7e7be', boxShadow: '0 0 12px rgba(212,175,55,0.18)' },
  roleEmoji: { fontSize: '0.95rem', lineHeight: 1, flexShrink: 0 },
  roleLabel: { flex: 1, lineHeight: 1.3 },
  roleDescBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212,175,55,0.06)',
    border: '1px solid rgba(212,175,55,0.18)', borderRadius: '6px', padding: '0.55rem 0.85rem',
    fontSize: '0.77rem', color: '#bda3c4', fontStyle: 'italic',
  },
  submitBtn: { width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' },
  spinner: { display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(21,9,23,0.3)', borderTopColor: '#150917', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  footer: { textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(212,175,55,0.12)' },
  footerText: { fontSize: '0.83rem', color: '#8e7894' },
  link: { color: '#d4af37', fontWeight: '700', textDecoration: 'underline' },
};

export default Register;
