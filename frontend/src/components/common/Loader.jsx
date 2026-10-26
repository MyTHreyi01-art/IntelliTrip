import React from 'react';

const Loader = ({ fullScreen = false, message = 'Loading IntelliTrip...' }) => {
  const content = (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message}</p>
    </div>
  );

  if (fullScreen) {
    return <div style={styles.fullScreenOverlay}>{content}</div>;
  }

  return content;
};

const styles = {
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1rem'
  },
  fullScreenOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--color-primary-light)',
    borderTop: '4px solid var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  message: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
  }
};

// Add CSS keyframe rule dynamically if needed
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default Loader;
