import React from 'react';
import { Sparkles, Construction } from 'lucide-react';

const PlaceholderPage = ({ title, phase }) => {
  return (
    <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center', minHeight: '60vh' }}>
      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}
        >
          <Construction size={28} color="var(--color-primary)" />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{title}</h2>
        <span className="badge badge-warning" style={{ marginBottom: '1rem' }}>
          Scheduled for Phase {phase || '2'} Implementation
        </span>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
          Phase 1 Foundation setup is complete. This core tourism feature will be connected to real MongoDB data & AI APIs in subsequent development phases per <strong>project-spec.md</strong>.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
