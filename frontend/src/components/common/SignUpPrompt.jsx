import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, X } from 'lucide-react';

const SignUpPrompt = ({ open, onClose, returnTo, title = 'Sign In to IntelliTrip', message = 'Please sign in to confirm and save your booking. If you do not have an account yet, you can sign up in seconds.' }) => {
  if (!open) return null;

  const authState = { returnTo };

  return (
    <div style={styles.overlay} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="signin-prompt-title" style={styles.dialog}>
        <button type="button" onClick={onClose} aria-label="Close prompt" style={styles.closeButton}>
          <X size={18} />
        </button>
        <div style={styles.icon}><LogIn size={22} /></div>
        <h2 id="signin-prompt-title" style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
        <Link to="/login" state={authState} className="btn btn-gold" style={styles.primaryAction}>
          Sign In
        </Link>
        <Link to="/register" state={authState} style={styles.loginLink}>
          Don't have an account? Sign up
        </Link>
        <button type="button" onClick={onClose} style={styles.dismissButton}>Not now</button>
      </section>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    background: 'rgba(8, 12, 18, 0.78)'
  },
  dialog: {
    position: 'relative',
    width: '100%',
    maxWidth: '430px',
    padding: '2rem',
    borderRadius: '6px',
    border: '1px solid rgba(212, 175, 55, 0.5)',
    background: '#171b22',
    color: '#f8fafc',
    boxShadow: '0 24px 70px rgba(0, 0, 0, 0.5)',
    textAlign: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: '0.85rem',
    right: '0.85rem',
    display: 'grid',
    placeItems: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '4px',
    color: '#dbe2ea',
    background: 'transparent'
  },
  icon: {
    display: 'grid',
    placeItems: 'center',
    width: '48px',
    height: '48px',
    margin: '0 auto 1rem',
    borderRadius: '50%',
    color: '#171b22',
    background: '#d4af37'
  },
  title: { color: '#f8fafc', fontSize: '1.35rem', marginBottom: '0.5rem' },
  message: { color: '#c5cbd3', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.35rem' },
  primaryAction: { width: '100%', marginBottom: '0.9rem' },
  loginLink: { display: 'block', color: '#f1d578', fontSize: '0.85rem', marginBottom: '0.7rem' },
  dismissButton: { padding: '0.45rem 0.8rem', color: '#b8c0ca', background: 'transparent', fontSize: '0.82rem' }
};

export default SignUpPrompt;